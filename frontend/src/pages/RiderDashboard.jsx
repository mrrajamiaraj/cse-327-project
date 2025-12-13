// src/pages/RiderDashboard.jsx
import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";

export default function RiderDashboard() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 400, padding: "20px" }}>
        <div style={{ 
          fontSize: "3rem", 
          marginBottom: "20px",
          color: ORANGE 
        }}>
          🏍️
        </div>
        
        <h1 style={{ 
          fontSize: "1.8rem", 
          color: "#333", 
          marginBottom: "10px" 
        }}>
          Rider Dashboard
        </h1>
        
        <p style={{ 
          fontSize: "1rem", 
          color: "#666", 
          marginBottom: "30px" 
        }}>
          Welcome to the rider dashboard! This feature is coming soon.
        </p>
        
        <div style={{
          background: "white",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "20px"
        }}>
          <h3 style={{ color: "#333", marginBottom: "15px" }}>Features Coming Soon:</h3>
          <ul style={{ 
            textAlign: "left", 
            color: "#666",
            lineHeight: "1.6"
          }}>
            <li>📍 Real-time location tracking</li>
            <li>📦 Available delivery orders</li>
            <li>💰 Earnings dashboard</li>
            <li>📊 Performance analytics</li>
            <li>🗺️ Route optimization</li>
          </ul>
        </div>
        
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "12px 24px",
            background: ORANGE,
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
            marginRight: "10px"
          }}
        >
          Back to Login
        </button>
        
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "12px 24px",
            background: "#f0f0f0",
            color: "#333",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer"
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}