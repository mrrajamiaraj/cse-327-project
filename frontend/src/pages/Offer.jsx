const ORANGE = "#ff7a00";

export default function Offer() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 320,
          borderRadius: 28,
          background:
            "linear-gradient(145deg, #ffb347 0%, #ff7a00 40%, #ff5e00 100%)",
          padding: "24px 20px 20px",
          color: "#fff",
          position: "relative",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 6 }}>
          Hurry Offers!
        </h2>
        <p style={{ fontSize: "0.9rem", marginBottom: 10 }}>
          Use code <strong>#1234CD2</strong>
        </p>
        <p style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: 20 }}>
          Use the coupon to get 25% discount on your first order.
        </p>

        <button
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 999,
            border: "none",
            background: "#fff",
            color: ORANGE,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          GET IT
        </button>
      </div>
    </div>
  );
}
