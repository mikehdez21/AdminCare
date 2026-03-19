from fastapi import FastAPI

app = FastAPI(title="SoftComputing Service", version="0.1.0")

@app.get("/")
def root():
    return {"ok": True, "service": "softcomputing"}

@app.get("/health")
def health():
    return {"status": "up"}