import { useNavigate } from "react-router-dom";

export default function LocationAccess() {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/home");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}
      >
        <h2>Allow Location Access</h2>
        <p style={{ marginTop: "8px", fontSize: "0.9rem", color: "#555" }}>
          We use your location to show nearby restaurants and accurate delivery
          time.
        </p>

        <div
          style={{
            marginTop: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={goToHome}
            style={{
              padding: "10px",
              borderRadius: "999px",
              border: "none",
              background: "#222",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Allow Location (Mock)
          </button>
          <button
            onClick={goToHome}
            style={{
              padding: "10px",
              borderRadius: "999px",
              border: "1px solid #222",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Enter Location Manually
          </button>
        </div>
      </div>
    </div>
  );
}
