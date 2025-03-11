import React from 'react';
import logo from './logo.png'; // Add your TruLight logo here
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <img src={logo} alt="TruLight Logo" className="logo" />
        <button>Check Safety</button>
      </header>
      <div className="content">
        <div className="risk-display">
          <p>Tap map or button to check risk</p>
        </div>
        <div className="map-placeholder">
          <p>Map will go here</p>
        </div>
      </div>
    </div>
  );
}

export default App;