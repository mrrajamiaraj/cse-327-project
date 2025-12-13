// src/pages/SellerDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import popular1 from "../assets/seller-popular-1.png";
import popular2 from "../assets/seller-popular-2.png";

const ORANGE = "#ff7a00";

export default function SellerDashboard() {
  const [data, setData] = useState({
    location: "Loading...",
    runningOrders: 0,
    orderRequests: 0,
    totalRevenue: 0,
    revenuePeriod: "Daily",
    reviews: { rating: 0, count: 0 },
    popularItems: [],
    restaurant: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      // Fetch restaurant profile
      const restaurantResponse = await api.get('/restaurant/profile/');
      const restaurant = restaurantResponse.data;

      // Fetch restaurant analytics
      const analyticsResponse = await api.get('/restaurant/analytics/');
      const analytics = analyticsResponse.data;

      // Fetch restaurant orders
      const ordersResponse = await api.get('/restaurant/orders/');
      const orders = ordersResponse.data.results || [];

      // Fetch popular items (top food items by orders)
      const foodResponse = await api.get('/customer/food/', {
        params: { restaurant: restaurant.id, ordering: '-orders_count' }
      });
      const popularItems = foodResponse.data.results?.slice(0, 2) || [];

      // Calculate dashboard metrics
      const runningOrders = orders.filter(order => 
        ['pending', 'preparing', 'ready_for_pickup'].includes(order.status)
      ).length;

      const orderRequests = orders.filter(order => 
        order.status === 'pending'
      ).length;

      setData({
        location: analytics.restaurant_address || restaurant.name,
        runningOrders,
        orderRequests,
        totalRevenue: analytics.daily_revenue || 0,
        revenuePeriod: "Daily",
        reviews: {
          rating: analytics.average_rating || 0,
          count: analytics.total_reviews || 0
        },
        popularItems: popularItems.map((item, index) => ({
          id: item.id,
          name: item.name,
          image: item.image || (index === 0 ? popular1 : popular2)
        })),
        restaurant
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", color: "#666", marginBottom: "10px" }}>
            Loading Dashboard...
          </div>
          <div style={{ fontSize: "0.9rem", color: "#999" }}>
            Fetching your restaurant data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif'
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.2rem", color: "#ff4444", marginBottom: "10px" }}>
            {error}
          </div>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: "10px 20px",
              background: ORANGE,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
        {/* grey page title */}
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#c0c0c0",
            marginBottom: 8,
            paddingLeft: 6,
          }}
        >
          Seller Dashboard Home
        </div>

        {/* main white phone card */}
        <div
          style={{
            position: "relative",
            borderRadius: 28,
            background: "#ffffff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
            padding: "14px 12px 70px",
          }}
        >
          {/* top row: menu, location, avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            {/* left hamburger in circle */}
            <button
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                border: "none",
                background: "#f4f5f8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
              }}
            >
              ☰
            </button>

            {/* location center */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: 0.6,
                  color: ORANGE,
                  fontWeight: 700,
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

            {/* right avatar circle */}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "#d5d9e6",
              }}
            />
          </div>

          {/* KPI cards row */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <StatCard value={data.runningOrders} label="RUNNING ORDERS" />
            <StatCard value={data.orderRequests} label="ORDER REQUEST" />
          </div>

          {/* Revenue + chart card */}
          <div
            style={{
              background: "#f7f8fc",
              borderRadius: 18,
              padding: "12px 10px 12px",
              marginBottom: 14,
            }}
          >
            {/* header */}
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
                    color: "#a0a0aa",
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
                }}
              >
                <select
                  value={data.revenuePeriod}
                  readOnly
                  style={{
                    borderRadius: 12,
                    border: "1px solid #dde0f0",
                    padding: "3px 10px",
                    fontSize: "0.7rem",
                    background: "#ffffff",
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
                    fontSize: "0.7rem",
                    color: ORANGE,
                    cursor: "pointer",
                  }}
                >
                  See Details
                </button>
              </div>
            </div>

            {/* chart */}
            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  position: "relative",
                  height: 80,
                  borderRadius: 16,
                  background:
                    "linear-gradient(180deg,#ffe5d0 0%, #ffffff 70%)",
                  overflow: "hidden",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 30 C12 25 22 18 32 22 C42 26 52 16 62 20 C72 24 82 15 100 19"
                    fill="none"
                    stroke={ORANGE}
                    strokeWidth="2"
                  />
                </svg>

                {/* point & label */}
                <div
                  style={{
                    position: "absolute",
                    left: "45%",
                    top: "33%",
                    transform: "translate(-50%, -50%)",
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: ORANGE,
                    boxShadow: "0 0 0 3px rgba(255,122,0,0.3)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "45%",
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

          {/* Reviews card */}
          <div
            style={{
              background: "#fafbff",
              borderRadius: 18,
              padding: "10px 10px",
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
                  color: "#444",
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
                <span
                  style={{
                    color: "#ffb400",
                    fontSize: "1rem",
                    marginTop: -2,
                  }}
                >
                  ★
                </span>
                <span style={{ fontWeight: 600 }}>{data.reviews.rating}</span>
                <span
                  style={{
                    fontSize: "0.68rem",
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

          {/* Popular items */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "#444" }}>
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

            <div style={{ display: "flex", gap: 10 }}>
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
                  <div style={{ height: 90, overflow: "hidden" }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
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

          {/* bottom nav */}
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
          color: "#202121",
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
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 10,
        height: 50,
        borderRadius: 24,
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        fontSize: "1.1rem",
      }}
    >
      <button style={navButtonStyle}>▦</button>
      <button 
        style={navButtonStyle}
        onClick={() => navigate("/running-orders")}
      >
        ≡
      </button>

      {/* center plus – highlighted */}
      <button
        onClick={() => navigate("/add-new-items")}
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
          marginTop: -22,
          boxShadow: "0 4px 12px rgba(255,122,0,0.55)",
          cursor: "pointer",
        }}
      >
        +
      </button>

      <button 
        style={navButtonStyle}
        onClick={() => navigate("/seller-notifications")}
      >
        🔔
      </button>
      <button 
        style={navButtonStyle}
        onClick={() => navigate("/seller-profile")}
      >
        👤
      </button>
    </div>
  );
}

const navButtonStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
  color: "#9a9a9a",
};
