import React, { useState, useEffect } from "react";
import axios from "axios";
import { Map, NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import logo from "./logo.png";
import { DeckGL } from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/layers";

// Ensure mapboxgl is available globally
if (typeof window !== "undefined") {
  window.mapboxgl = mapboxgl;
}

function App() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  const handleLiveLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        axios.post("http://localhost:8000/risk", { latitude, longitude })
          .then(res => {
            setResults(res.data);
            updateHeatmap(latitude, longitude); // Update heatmap based on location
          })
          .catch(err => setError(err.message || "Failed to get risk"));
      },
      (err) => {
        setError("Location denied—using Chicago center");
        axios.post("http://localhost:8000/risk", { latitude: 41.85, longitude: -87.65 })
          .then(res => {
            setResults(res.data);
            updateHeatmap(41.85, -87.65); // Update heatmap with Chicago center
          });
      },
      { timeout: 5000 }
    );
  };

  // Mock heatmap data based on the 5x5 grid (to be refined later)
  const updateHeatmap = (latitude, longitude) => {
    const latMin = 41.64;
    const latMax = 42.06;
    const lonMin = -87.94;
    const lonMax = -87.52;
    const data = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const lat = latMin + (i * (latMax - latMin) / 5);
        const lon = lonMin + (j * (lonMax - lonMin) / 5);
        data.push({
          position: [lon, lat],
          intensity: Math.random() * 10 + (i === 2 && j === 2 ? 20 : 0) // Higher intensity at center
        });
      }
    }
    setHeatmapData(data);
  };

  useEffect(() => {
    // Initialize heatmap with Chicago center
    updateHeatmap(41.85, -87.65);
  }, []);

  const layers = [
    new HeatmapLayer({
      id: "heatmap-layer",
      data: heatmapData,
      getPosition: d => d.position,
      getWeight: d => d.intensity,
      radiusPixels: 30,
      intensity: 1,
      threshold: 0.05,
    }),
  ];

  return (
    <div className="App">
      <header>
        <img src={logo} alt="TruLight Logo" className="logo" />
        <button onClick={handleLiveLocation}>Check Safety</button>
      </header>
      {error && <p className="error">{error}</p>}
      <div className="content">
        <div className="risk-display">
          {results ? (
            <>
              <div className={`risk-circle ${results.risk === 1 ? "high" : "low"}`}>
                <span>{results.risk === 1 ? "High" : "Low"}</span>
              </div>
              <p>Risk Score: {results.risk_score.toFixed(1)}%</p>
              <p>Location: {results.latitude.toFixed(4)}, {results.longitude.toFixed(4)}</p>
            </>
          ) : (
            <p>Tap map or button to check risk</p>
          )}
        </div>
        <div className="map-container">
          <DeckGL
            initialViewState={{
              latitude: 41.85,
              longitude: -87.65,
              zoom: 10,
              bearing: 0,
              pitch: 0,
            }}
            controller={true}
            layers={layers}
          >
            <Map
              mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken="pk.eyJ1IjoiamQycG9pbnQ0IiwiYSI6ImNtODRzdWhsMDI0dHgya29rdzhheThyYzAifQ.-plPPxJy9optiopAZdMO2A"
            >
              <NavigationControl position="top-right" />
            </Map>
          </DeckGL>
        </div>
      </div>
    </div>
  );
}

export default App;