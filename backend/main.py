from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from risk_grid import generate_mock_risk_grid

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Generate mock risk grid on startup
lat_steps, lon_steps, risk_grid = generate_mock_risk_grid()

@app.get("/")
async def root():
    return {"message": "Chicago Safety Pulse API"}

@app.post("/risk")
async def get_risk(data: dict):
    latitude = data.get("latitude", 41.85)
    longitude = data.get("longitude", -87.65)

    # Find the grid cell for the given coordinates
    lat_idx = np.searchsorted(lat_steps, latitude) - 1
    lon_idx = np.searchsorted(lon_steps, longitude) - 1

    # Clamp indices to grid bounds
    lat_idx = max(0, min(4, lat_idx))
    lon_idx = max(0, min(4, lon_idx))

    risk = int(risk_grid[lat_idx, lon_idx])  # Convert numpy.int64 to Python int
    risk_score = 50 + 50 * risk  # 50% base, 100% if high risk

    return {
        "risk": risk,
        "risk_score": risk_score,
        "latitude": latitude,
        "longitude": longitude
    }