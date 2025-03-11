import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

def generate_mock_risk_grid():
    # Define grid boundaries for Chicago
    lat_min, lat_max = 41.64, 42.06
    lon_min, lon_max = -87.94, -87.52
    
    # Create 5x5 grid
    lat_steps = np.linspace(lat_min, lat_max, 6)
    lon_steps = np.linspace(lon_min, lon_max, 6)
    
    # Mock risk scores (0 = low risk, 1 = high risk)
    risk_grid = np.random.randint(0, 2, size=(5, 5))
    
    return lat_steps, lon_steps, risk_grid

def generate_heatmap_image(risk_grid, lat_steps, lon_steps):
    # Create a figure for the heatmap
    fig, ax = plt.subplots()
    im = ax.imshow(risk_grid, cmap='RdYlGn_r', interpolation='bilinear', aspect='auto',
                  extent=[lon_steps[0], lon_steps[-1], lat_steps[0], lat_steps[-1]])
    plt.colorbar(im, ax=ax, label='Risk Level (0 = Low, 1 = High)')
    ax.set_xlabel('Longitude')
    ax.set_ylabel('Latitude')
    ax.set_title('Chicago Safety Heatmap')

    # Save the figure to a buffer
    fig.canvas.draw()
    image = Image.frombytes('RGB', fig.canvas.get_width_height(), fig.canvas.tostring_rgb())
    plt.close(fig)

    # Save to a temporary buffer (for streaming)
    buf = BytesIO()
    image.save(buf, format='PNG')
    buf.seek(0)
    return buf

if __name__ == "__main__":
    lat_steps, lon_steps, risk_grid = generate_mock_risk_grid()
    heatmap_image = generate_heatmap_image(risk_grid, lat_steps, lon_steps)
    with open('heatmap.png', 'wb') as f:
        f.write(heatmap_image.getbuffer())
    print("Heatmap image generated as 'heatmap.png'")