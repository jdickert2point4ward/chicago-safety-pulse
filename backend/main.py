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

    # Simulate risk based on location (e.g., higher risk downtown, lower over lakes)
    risk_score = calculate_risk(latitude, longitude)

    # Mock risk classification (0 = low, 1 = high)
    risk = 1 if risk_score > 50 else 0

    return {
        "risk": risk,
        "risk_score": risk_score,
        "latitude": latitude,
        "longitude": longitude
    }

def calculate_risk(latitude: float, longitude: float) -> float:
    """
    Simulate a risk score (0-100) based on geographic and demographic factors.
    Replace with your real model logic later.
    """
    # Define Chicago bounds
    lat_min, lat_max = 41.64, 42.06
    lon_min, lon_max = -87.94, -87.52

    # Lake Michigan approximate bounds (simplified)
    lake_michigan = {
        "lat_min": 41.64,
        "lat_max": 42.06,
        "lon_min": -87.60,  # Eastern edge of Chicago (lake starts here)
        "lon_max": -87.40
    }

    # Downtown Chicago (higher risk area, e.g., The Loop)
    downtown = {
        "lat_min": 41.87,
        "lat_max": 41.90,
        "lon_min": -87.65,
        "lon_max": -87.62
    }

    # Base risk score
    base_risk = 50.0

    # Adjust risk based on location
    if (lake_michigan["lat_min"] <= latitude <= lake_michigan["lat_max"] and
        lake_michigan["lon_min"] <= longitude <= lake_michigan["lon_max"]):
        # Low risk over Lake Michigan
        base_risk -= 40  # Reduce risk significantly
    elif (downtown["lat_min"] <= latitude <= downtown["lat_max"] and
          downtown["lon_min"] <= longitude <= downtown["lon_max"]):
        # Higher risk downtown
        base_risk += 30  # Increase risk
    else:
        # Moderate risk elsewhere, with some random variation
        base_risk += np.random.uniform(-10, 10)

    # Clamp risk score to 0-100
    risk_score = max(0, min(100, base_risk))
    return risk_score

@app.get("/heatmap-data")
async def get_heatmap_data():
    try:
        logger.info("Generating heatmap data...")
        # Define Chicago bounds
        lat_min, lat_max = 41.64, 42.06
        lon_min, lon_max = -87.94, -87.52

        # Generate 1000 points with realistic risk scores
        num_points = 1000
        latitudes = np.random.uniform(lat_min, lat_max, num_points)
        longitudes = np.random.uniform(lon_min, lon_max, num_points)

        data = []
        for lat, lon in zip(latitudes, longitudes):
            risk_score = calculate_risk(lat, lon)
            data.append({
                "latitude": float(lat),
                "longitude": float(lon),
                "risk_score": float(risk_score)
            })

        logger.info("Heatmap data generated successfully")
        return data
    except Exception as e:
        logger.error(f"Error generating heatmap data: {str(e)}")
        return {"error": str(e)}, 500