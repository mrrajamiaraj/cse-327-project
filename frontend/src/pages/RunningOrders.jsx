import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";

const orders = [
  { id: "32053", name: "Chicken Biryani", price: 240, image: "/src/assets/order-1.png" },
  { id: "12553", name: "Chicken Bhuna", price: 120, image: "/src/assets/order-2.png" },
  { id: "21000", name: "Beef Bhuna", price: 20, image: "/src/assets/order-3.png" },
  { id: "16327", name: "Rui Curry", price: 180, image: "/src/assets/order-4.png" },
  { id: "6844",  name: "Kacchi Biryani", price: 180, image: "/src/assets/order-5.png" },
];

export default function RunningOrders() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        padding: "18px 0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* title */}
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#c0c0c0",
            marginBottom: 8,
            paddingLeft: 6,
          }}
        >
          Running Orders
        </div>

        {/* phone frame */}
        <div
          style={{
            position: "relative",
            borderRadius: 28,
            background: "#ffffff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
            overflow: "hidden",
            minHeight: 690,
          }}
        >
          {/* fake background (dim dashboard behind) */}
          <div
            style={{
              height: 170,
              background: "#48586a",
              padding: 14,
              color: "#fff",
              opacity: 0.85,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ☰
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: 0.6,
                    color: "#ff9b4a",
                    fontWeight: 800,
                  }}
                >
                  LOCATION
                </div>
                <div style={{ fontSize: "0.75rem", marginTop: 2 }}>
                  Halal Lab office ▼
                </div>
              </div>

              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                }}
              />
            </div>

            {/* big stats faint */}
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
              }}
            >
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 18,
                  padding: 10,
                }}
              >
                <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>20</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                  RUNNING ORDERS
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 18,
                  padding: 10,
                }}
              >
                <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>05</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                  ORDER REQUEST
                </div>
              </div>
            </div>
          </div>

          {/* white popup card */}
          <div
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              top: 130,
              borderRadius: 22,
              background: "#ffffff",
              boxShadow: "0 18px 40px rgba(0,0,0,0.20)",
              padding: "14px 12px 12px",
            }}
          >
            {/* header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#333",
                  fontWeight: 600,
                }}
              >
                20 Running Order
              </div>
              <div
                style={{
                  width: 90,
                  height: 3,
                  borderRadius: 999,
                  background: "#e9e9e9",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            </div>

            {/* list */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxHeight: 470,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {orders.map((o, idx) => (
                <OrderRow key={idx} o={o} />
              ))}
            </div>
          </div>

          {/* bottom back area (tap to go back) */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              bottom: 16,
              height: 46,
              borderRadius: 22,
              border: "none",
              background: "#ffffff",
              boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
              cursor: "pointer",
              color: "#666",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ o }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      {/* image */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          overflow: "hidden",
          background: "#f2f2f2",
          flexShrink: 0,
        }}
      >
        <img
          src={o.image}
          alt={o.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            // if you didn't add images yet, this prevents crash
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      {/* text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "0.68rem",
            color: ORANGE,
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          #Lunch
        </div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#222" }}>
          {o.name}
        </div>
        <div style={{ fontSize: "0.68rem", color: "#9a9a9a" }}>ID: {o.id}</div>
        <div style={{ fontSize: "0.78rem", fontWeight: 800, marginTop: 2 }}>
          ${o.price}
        </div>
      </div>

      {/* buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{
            padding: "5px 10px",
            borderRadius: 10,
            border: "none",
            background: ORANGE,
            color: "#fff",
            fontSize: "0.7rem",
            cursor: "pointer",
          }}
        >
          Done
        </button>
        <button
          style={{
            padding: "5px 10px",
            borderRadius: 10,
            border: "1px solid #ff4c4c",
            background: "transparent",
            color: "#ff4c4c",
            fontSize: "0.7rem",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
