import os
import socket
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse
from uuid import uuid4

import joblib
import numpy as np
import pandas as pd
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


MODEL_DIR = Path(__file__).resolve().parent.parent / "models" / "pricing"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_CACHE: dict[str, dict[str, Any]] = {}

ALGORITHM_LABELS = {
    "linear_regression": "LinearRegression",
    "random_forest": "RandomForestRegressor",
    "knn": "KNeighborsRegressor",
}


class TrainRow(BaseModel):
    features: dict[str, float | int]
    target: float = Field(ge=0)


class TrainRequest(BaseModel):
    algorithm: str = Field(pattern="^(linear_regression|random_forest|knn)$")
    rows: list[TrainRow] = Field(min_length=8)
    test_size: float = Field(default=0.2, gt=0.0, lt=0.5)
    random_state: int = 42
    n_estimators: int = Field(default=200, ge=10, le=2000)
    n_neighbors: int = Field(default=5, ge=1, le=50)


class PredictRow(BaseModel):
    features: dict[str, float | int]


class PredictRequest(BaseModel):
    model_id: str = Field(min_length=8)
    rows: list[PredictRow] = Field(min_length=1)


def _select_estimator(req: TrainRequest):
    if req.algorithm == "linear_regression":
        return Pipeline(
            steps=[
                ("scaler", StandardScaler()),
                ("model", LinearRegression()),
            ]
        )

    if req.algorithm == "random_forest":
        return RandomForestRegressor(
            n_estimators=req.n_estimators,
            random_state=req.random_state,
            n_jobs=-1,
        )

    return Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("model", KNeighborsRegressor(n_neighbors=req.n_neighbors)),
        ]
    )


def _prepare_dataframe(rows: list[TrainRow | PredictRow], for_training: bool):
    features = pd.DataFrame([r.features for r in rows])
    if features.empty:
        raise HTTPException(status_code=422, detail="No hay features para procesar.")

    if features.isnull().any().any():
        raise HTTPException(status_code=422, detail="Los features contienen valores nulos.")

    for column in features.columns:
        features[column] = pd.to_numeric(features[column], errors="coerce")

    if features.isnull().any().any():
        raise HTTPException(status_code=422, detail="Todos los features deben ser numéricos.")

    if not for_training:
        return features, None

    targets = np.array([float(r.target) for r in rows], dtype=float)
    return features, targets


def _model_path(model_id: str) -> Path:
    return MODEL_DIR / f"{model_id}.joblib"


def _load_model(model_id: str) -> dict[str, Any]:
    if model_id in MODEL_CACHE:
        return MODEL_CACHE[model_id]

    model_file = _model_path(model_id)
    if not model_file.exists():
        raise HTTPException(status_code=404, detail="Modelo no encontrado.")

    artifact = joblib.load(model_file)
    MODEL_CACHE[model_id] = artifact
    return artifact


app = FastAPI(title="SoftComputing Service", version="1.0.0")


def _build_postgres_connect_kwargs(database_url: str) -> dict[str, Any]:
    parsed = urlparse(database_url)
    query = parse_qs(parsed.query)
    hostaddr = query.get("hostaddr", [None])[0] or os.environ.get("ML_DATABASE_HOSTADDR") or os.environ.get("PGHOSTADDR")

    kwargs: dict[str, Any] = {
        "dbname": parsed.path.lstrip("/") if parsed.path else None,
        "user": unquote(parsed.username) if parsed.username else None,
        "password": unquote(parsed.password) if parsed.password else None,
        "host": parsed.hostname,
        "hostaddr": hostaddr,
        "port": parsed.port or 5432,
        "connect_timeout": 5,
    }

    sslmode = query.get("sslmode", [None])[0]
    if sslmode:
        kwargs["sslmode"] = sslmode

    return {key: value for key, value in kwargs.items() if value is not None}


