import { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  "Order delicious food from nearby restaurants.",
  "Track your order in real time.",
  "Get exclusive discounts and offers.",
];

export default function FrontScreen() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "40px 20px",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fbc2eb 100%)",
        color: "#222",
        textAlign: "center",
      }}
    >
      <div>
        <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
          CSE 327 Restaurant App
        </h1>
        <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
          Sprint 1 · Front Screen
        </p>
      </div>

      <div style={{ maxWidth: "400px" }}>
        <p style={{ fontSize: "1.2rem", fontWeight: "500" }}>{slides[step]}</p>

        <div style={{ marginTop: "12px", display: "flex", gap: "6px", justifyContent: "center" }}>
          {slides.map((_, index) => (
            <span
              key={index}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: step === index ? "#222" : "rgba(0,0,0,0.2)",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "360px" }}>
        <button
          onClick={handleNext}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "999px",
            border: "none",
            background: "#222",
            color: "#fff",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          {step < slides.length - 1 ? "Next" : "Continue to Login"}
        </button>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            fontSize: "0.9rem",
          }}
        >
          <button
            onClick={() => navigate("/login")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "999px",
              border: "1px solid #222",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate("/signup")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "999px",
              border: "1px solid #222",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
