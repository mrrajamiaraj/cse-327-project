import { useNavigate } from "react-router-dom";
import locationImg from "../assets/location.png";

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
  background: "#ffffff",
  borderRadius: 30,
  boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "26px 24px 24px",
};

export default function LocationAccess() {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/home");
  };

  return (
    <div style={SCREEN_WRAPPER}>
      <div style={CARD_CONTAINER}>
        <img
          src={locationImg}
          alt="Location map"
          style={{
            width: 180,
            height: 180,
            borderRadius: 40,
            objectFit: "cover",
            marginBottom: 32,
            marginTop: 20,
          }}
        />

        <button
          onClick={goToHome}
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
            marginBottom: 16,
          }}
        >
          ACCESS LOCATION
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#777",
            marginTop: 8,
            padding: "0 10px",
          }}
        >
          DFOOD WILL ACCESS YOUR LOCATION ONLY WHILE USING THE APP
        </p>
      </div>
    </div>
  );
}