def _resolve_ipv4_addresses(hostname: str, port: int) -> list[str]:
    ipv4_addresses: list[str] = []

    try:
        addr_info = socket.getaddrinfo(hostname, port, socket.AF_UNSPEC, socket.SOCK_STREAM)
    except Exception:
        addr_info = []

    for family, _, _, _, sockaddr in addr_info:
        if family == socket.AF_INET:
            ip = sockaddr[0]
            if ip not in ipv4_addresses:
                ipv4_addresses.append(ip)

    if not ipv4_addresses:
        try:
            _, _, ips = socket.gethostbyname_ex(hostname)
            for ip in ips:
                if ip not in ipv4_addresses:
                    ipv4_addresses.append(ip)
        except Exception:
            pass

    return ipv4_addresses


def _test_postgres_connection_psycopg2(database_url: str) -> tuple[bool, str | None]:
    import psycopg2  # type: ignore

    base_kwargs = _build_postgres_connect_kwargs(database_url)

    try:
        with psycopg2.connect(**base_kwargs) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        return True, None
    except Exception as first_exc:
        message = str(first_exc).lower()
        hostname = base_kwargs.get("host")
        port = int(base_kwargs.get("port", 5432))
        has_hostaddr = bool(base_kwargs.get("hostaddr"))

        # Railway containers can fail on IPv6-only DNS answers; retry forcing IPv4.
        if has_hostaddr or not hostname:
            return False, str(first_exc)

        if "network is unreachable" not in message and "no route to host" not in message:
            return False, str(first_exc)

        ipv4_addresses = _resolve_ipv4_addresses(hostname, port)
        last_error: Exception | None = None

        for ipv4 in ipv4_addresses:
            try:
                ipv4_kwargs = dict(base_kwargs)
                ipv4_kwargs["hostaddr"] = ipv4

                with psycopg2.connect(**ipv4_kwargs) as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT 1")
                        cur.fetchone()
                return True, None
            except Exception as exc:
                last_error = exc
                continue

        # Optional override for Supabase pooler host (usually IPv4-friendly).
        pooler_host = os.environ.get("SUPABASE_DB_POOLER_HOST") or os.environ.get("ML_SUPABASE_DB_POOLER_HOST")
        if pooler_host:
            try:
                pooler_kwargs = dict(base_kwargs)
                pooler_kwargs["host"] = pooler_host
                pooler_kwargs.pop("hostaddr", None)

                with psycopg2.connect(**pooler_kwargs) as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT 1")
                        cur.fetchone()
                return True, None
            except Exception as exc:
                last_error = exc

        if last_error is not None:
            return False, f"{first_exc} | fallback IPv4/pooler falló: {last_error}"

        return False, str(first_exc)


def _check_database_connection() -> dict[str, Any]:
    database_url = os.environ.get("ML_SUPABASE_URL") or os.environ.get("DATABASE_URL")
    if not database_url:
        return {
            "connected": False,
            "message": "No se encontró ML_SUPABASE_URL o DATABASE_URL.",
            "engine": None,
        }

    parsed = urlparse(database_url)
    engine = parsed.scheme.split("+", 1)[0].lower()
    started = time.perf_counter()

    try:
        if engine == "sqlite":
            db_path = parsed.path or ":memory:"
            if db_path.startswith("/") and os.name == "nt" and len(db_path) > 2 and db_path[2] == ":":
                db_path = db_path[1:]

            with sqlite3.connect(db_path, timeout=5) as conn:
                conn.execute("SELECT 1")

        elif engine in {"postgres", "postgresql"}:
            try:
                import psycopg2  # type: ignore
            except Exception as exc:  # pragma: no cover
                return {
                    "connected": False,
                    "message": f"Driver no disponible para PostgreSQL: {exc}",
                    "engine": engine,
                }

            connected, error_message = _test_postgres_connection_psycopg2(database_url)
            if not connected:
                raise RuntimeError(error_message or "No fue posible validar la conexión PostgreSQL.")

        elif engine in {"mysql", "mariadb"}:
            try:
                import pymysql  # type: ignore
            except Exception as exc:  # pragma: no cover
                return {
                    "connected": False,
                    "message": f"Driver no disponible para MySQL/MariaDB: {exc}",
                    "engine": engine,
                }

            query = parse_qs(parsed.query)
            db_name = parsed.path.lstrip("/") if parsed.path else None

            conn = pymysql.connect(
                host=parsed.hostname,
                port=parsed.port or 3306,
                user=parsed.username,
                password=parsed.password,
                database=db_name,
                connect_timeout=5,
                charset=query.get("charset", ["utf8mb4"])[0],
            )
            try:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
                    cur.fetchone()
            finally:
                conn.close()

        else:
            return {
                "connected": False,
                "message": f"Motor de base de datos no soportado: {engine}",
                "engine": engine,
            }

        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        return {
            "connected": True,
            "message": "Conexión a base de datos OK.",
            "engine": engine,
            "elapsed_ms": elapsed_ms,
        }
    except Exception as exc:
        elapsed_ms = round((time.perf_counter() - started) * 1000, 2)
        return {
            "connected": False,
            "message": f"Error de conexión a BD: {exc}",
            "engine": engine,
            "elapsed_ms": elapsed_ms,
        }


