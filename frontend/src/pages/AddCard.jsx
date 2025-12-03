import { useNavigate } from "react-router-dom";

export default function AddCard() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f2f2f2",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 30,
          boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
          padding: "20px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Add Card</h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
          Add your payment card details
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 999,
            border: "none",
            background: "#ff7a00",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
