from fastapi import FastAPI

app = FastAPI(title="SchemaSense API")


@app.get("/")
def read_root():
    return {"message": "Under Construction"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
