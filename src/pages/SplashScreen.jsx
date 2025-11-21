import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/onboarding");
    }, 2000); // 2 seconds then go to onboarding

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Logo in center */}
      <img
        src={logo}
        alt="Food logo"
        style={{ width: 140, height: "auto" }}
      />

      {/* Orange corner shape (approximation of Figma curve) */}
      <div
        style={{
          position: "absolute",
          right: -120,
          bottom: -120,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background:
            "repeating-conic-gradient(from 200deg, #ff7a00 0deg 6deg, transparent 6deg 12deg)",
        }}
      ></div>
    </div>
  );
}
