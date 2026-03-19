import os
import uvicorn
from fastapi import FastAPI

app = FastAPI(title="SoftComputing Service", version="0.1.0")

@app.get("/")
def root():
    return {"ok": True, "service": "softcomputing"}

@app.get("/health")
def health():
    return {"status": "up"}

if __name__ == "__main__":
    # Railway inyecta el puerto en la variable PORT
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)