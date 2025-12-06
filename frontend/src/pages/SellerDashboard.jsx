// src/pages/SellerDashboard.jsx
import popular1 from "../assets/seller-popular-1.png"; // change path/name if needed
import popular2 from "../assets/seller-popular-2.png";

const ORANGE = "#ff7a00";

const mockDashboardData = {
  location: "Halal Lab office",
  runningOrders: 20,
  orderRequests: 5,
  totalRevenue: 5000,
  revenuePeriod: "Daily",
  reviews: {
    rating: 4.9,
    count: 20,
  },
  popularItems: [
    {
      id: 1,
      name: "Beef Curry",
      image: popular1,
    },
    {
      id: 2,
      name: "Chicken Masala",
      image: popular2,
    },
  ],
};

export default function SellerDashboard() {
  const data = mockDashboardData;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f4f4f4",
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "0 16px 16px",
        }}
      >
        {/* grey page title */}
        <div
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            color: "#b3b3b3",
            marginBottom: 10,
          }}
        >
          Seller Dashboard Home
        </div>

        {/* main rounded card */}
        <div
          style={{
            borderRadius: 32,
            background: "#ffffff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
            padding: "16px 14px 72px", // extra bottom for nav bar
            position: "relative",
          }}
        >
          {/* top: location row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {/* left menu icon */}
            <button
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "none",
                background: "#f2f3f7",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
              }}
            >
              ☰
            </button>

            {/* location text */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: 0.5,
                  color: ORANGE,
                  fontWeight: 600,
                }}
              >
                LOCATION
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  marginTop: 2,
                  color: "#444",
                }}
              >
                {data.location} ▼
              </div>
            </div>

            {/* right profile circle */}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#e0e3ee",
              }}
            />
          </div>

          {/* stats row: running orders & order request */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <StatCard
              value={data.runningOrders}
              label="RUNNING ORDERS"
            />
            <StatCard
              value={data.orderRequests}
              label="ORDER REQUEST"
            />
          </div>

          {/* revenue card */}
          <div
            style={{
              background: "#f7f8fc",
              borderRadius: 18,
              padding: "10px 10px 12px",
              marginBottom: 14,
            }}
          >
            {/* header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#9a9a9a",
                  }}
                >
                  Total Revenue
                </div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    marginTop: 2,
                  }}
                >
                  ৳{data.totalRevenue}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.7rem",
                }}
              >
                <select
                  value={data.revenuePeriod}
                  readOnly
                  style={{
                    borderRadius: 12,
                    border: "1px solid #e2e4f0",
                    padding: "3px 10px",
                    fontSize: "0.7rem",
                    background: "#fff",
                    outline: "none",
                    color: "#555",
                  }}
                >
                  <option>{data.revenuePeriod}</option>
                </select>
                <button
                  style={{
                    border: "none",
                    background: "transparent",
                    color: ORANGE,
                    cursor: "pointer",
                  }}
                >
                  See Details
                </button>
              </div>
            </div>

            {/* simple fake chart to match UI */}
            <div
              style={{
                marginTop: 4,
                paddingTop: 8,
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 80,
                  borderRadius: 16,
                  background:
                    "linear-gradient(180deg,#ffe6d1 0%, #ffffff 70%)",
                  overflow: "hidden",
                }}
              >
                {/* line path using simple SVG */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 30 C15 25 25 20 35 24 C45 28 55 18 65 22 C75 26 85 16 100 20"
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth="2"
                  />
                </svg>

                {/* revenue dot + label */}
                <div
                  style={{
                    position: "absolute",
                    left: "40%",
                    top: "32%",
                    transform: "translate(-50%, -50%)",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: ORANGE,
                    boxShadow: "0 0 0 4px rgba(255,122,0,0.25)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "40%",
                    top: "12%",
                    transform: "translateX(-50%)",
                    padding: "2px 8px",
                    borderRadius: 8,
                    background: "#111",
                    color: "#fff",
                    fontSize: "0.65rem",
                  }}
                >
                  ৳5k
                </div>

                {/* x-axis labels */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    left: 8,
                    right: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.55rem",
                    color: "#b0b0b0",
                  }}
                >
                  <span>10AM</span>
                  <span>11AM</span>
                  <span>12PM</span>
                  <span>01PM</span>
                  <span>02PM</span>
                  <span>03PM</span>
                  <span>04PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* reviews card */}
          <div
            style={{
              background: "#f9fafc",
              borderRadius: 18,
              padding: "10px 10px 10px",
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  marginBottom: 6,
                }}
              >
                Reviews
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.8rem",
                }}
              >
                <span style={{ color: "#ffb400", fontSize: "1rem" }}>★</span>
                <span style={{ fontWeight: 600 }}>{data.reviews.rating}</span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#9a9a9a",
                  }}
                >
                  Total {data.reviews.count} Reviews
                </span>
              </div>
            </div>

            <button
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.7rem",
                color: ORANGE,
                cursor: "pointer",
              }}
            >
              See All Reviews
            </button>
          </div>

          {/* popular items */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                }}
              >
                Popular Items This Weeks
              </div>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "0.7rem",
                  color: ORANGE,
                  cursor: "pointer",
                }}
              >
                See All
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              {data.popularItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    flex: 1,
                    borderRadius: 18,
                    background: "#f7f8fc",
                    overflow: "hidden",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      height: 90,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      padding: "6px 8px 8px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* bottom nav bar */}
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#f7f8fc",
        borderRadius: 18,
        padding: "10px 10px",
      }}
    >
      <div
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: 2,
        }}
      >
        {value.toString().padStart(2, "0")}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "#9a9a9a",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function BottomNav() {
  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 8,
        height: 54,
        borderRadius: 26,
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        fontSize: "1.1rem",
      }}
    >
      <button style={navButtonStyle}>▦</button>
      <button style={navButtonStyle}>≡</button>

      {/* center plus – active */}
      <button
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `2px solid ${ORANGE}`,
          background: "#fffaf6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ORANGE,
          fontSize: "1.3rem",
          marginTop: -20,
          boxShadow: "0 4px 12px rgba(255,122,0,0.4)",
        }}
      >
        +
      </button>

      <button style={navButtonStyle}>🔔</button>
      <button style={navButtonStyle}>👤</button>
    </div>
  );
}

const navButtonStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
};
