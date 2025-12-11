import { useLocation, useNavigate } from "react-router-dom";

import successImg from "../assets/payment-success.png"; 
// 👆 put your “wallet + confetti” image in assets with this name
// or change the path/name to match your file.

const ORANGE = "#ff7a00";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const total = location.state?.total;
  const orderId = location.state?.orderId;
  const status = location.state?.status;
  const bkashData = location.state?.bkashData;
  const cardData = location.state?.cardData;

  const handleTrackOrder = () => {
    // for now go to HomeScreen; change to "/orders" if you create order tracking
    navigate("/home");
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
        {/* grey small title on very top */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#b0b0b0",
            marginBottom: 10,
          }}
        >
          Payment Successfull
        </div>

        {/* main white card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "40px 18px 24px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
            textAlign: "center",
          }}
        >
          {/* image */}
          <div
            style={{
              width: 140,
              height: 140,
              margin: "0 auto 24px",
            }}
          >
            <img
              src={successImg}
              alt="Payment successful"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* text */}
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: 6,
              color: "#333",
            }}
          >
            Congratulations!
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "#888",
              marginBottom: 16,
            }}
          >
            You successfully made a payment,
            <br />
            enjoy our service!
          </div>

          {/* Order details */}
          {orderId && (
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 8,
                padding: "12px",
                marginBottom: 16,
                fontSize: "0.75rem",
              }}
            >
              <div style={{ color: "#666", marginBottom: 4 }}>
                Order ID: <span style={{ fontWeight: 600, color: "#333" }}>#{orderId}</span>
              </div>
              {total && (
                <div style={{ color: "#666", marginBottom: 4 }}>
                  Total: <span style={{ fontWeight: 600, color: "#333" }}>৳{total}</span>
                </div>
              )}
              <div style={{ color: "#666" }}>
                Status: <span style={{ fontWeight: 600, color: ORANGE }}>{status || 'Pending'}</span>
              </div>
              {bkashData && (
                <div style={{ color: "#666", marginTop: 8, padding: "8px", background: "#fce4ec", borderRadius: 4 }}>
                  <div style={{ fontWeight: 600, color: "#e2136e", marginBottom: 4 }}>
                    📱 Bkash Payment Details
                  </div>
                  <div style={{ fontSize: "0.7rem" }}>
                    Transaction ID: <span style={{ fontWeight: 600 }}>{bkashData.transactionId}</span>
                  </div>
                  <div style={{ fontSize: "0.7rem" }}>
                    From: <span style={{ fontWeight: 600 }}>{bkashData.phoneNumber}</span>
                  </div>
                </div>
              )}
              {cardData && (
                <div style={{ color: "#666", marginTop: 8, padding: "8px", background: cardData.cardType === "Visa" ? "#e3f2fd" : "#fce4ec", borderRadius: 4 }}>
                  <div style={{ fontWeight: 600, color: cardData.cardType === "Visa" ? "#1976d2" : "#d32f2f", marginBottom: 4 }}>
                    💳 {cardData.cardType} Payment Details
                  </div>
                  <div style={{ fontSize: "0.7rem" }}>
                    Transaction ID: <span style={{ fontWeight: 600 }}>{cardData.transactionId}</span>
                  </div>
                  <div style={{ fontSize: "0.7rem" }}>
                    Card: <span style={{ fontWeight: 600 }}>•••• •••• •••• {cardData.cardNumber}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TRACK ORDER button */}
          <button
            onClick={handleTrackOrder}
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
            TRACK ORDER
          </button>
        </div>
      </div>
    </div>
  );
}
