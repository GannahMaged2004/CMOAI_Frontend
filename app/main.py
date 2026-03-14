from fastapi import FastAPI

app = FastAPI(title="CMO.ai API")

@app.get("/health")
def health_check():
    return {"status": "ok"}
