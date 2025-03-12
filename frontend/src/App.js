import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import logo from "./logo.png";

if (typeof window !== "undefined") {
  window.mapboxgl = mapboxgl;
}

function App() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const mapContainer = useRef(null);
  const map = useRef(null);

  const updateHeatmap = () => {
    axios.get("http://localhost:8000/heatmap-data").then((res) => {
      const data = res.data;
      const source = map.current.getSource("safety-data");
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: data.map((point) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [point.longitude, point.latitude],
            },
            properties: {
              risk_score: point.risk_score,
            },
          })),
        });
      }
    });
  };

  const handleLiveLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        axios
          .post("http://localhost:8000/risk", { latitude, longitude })
          .then((res) => {
            setResults(res.data);
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 12,
              pitch: 45,
              bearing: 30,
            });
            updateHeatmap();
          })
          .catch((err) => setError(err.message || "Failed to get risk"));
      },
      (err) => {
        setError("Location denied—using Chicago center");
        axios
          .post("http://localhost:8000/risk", { latitude: 41.85, longitude: -87.65 })
          .then((res) => {
            setResults(res.data);
            map.current.flyTo({
              center: [-87.65, 41.85],
              zoom: 12,
              pitch: 45,
              bearing: 30,
            });
            updateHeatmap();
          });
      },
      { timeout: 5000 }
    );
  };

  useEffect(() => {
    mapboxgl.accessToken = "pk.eyJ1IjoiamQycG9pbnQ0IiwiYSI6ImNtODRzdWhsMDI0dHgya29rdzhheThyYzAifQ.-plPPxJy9optiopAZdMO2A";
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-87.65, 41.85],
      zoom: 10,
      pitch: 45,
      bearing: 30,
      fog: {
        range: [0.5, 10],
        color: "rgba(255, 255, 255, 0.5)",
        "high-color": "rgba(255, 255, 255, 0.3)",
        "horizon-blend": 0.1
      }
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      axios.get("http://localhost:8000/heatmap-data").then((res) => {
        const data = res.data;
        map.current.addSource("safety-data", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: data.map((point) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [point.longitude, point.latitude],
              },
              properties: {
                risk_score: point.risk_score,
              },
            })),
          },
        });

        map.current.addLayer({
          id: "safety-heatmap",
          type: "heatmap",
          source: "safety-data",
          paint: {
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "risk_score"],
              0,
              0,
              100,
              1,
            ],
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              12,
              3,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(0, 128, 0, 0)", // Green (low risk)
              0.3,
              "rgb(0, 128, 0)", // Green
              0.5,
              "rgb(255, 255, 0)", // Yellow (moderate risk)
              0.7,
              "rgb(255, 165, 0)", // Orange
              1,
              "rgb(255, 0, 0)", // Red (high risk)
            ],
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              20,
              12,
              60,
            ],
            "heatmap-opacity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              7,
              1,
              12,
              0.7,
            ],
          },
        });

        map.current.addLayer({
          id: "safety-points",
          type: "circle",
          source: "safety-data",
          minzoom: 12,
          paint: {
            "circle-radius": 5,
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "risk_score"],
              0,
              "rgb(0, 128, 0)", // Green
              50,
              "rgb(255, 255, 0)", // Yellow
              100,
              "rgb(255, 0, 0)", // Red
            ],
            "circle-opacity": 0.8,
          },
        });

        map.current.on("click", "safety-points", (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const riskScore = e.features[0].properties.risk_score;
          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`<h3>Risk Score: ${riskScore.toFixed(1)}</h3>`)
            .addTo(map.current);
        });

        map.current.on("mouseenter", "safety-points", () => {
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "safety-points", () => {
          map.current.getCanvas().style.cursor = "";
        });

        const legend = document.createElement("div");
        legend.className = "map-legend";
        legend.innerHTML = `
          <h4>Risk Levels</h4>
          <div class="legend-item"><span style="background: rgb(0, 128, 0);"></span>Low Risk (0-30)</div>
          <div class="legend-item"><span style="background: rgb(255, 255, 0);"></span>Moderate Risk (30-70)</div>
          <div class="legend-item"><span style="background: rgb(255, 0, 0);"></span>High Risk (70-100)</div>
        `;
        map.current.getContainer().appendChild(legend);
      });
    });

    // Simulate live updates every 10 seconds
    const interval = setInterval(() => {
      updateHeatmap();
    }, 10000);

    return () => {
      clearInterval(interval);
      map.current.remove();
    };
  }, []);

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
          <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
        </div>
      </div>
    </div>
  );
}

export default App;