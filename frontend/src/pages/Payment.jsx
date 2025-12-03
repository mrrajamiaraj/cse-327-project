import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const ORANGE = "#ff7a00";
const METHODS = ["Cash", "Visa", "Mastercard", "Paypal"];

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // total coming from Cart (fallback so it never crashes)
  const total = location.state?.total ?? 1160;

  const [method, setMethod] = useState("Mastercard");

  // pretend we already have one saved Mastercard
  const [cards] = useState([
    { id: 1, label: "Master Card", last4: "436" },
  ]);
  const [selectedCardId] = useState(cards[0]?.id ?? null);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;

  const handleConfirm = () => {
    console.log("PAY & CONFIRM", {
      method,
      card: selectedCard,
      total,
    });
    alert("Payment confirmed! (demo)");
  };

  const handleAddNew = () => {
    navigate("/add-card", { state: { total } });
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
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "#f2f3f7",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ←
          </button>
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#555",
            }}
          >
            Payment
          </span>
        </div>

        {/* Payment methods row */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: 8,
            paddingBottom: 8,
            marginBottom: 16,
          }}
        >
          {METHODS.map((m) => {
            const active = m === method;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                style={{
                  minWidth: 80,
                  padding: "10px 6px 6px",
                  borderRadius: 14,
                  border: active ? `2px solid ${ORANGE}` : "1px solid #e4e6f0",
                  background: active ? "#fff7f0" : "#f6f7fb",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontSize: "0.75rem",
                  position: "relative",
                }}
              >
                {/* simple colored chip instead of real logo */}
                <div
                  style={{
                    width: 32,
                    height: 22,
                    borderRadius: 6,
                    marginBottom: 4,
                    background:
                      m === "Cash"
                        ? "#ffc36b"
                        : m === "Visa"
                        ? "#2a4fbf"
                        : m === "Mastercard"
                        ? "linear-gradient(90deg,#ff5b5b,#ffb347)"
                        : "#00bcd4",
                  }}
                />
                <span>{m}</span>

                {active && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: ORANGE,
                      border: "2px solid #fff",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Saved card dropdown (for Mastercard) */}
        <div
          style={{
            background: "#f6f7fb",
            borderRadius: 12,
            padding: "8px 10px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#444",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 16,
                  borderRadius: 4,
                  background:
                    "linear-gradient(90deg,#ff5b5b 0%, #ffb347 100%)",
                }}
              />
              <span>{selectedCard ? selectedCard.label : "Master Card"}</span>
            </div>
            {/* fake dropdown arrow */}
            <span
              style={{
                fontSize: "0.9rem",
                color: "#555",
              }}
            >
              ▾
            </span>
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              color: "#777",
            }}
          >
            {selectedCard ? (
              <>
                •••• •••• •••• {selectedCard.last4}
              </>
            ) : (
              "No card selected"
            )}
          </div>
        </div>

        {/* + ADD NEW big bordered box */}
        <button
          type="button"
          onClick={handleAddNew}
          style={{
            width: "100%",
            height: 60,
            borderRadius: 10,
            border: `2px solid ${ORANGE}`,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.8rem",
            color: ORANGE,
            fontWeight: 600,
            marginBottom: 24,
            cursor: "pointer",
          }}
        >
          + ADD NEW
        </button>

        {/* Total row */}
        <div
          style={{
            fontSize: "0.85rem",
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#a0a0a0", marginRight: 4 }}>TOTAL:</span>
          <span style={{ fontWeight: 700 }}>৳{total}</span>
        </div>

        {/* PAY & CONFIRM */}
        <button
          onClick={handleConfirm}
          style={{
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
          PAY & CONFIRM
        </button>
      </div>
    </div>
  );
}
