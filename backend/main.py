from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
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

    # Mock risk calculation (replace with real model later)
    risk = np.random.randint(0, 2)
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
        # Define Chicago bounds
        lat_min, lat_max = 41.64, 42.06
        lon_min, lon_max = -87.94, -87.52

        # Generate 500 random points with mock risk scores
        num_points = 500
        latitudes = np.random.uniform(lat_min, lat_max, num_points)
        longitudes = np.random.uniform(lon_min, lon_max, num_points)
        risk_scores = np.random.uniform(0, 100, num_points)  # 0-100 scale

        data = [
            {
                "latitude": float(lat),
                "longitude": float(lon),
                "risk_score": float(risk)
            }
            for lat, lon, risk in zip(latitudes, longitudes, risk_scores)
        ]
        logger.info("Heatmap data generated successfully")
        return data
    except Exception as e:
        logger.error(f"Error generating heatmap data: {str(e)}")
        return {"error": str(e)}, 500