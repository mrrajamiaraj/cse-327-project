// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Import the API helper (adjust path if needed)

const ORANGE = "#ff7a00";
const DARK = "#0c1022";

const SCREEN_WRAPPER = {
  width: "100vw",
  height: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const CARD_CONTAINER = {
  width: "100%",
  maxWidth: 360,
  minHeight: 600,
  background: "#ffffff",
  borderRadius: 30,
  boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#f5f7fb",
  fontSize: "0.85rem",
  outline: "none",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("auth/login/", { email, password });
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Role-based redirection
      const userRole = response.data.user.role;
      console.log("User role:", userRole);
      
      switch (userRole) {
        case 'customer':
          navigate("/location"); // Customer goes to location then home
          break;
        case 'restaurant':
          navigate("/seller-dashboard"); // Restaurant owner goes to seller dashboard
          break;
        case 'rider':
          navigate("/rider-dashboard"); // Rider goes to rider dashboard
          break;
        case 'admin':
          navigate("/admin-dashboard"); // Admin goes to admin dashboard
          break;
        default:
          navigate("/home"); // Fallback to home
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid credentials. Please try again.";
      setError(msg);
    }
  };

  return (
    <div style={SCREEN_WRAPPER}>
      <div style={CARD_CONTAINER}>
        {/* Top dark header */}
        <div
          style={{
            background: DARK,
            color: "#fff",
            padding: "18px 20px 24px",
            position: "relative",
          }}
        >
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              left: 16,
              top: 18,
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            ‹
          </button>

          <h2
            style={{
              textAlign: "center",
              fontSize: "1.3rem",
              marginBottom: 4,
            }}
          >
            Log In
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Please sign in to your existing account
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px 22px", flex: 1 }}>
          {error && (
            <p style={{ color: "red", fontSize: "0.85rem", marginBottom: 10, textAlign: "center" }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#999",
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#999",
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                style={inputStyle}
              />
            </div>

            {/* Log in button */}
            <button
              type="submit"
                style={{
                marginTop: 10,
                width: "100%",
                padding: "12px",
                borderRadius: 999,
                border: "none",
                background: ORANGE,
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                opacity: 1,
              }}
            >
              "LOG IN"
            </button>
          </form>

          {/* Sign up link */}
          <p
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: "0.8rem",
              color: "#777",
            }}
          >
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{
                border: "none",
                background: "transparent",
                color: ORANGE,
                cursor: "pointer",
                padding: 0,
                fontWeight: 600,
              }}
            >
              SIGN UP
            </button>
          </p>

          {/* Social icons row */}
          <div
            style={{
              marginTop: 10,
              textAlign: "center",
              fontSize: "0.8rem",
              color: "#aaa",
            }}
          >
            Or
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginBottom: 4,
            }}
          >
            {["f", "t", "★"].map((label) => (
              <div
                key={label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#555",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}