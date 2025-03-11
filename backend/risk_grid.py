import numpy as np

def generate_mock_risk_grid():
    # Define grid boundaries for Chicago
    lat_min, lat_max = 41.64, 42.06
    lon_min, lon_max = -87.94, -87.52
    
    # Create 5x5 grid
    lat_steps = np.linspace(lat_min, lat_max, 6)
    lon_steps = np.linspace(lon_min, lon_max, 6)
    
    # Mock risk scores (1 = high, 0 = low, random distribution)
    risk_grid = np.random.randint(0, 2, size=(5, 5))
    
    return lat_steps, lon_steps, risk_grid

if __name__ == "__main__":
    lat_steps, lon_steps, risk_grid = generate_mock_risk_grid()
    print("Latitude steps:", lat_steps)
    print("Longitude steps:", lon_steps)
    print("Risk grid:\n", risk_grid)