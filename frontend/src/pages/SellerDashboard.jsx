import { useNavigate } from "react-router-dom";
import popular1 from "../assets/seller-popular-1.png";
import popular2 from "../assets/seller-popular-2.png";

const ORANGE = "#ff7a00";

export default function SellerDashboard() {
  const navigate = useNavigate();

  const data = {
    location: "Halal Lab office",
    runningOrders: 20,
    orderRequests: 5,
    totalRevenue: 5000,
    reviews: { rating: 4.9, count: 20 },
    popularItems: [
      { id: 1, name: "Beef Curry", image: popular1 },
      { id: 2, name: "Chicken Masala", image: popular2 },
    ],
  };

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={pageTitle}>Seller Dashboard Home</div>

        <div style={phoneCard}>
          {/* HEADER */}
          <div style={headerRow}>
            <CircleBtn>☰</CircleBtn>

            <div style={{ textAlign: "center" }}>
              <div style={locationLabel}>LOCATION</div>
              <div style={locationText}>{data.location} ▼</div>
            </div>

            <div style={avatar} />
          </div>

          {/* STATS */}
          <div style={{ display: "flex", gap: 10 }}>
            <Stat value={data.runningOrders} label="RUNNING ORDERS" />
            <Stat value={data.orderRequests} label="ORDER REQUEST" />
          </div>

          {/* REVENUE */}
          <div style={revenueCard}>
            <div style={revenueHeader}>
              <div>
                <div style={muted}>Total Revenue</div>
                <div style={revenueAmount}>৳{data.totalRevenue}</div>
              </div>
              <button style={linkBtn}>See Details</button>
            </div>

            <svg viewBox="0 0 100 40" width="100%" height="70">
              <path
                d="M0 30 C15 20 30 25 45 18 60 26 75 14 100 20"
                fill="none"
                stroke={ORANGE}
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* REVIEWS */}
          <div style={reviewCard}>
            <div>
              <div style={{ fontSize: "0.8rem", marginBottom: 4 }}>
                Reviews
              </div>
              <div style={{ fontSize: "0.75rem" }}>
                ⭐ {data.reviews.rating} · Total {data.reviews.count} Reviews
              </div>
            </div>
            <button style={linkBtn}>See All Reviews</button>
          </div>

          {/* POPULAR ITEMS */}
          <div>
            <div style={rowBetween}>
              <span style={{ fontSize: "0.8rem" }}>
                Popular Items This Week
              </span>
              <button style={linkBtn}>See All</button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {data.popularItems.map((item) => (
                <div key={item.id} style={popularCard}>
                  <img src={item.image} alt={item.name} style={img} />
                  <div style={{ padding: 6, fontSize: "0.75rem" }}>
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM NAV */}
          <div style={bottomNav}>
            <NavBtn onClick={() => navigate("/my-food")}>▦</NavBtn>
            <NavBtn onClick={() => navigate("/running-orders")}>≡</NavBtn>

            <button
              onClick={() => navigate("/add-new-items")}
              style={plusBtn}
              type="button"
            >
              +
            </button>

            <NavBtn onClick={() => navigate("/seller-notifications")}>🔔</NavBtn>
            <NavBtn onClick={() => navigate("/seller-profile")}>👤</NavBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Stat({ value, label }) {
  return (
    <div style={statCard}>
      <div style={statValue}>{String(value).padStart(2, "0")}</div>
      <div style={muted}>{label}</div>
    </div>
  );
}

function CircleBtn({ children }) {
  return <button style={circleBtn}>{children}</button>;
}

function NavBtn({ children, onClick }) {
  return (
    <button style={navBtn} onClick={onClick} type="button">
      {children}
    </button>
  );
}

/* ---------- STYLES ---------- */

const pageWrap = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  padding: "18px 0",
};

const pageTitle = {
  fontSize: "0.8rem",
  color: "#bbb",
  marginBottom: 6,
};

const phoneCard = {
  background: "#fff",
  borderRadius: 28,
  padding: "14px 12px 80px",
  boxShadow: "0 18px 40px rgba(0,0,0,.12)",
  position: "relative",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const circleBtn = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "#f2f3f7",
  cursor: "pointer",
};

const avatar = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "#d5d9e6",
};

const locationLabel = {
  fontSize: "0.65rem",
  color: ORANGE,
  fontWeight: 700,
};

const locationText = {
  fontSize: "0.8rem",
};

const statCard = {
  flex: 1,
  background: "#f7f8fc",
  borderRadius: 18,
  padding: 10,
};

const statValue = {
  fontSize: "1.1rem",
  fontWeight: 700,
};

const revenueCard = {
  background: "#f7f8fc",
  borderRadius: 18,
  padding: 12,
  marginTop: 14,
};

const revenueHeader = {
  display: "flex",
  justifyContent: "space-between",
};

const revenueAmount = {
  fontWeight: 700,
  fontSize: "1rem",
};

const muted = {
  fontSize: "0.7rem",
  color: "#9a9a9a",
};

const reviewCard = {
  background: "#fafbff",
  borderRadius: 18,
  padding: 12,
  marginTop: 14,
  display: "flex",
  justifyContent: "space-between",
};

const popularCard = {
  flex: 1,
  borderRadius: 18,
  background: "#f7f8fc",
  overflow: "hidden",
};

const img = {
  width: "100%",
  height: 90,
  objectFit: "cover",
};

const rowBetween = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 8,
};

const linkBtn = {
  border: "none",
  background: "transparent",
  color: ORANGE,
  fontSize: "0.7rem",
  cursor: "pointer",
};

const bottomNav = {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 10,
  height: 52,
  borderRadius: 26,
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,.14)",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
};

const navBtn = {
  border: "none",
  background: "transparent",
  fontSize: "1.1rem",
  cursor: "pointer",
  color: "#9a9a9a",
};

const plusBtn = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  border: `2px solid ${ORANGE}`,
  background: "#fffaf6",
  fontSize: "1.4rem",
  color: ORANGE,
  cursor: "pointer",
  marginTop: -22,
};