@app.get("/")
def root():
    return {"ok": True, "service": "softcomputing", "version": "1.0.0"}


@app.get("/health")
def health():
    return {
        "status": "up",
        "service": "softcomputing",
        "models_dir": str(MODEL_DIR),
    }


@app.get("/dbhealth")
def db_health():
    result = _check_database_connection()
    return {
        "status": "up" if result["connected"] else "down",
        "service": "softcomputing",
        "database": result,
    }


@app.post("/api/v1/pricing/train")
def train_pricing_model(payload: TrainRequest):
    features_df, targets = _prepare_dataframe(payload.rows, for_training=True)

    if features_df.shape[1] < 1:
        raise HTTPException(status_code=422, detail="Se requiere al menos 1 feature.")

    estimator = _select_estimator(payload)

    x_train, x_test, y_train, y_test = train_test_split(
        features_df,
        targets,
        test_size=payload.test_size,
        random_state=payload.random_state,
    )

    estimator.fit(x_train, y_train)
    y_pred = estimator.predict(x_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    model_id = f"pricing_{payload.algorithm}_{uuid4().hex[:10]}"
    created_at = datetime.now(timezone.utc).isoformat()

    artifact = {
        "model": estimator,
        "feature_names": features_df.columns.tolist(),
        "algorithm": payload.algorithm,
        "created_at": created_at,
        "metrics": {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
        },
        "train_rows": int(len(x_train)),
        "test_rows": int(len(x_test)),
    }

    joblib.dump(artifact, _model_path(model_id))
    MODEL_CACHE[model_id] = artifact

    return {
        "success": True,
        "message": "Modelo de predicción de precios entrenado exitosamente.",
        "data": {
            "model_id": model_id,
            "algorithm": payload.algorithm,
            "algorithm_label": ALGORITHM_LABELS[payload.algorithm],
            "created_at": created_at,
            "feature_names": artifact["feature_names"],
            "metrics": artifact["metrics"],
            "train_rows": artifact["train_rows"],
            "test_rows": artifact["test_rows"],
        },
    }


@app.post("/api/v1/pricing/predict")
def predict_pricing(payload: PredictRequest):
    artifact = _load_model(payload.model_id)
    features_df, _ = _prepare_dataframe(payload.rows, for_training=False)

    expected_features = artifact["feature_names"]
    missing = [name for name in expected_features if name not in features_df.columns]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Faltan features requeridos: {', '.join(missing)}",
        )

    ordered_df = features_df[expected_features]
    predictions = artifact["model"].predict(ordered_df)

    return {
        "success": True,
        "message": "Predicciones generadas correctamente.",
        "data": {
            "model_id": payload.model_id,
            "algorithm": artifact["algorithm"],
            "predictions": [float(value) for value in predictions],
            "count": int(len(predictions)),
        },
    }


@app.get("/api/v1/pricing/models")
def list_models():
    models = []
    for file_path in sorted(MODEL_DIR.glob("pricing_*.joblib")):
        model_id = file_path.stem
        try:
            artifact = _load_model(model_id)
            models.append(
                {
                    "model_id": model_id,
                    "algorithm": artifact.get("algorithm"),
                    "created_at": artifact.get("created_at"),
                    "metrics": artifact.get("metrics"),
                    "feature_names": artifact.get("feature_names", []),
                }
            )
        except Exception:
            continue

    return {
        "success": True,
        "message": "Modelos listados correctamente.",
        "data": models,
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)