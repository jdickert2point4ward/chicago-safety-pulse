from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from risk_grid import generate_mock_risk_grid, generate_heatmap_image
from fastapi.responses import StreamingResponse
from io import BytesIO
import matplotlib.pyplot as plt
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Chicago Safety Pulse API"}

@app.post("/risk")
async def get_risk(data: dict):
    latitude = data.get("latitude", 41.85)
    longitude = data.get("longitude", -87.65)

    lat_steps, lon_steps, risk_grid = generate_mock_risk_grid()
    lat_idx = np.searchsorted(lat_steps, latitude) - 1
    lon_idx = np.searchsorted(lon_steps, longitude) - 1

    lat_idx = max(0, min(4, lat_idx))
    lon_idx = max(0, min(4, lon_idx))

    risk = int(risk_grid[lat_idx, lon_idx])
    risk_score = 50 + 50 * risk

    return {
        "risk": risk,
        "risk_score": risk_score,
        "latitude": latitude,
        "longitude": longitude
    }

@app.get("/heatmap")
async def get_heatmap():
    try:
        logger.info("Generating heatmap...")
        lat_steps, lon_steps, risk_grid = generate_mock_risk_grid()
        buf = generate_heatmap_image(risk_grid, lat_steps, lon_steps)
        logger.info("Heatmap generated successfully")
        return StreamingResponse(buf, media_type="image/png")
    except Exception as e:
        logger.error(f"Error generating heatmap: {str(e)}")
        return {"error": str(e)}, 500