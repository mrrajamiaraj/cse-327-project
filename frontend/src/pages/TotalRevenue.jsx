import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function TotalRevenue() {
  const [revenueData, setRevenueData] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    totalWithdrawn: 0,
    commissionRate: 15,
    monthlyRevenue: [],
    dailyRevenue: 0,
    totalOrders: 0
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      // Fetch restaurant analytics and earnings
      const [analyticsResponse, earningsResponse] = await Promise.all([
        api.get('/restaurant/analytics/'),
        api.get('/restaurant/earnings/')
      ]);
      
      const analytics = analyticsResponse.data;
      const earnings = earningsResponse.data;
      
      setRevenueData({
        totalEarnings: earnings.total_earnings || 0,
        availableBalance: earnings.available_balance || 0,
        totalWithdrawn: earnings.total_withdrawn || 0,
        commissionRate: earnings.commission_rate || 15,
        monthlyRevenue: generateMonthlyData(analytics.daily_revenue),
        dailyRevenue: analytics.daily_revenue || 0,
        totalOrders: analytics.total_orders || 0
      });
      
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError("Failed to load revenue data");
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const generateMonthlyData = (dailyRevenue) => {
    // Generate sample monthly data based on daily revenue
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month) => ({
      month,
      amount: dailyRevenue * (20 + Math.random() * 10) // Simulate monthly variation
    }));
  };

  if (error) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={pageTitle}>Total Revenue</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={fetchRevenueData}
                style={{
                  padding: "8px 16px",
                  background: ORANGE,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Total Revenue</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={circleBtn} type="button">
              ←
            </button>
            <div style={headerTitle}>Total Revenue</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Revenue Summary Cards */}
          <div style={{ padding: "0 12px 20px" }}>
            <div style={summaryCard}>
              <div style={cardTitle}>Total Earnings</div>
              <div style={cardAmount}>৳{revenueData.totalEarnings.toFixed(2)}</div>
              <div style={cardSubtext}>Lifetime earnings</div>
            </div>

            <div style={summaryCard}>
              <div style={cardTitle}>Available Balance</div>
              <div style={{...cardAmount, color: ORANGE}}>৳{revenueData.availableBalance.toFixed(2)}</div>
              <div style={cardSubtext}>Ready for withdrawal</div>
            </div>

            <div style={summaryCard}>
              <div style={cardTitle}>Total Withdrawn</div>
              <div style={cardAmount}>৳{revenueData.totalWithdrawn.toFixed(2)}</div>
              <div style={cardSubtext}>Successfully withdrawn</div>
            </div>
          </div>

          {/* Revenue Stats */}
          <div style={{ padding: "0 12px 20px" }}>
            <div style={sectionTitle}>Revenue Statistics</div>
            
            <div style={statsRow}>
              <div style={statItem}>
                <div style={statLabel}>Daily Revenue</div>
                <div style={statValue}>৳{revenueData.dailyRevenue.toFixed(2)}</div>
              </div>
              <div style={statItem}>
                <div style={statLabel}>Total Orders</div>
                <div style={statValue}>{revenueData.totalOrders}</div>
              </div>
            </div>

            <div style={statsRow}>
              <div style={statItem}>
                <div style={statLabel}>Commission Rate</div>
                <div style={statValue}>{revenueData.commissionRate}%</div>
              </div>
              <div style={statItem}>
                <div style={statLabel}>Net Rate</div>
                <div style={statValue}>{(100 - revenueData.commissionRate)}%</div>
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div style={{ padding: "0 12px 20px" }}>
            <div style={sectionTitle}>Monthly Revenue Trend</div>
            <div style={chartContainer}>
              {revenueData.monthlyRevenue.map((item, index) => (
                <div key={index} style={chartItem}>
                  <div 
                    style={{
                      ...chartBar,
                      height: `${Math.min((item.amount / Math.max(...revenueData.monthlyRevenue.map(m => m.amount))) * 80, 80)}px`
                    }}
                  />
                  <div style={chartLabel}>{item.month}</div>
                  <div style={chartValue}>৳{item.amount.toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>

          <SellerBottomNav active="revenue" />
        </div>
      </div>
    </div>
  );
}

function SellerBottomNav({ active }) {
  const navigate = useNavigate();
  return (
    <div style={bottomNav}>
      <button style={navBtn(active === "grid")} onClick={() => navigate("/my-food")} type="button">
        ▦
      </button>
      <button style={navBtn(active === "list")} onClick={() => navigate("/running-orders")} type="button">
        ≡
      </button>
      <button style={plusBtn} onClick={() => navigate("/add-new-items")} type="button">
        +
      </button>
      <button style={navBtn(active === "bell")} onClick={() => navigate("/seller-notifications")} type="button">
        🔔
      </button>
      <button style={navBtn(active === "user")} onClick={() => navigate("/seller-profile")} type="button">
        👤
      </button>
    </div>
  );
}

/* Styles */
const pageWrap = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  padding: "18px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const pageTitle = { 
  fontSize: "0.8rem", 
  color: "#c0c0c0", 
  marginBottom: 8, 
  paddingLeft: 6 
};

const phoneCard = {
  borderRadius: 28,
  background: "#fff",
  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
  padding: "14px 12px 70px",
  minHeight: 690,
  position: "relative",
  overflow: "hidden",
};

const headerRow = { 
  display: "flex", 
  alignItems: "center", 
  gap: 10, 
  marginBottom: 20 
};

const circleBtn = { 
  width: 30, 
  height: 30, 
  borderRadius: "50%", 
  border: "none", 
  background: "#f2f3f7", 
  cursor: "pointer" 
};

const headerTitle = { 
  fontSize: "0.85rem", 
  fontWeight: 700, 
  color: "#444" 
};

const summaryCard = {
  background: "#f8f9fa",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "12px",
  textAlign: "center",
};

const cardTitle = {
  fontSize: "0.7rem",
  color: "#666",
  marginBottom: "8px",
  fontWeight: 600,
};

const cardAmount = {
  fontSize: "1.4rem",
  fontWeight: 800,
  color: "#333",
  marginBottom: "4px",
};

const cardSubtext = {
  fontSize: "0.65rem",
  color: "#999",
};

const sectionTitle = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: "12px",
};

const statsRow = {
  display: "flex",
  gap: "12px",
  marginBottom: "12px",
};

const statItem = {
  flex: 1,
  background: "#f8f9fa",
  borderRadius: "8px",
  padding: "12px",
  textAlign: "center",
};

const statLabel = {
  fontSize: "0.65rem",
  color: "#666",
  marginBottom: "4px",
};

const statValue = {
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "#333",
};

const chartContainer = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  height: "120px",
  padding: "10px",
  background: "#f8f9fa",
  borderRadius: "12px",
};

const chartItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  flex: 1,
};

const chartBar = {
  width: "20px",
  background: ORANGE,
  borderRadius: "2px 2px 0 0",
  marginBottom: "8px",
  minHeight: "10px",
};

const chartLabel = {
  fontSize: "0.6rem",
  color: "#666",
  marginBottom: "2px",
};

const chartValue = {
  fontSize: "0.55rem",
  color: "#999",
};

const bottomNav = {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 10,
  height: 50,
  borderRadius: 24,
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  zIndex: 999,
};

const navBtn = (isActive) => ({
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
  color: isActive ? ORANGE : "#9a9a9a",
});

const plusBtn = {
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
};