import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const ORANGE = "#ff7a00";

export default function AddCard() {
  const navigate = useNavigate();
  const location = useLocation();

  // get total from payment (optional, just to show or log)
  const total = location.state?.total ?? 1160;

  const [holder, setHolder] = useState("Md. Raja Mia Raj");
  const [number, setNumber] = useState("2134");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const cardData = { holder, number, expiry, cvc };
    console.log("New card added:", cardData, "Total:", total);

    alert("Card added & payment completed! (demo)");

    // go back to previous screen – you can change to /home or /payment
    navigate(-1);
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f2f2f2",
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 32,
          background: "#ffffff",
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          padding: "16px 16px 20px",
        }}
      >
        {/* grey top title */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#b0b0b0",
            marginBottom: 10,
          }}
        >
          Add Card
        </div>

        {/* inner white panel */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: "14px 12px 18px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          }}
        >
          {/* small pill with X and Add Card */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              border: "1px solid #d9dde8",
              padding: "4px 10px 4px 4px",
              marginBottom: 16,
              fontSize: "0.75rem",
              color: "#555",
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "none",
                background: "#f2f3f7",
                cursor: "pointer",
                fontSize: "0.7rem",
              }}
            >
              ✕
            </button>
            <span>Add Card</span>
          </div>

          {/* CARD HOLDER NAME */}
          <FieldLabel label="CARD HOLDER NAME" />
          <InputBox
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            placeholder="Name on card"
          />

          {/* CARD NUMBER */}
          <FieldLabel label="CARD NUMBER" />
          <InputBox
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="2134 •••• ••••"
          />

          {/* EXPIRE DATE + CVC */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 6,
              marginBottom: 14,
            }}
          >
            <div style={{ flex: 1 }}>
              <FieldLabel label="EXPIRE DATE" />
              <InputBox
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="mm/yyyy"
              />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel label="CVC" />
              <InputBox
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="•••"
              />
            </div>
          </div>

          {/* ADD & MAKE PAYMENT button */}
          <button
            type="submit"
            style={{
              marginTop: 8,
              width: "100%",
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: ORANGE,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            ADD & MAKE PAYMENT
          </button>
        </form>
      </div>
    </div>
  );
}

function FieldLabel({ label }) {
  return (
    <div
      style={{
        fontSize: "0.7rem",
        color: "#a0a0a0",
        marginBottom: 4,
        marginTop: 6,
      }}
    >
      {label}
    </div>
  );
}

function InputBox(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "9px 11px",
        borderRadius: 8,
        border: "none",
        background: "#f4f6fb",
        fontSize: "0.8rem",
        outline: "none",
      }}
    />
  );
}
