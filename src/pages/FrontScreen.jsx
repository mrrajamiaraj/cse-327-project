import { useState } from "react";
import { useNavigate } from "react-router-dom";

import onboarding1 from "../assets/onboarding1.png";
import onboarding2 from "../assets/onboarding2.png";
import onboarding3 from "../assets/onboarding3.png";

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
    title: "Order from choosen chef",
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

const ORANGE = "#ff7a00";

export default function FrontScreen() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = slides[step];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      navigate("/login");
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
      }}
    >
      {/* Main white card like in Figma */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#ffffff",
          borderRadius: 30,
          boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
          padding: "24px 24px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Illustration */}
        <img
          src={current.image}
          alt={current.title}
          style={{
            width: "100%",
            maxWidth: 260,
            height: "auto",
            marginBottom: 24,
          }}
        />

        {/* Text */}
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 600,
            marginBottom: 8,
            textAlign: "center",
            color: "#333",
          }}
        >
          {current.title}
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            textAlign: "center",
            color: "#888",
            marginBottom: 20,
          }}
        >
          {current.description}
        </p>

        {/* Dots */}
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          {slides.map((slide, index) => (
            <span
              key={slide.id}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  index === step ? ORANGE : "rgba(0,0,0,0.15)",
              }}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
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
            marginBottom: 6,
          }}
        >
          {current.buttonText}
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          style={{
            border: "none",
            background: "transparent",
            color: "#999",
            fontSize: "0.85rem",
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
