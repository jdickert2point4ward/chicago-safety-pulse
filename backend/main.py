from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Chicago Safety Pulse API"}