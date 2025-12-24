// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Make sure you have this file

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

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }


    try {
      const response = await api.post("auth/register/", {
        first_name: name,
        email: email,
        phone: phone,
        password: password,
        role: "customer", // Forces customer only
      });

      // Save login data
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Go to location access
      navigate("/location");
    } catch (err) {
      // Debug: Log the full error response
      console.log("Full error object:", err);
      console.log("Error response:", err.response);
      console.log("Error response data:", err.response?.data);

      // Backend returns errors in the 'error' field
      const msg = err.response?.data?.error ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.detail ||
        "Signup failed. Please try again.";
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
          {/* Back button */}
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
            ←
          </button>

          <h2
            style={{
              textAlign: "center",
              fontSize: "1.3rem",
              marginBottom: 4,
            }}
          >
            Sign Up
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Please sign up to get started
          </p>
        </div>

        {/* Form body */}
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
                NAME
              </label>
              <input
                type="text"
                placeholder="john doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                PHONE NUMBER
              </label>
              <input
                type="tel"
                placeholder="+880 1XXX-XXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                minLength="8"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#999",
                }}
              >
                RE-TYPE PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
                style={{
                width: "100%",
                padding: "12px",
                borderRadius: 999,
                border: "none",
                background: ORANGE,
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                opacity: loading ? 0.8 : 1,
              }}
            >
              "SIGN UP"
            </button>
          </form>

          {/* Login link */}
          <p
            style={{
              marginTop: 20,
              textAlign: "center",
              fontSize: "0.85rem",
              color: "#777",
            }}
          >
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: ORANGE,
                fontWeight: 600,
                cursor: "pointer",
                padding: 0,
              }}
            >
              LOG IN
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}