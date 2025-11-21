import { useState } from "react";
import { useNavigate } from "react-router-dom";

import onboarding1 from "../assets/onboarding1.png";
import onboarding2 from "../assets/onboarding2.png";
import onboarding3 from "../assets/onboarding3.png";

const ORANGE = "#ff7a00";


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
  background: "#fff",
  borderRadius: 30,
  boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
  padding: "24px",
};

const slides = [
  {
    id: 1,
    title: "All your favorites",
    description:
      "Get all your loved foods in one place, you just place the order we do the rest.",
    image: onboarding1,
    buttonText: "NEXT",
  },
  {
    id: 2,
    title: "Order from chosen chef",
    description:
      "Order from your favourite chefs in one place, you just place the order we do the rest.",
    image: onboarding2,
    buttonText: "NEXT",
  },
  {
    id: 3,
    title: "Free delivery offers",
    description:
      "Get all your loved foods in one place, you just place the order we do the rest.",
    image: onboarding3,
    buttonText: "GET STARTED",
  },
];

export default function FrontScreen() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = slides[step];

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else navigate("/login");
  };

  const skip = () => navigate("/login");

  return (
    <div style={SCREEN_WRAPPER}>
      <div style={CARD_CONTAINER}>
        
        <img
          src={current.image}
          style={{
            width: "100%",
            maxWidth: 260,
            margin: "0 auto 20px auto",
          }}
        />

        <h2
          style={{
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.2rem",
            marginBottom: 8,
          }}
        >
          {current.title}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "0.9rem",
            marginBottom: 20,
          }}
        >
          {current.description}
        </p>

        {/* Dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginBottom: 20,
          }}
        >
          {slides.map((s, i) => (
            <span
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i === step ? ORANGE : "#ccc",
              }}
            />
          ))}
        </div>

        {/* NEXT BUTTON */}
        <button
          onClick={next}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 999,
            border: "none",
            background: ORANGE,
            color: "#fff",
            fontWeight: 600,
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          {current.buttonText}
        </button>

        {/* Skip */}
        <button
          onClick={skip}
          style={{
            border: "none",
            background: "transparent",
            color: "#888",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
