import React, { useState } from "react";
import axios from "axios";
import { Map, NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import logo from "./logo.png";

// Ensure mapboxgl is available globally
if (typeof window !== "undefined") {
  window.mapboxgl = mapboxgl;
}

function App() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleLiveLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        axios.post("http://localhost:8000/risk", { latitude, longitude })
          .then(res => setResults(res.data))
          .catch(err => setError(err.message || "Failed to get risk"));
      },
      (err) => {
        setError("Location denied—using Chicago center");
        axios.post("http://localhost:8000/risk", { latitude: 41.85, longitude: -87.65 })
          .then(res => setResults(res.data));
      },
      { timeout: 5000 }
    );
  };

  console.log("Rendering App component");

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
          <Map
            initialViewState={{
              latitude: 41.85,
              longitude: -87.65,
              zoom: 10
            }}
            style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken="pk.eyJ1IjoiamQycG9pbnQ0IiwiYSI6ImNtODRzdWhsMDI0dHgya29rdzhheThyYzAifQ.-plPPxJy9optiopAZdMO2A"
          >
            <NavigationControl position="top-right" />
          </Map>
        </div>
      </div>
    </div>
  );
}

export default App;