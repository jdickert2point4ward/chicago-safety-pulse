from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from risk_grid import generate_mock_risk_grid
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

    risk = int(risk_grid[lat_idx, lon_idx])  # Convert to int
    risk_score = 50 + 50 * risk

    return {
        "risk": risk,
        "risk_score": risk_score,
        "latitude": latitude,
        "longitude": longitude
    }

@app.get("/heatmap-data")
async def get_heatmap_data():
    try:
        logger.info("Generating heatmap data...")
        lat_steps, lon_steps, risk_grid = generate_mock_risk_grid()
        data = []
        for i in range(len(lat_steps) - 1):
            for j in range(len(lon_steps) - 1):
                lat = float((lat_steps[i] + lat_steps[i + 1]) / 2)  # Convert to float
                lon = float((lon_steps[j] + lon_steps[j + 1]) / 2)  # Convert to float
                risk = int(risk_grid[i, j])  # Convert numpy.int64 to int
                risk_score = 50 + 50 * risk  # 0-100 scale
                data.append({
                    "latitude": lat,
                    "longitude": lon,
                    "risk_score": risk_score
                })
        logger.info("Heatmap data generated successfully")
        return data
    except Exception as e:
        logger.error(f"Error generating heatmap data: {str(e)}")
        return {"error": str(e)}, 500