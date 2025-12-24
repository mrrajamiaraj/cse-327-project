// src/pages/RiderEarnings.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RiderEarnings() {
  const [earningsData, setEarningsData] = useState({
    todayEarnings: 0,
    weeklyEarnings: 0,
    totalEarnings: 0,
    todayTrips: 0,
    totalTrips: 0,
    averageRating: 0,
    earningsPerTrip: 50,
    weeklyBreakdown: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'rider') {
        navigate("/login");
        return;
      }

      const response = await api.get('/rider/earnings/');
      setEarningsData({
        todayEarnings: response.data.today_earnings || 0,
        weeklyEarnings: response.data.weekly_earnings || 0,
        totalEarnings: response.data.total_earnings || 0,
        todayTrips: response.data.today_trips || 0,
        totalTrips: response.data.total_trips || 0,
        averageRating: response.data.average_rating || 0,
        earningsPerTrip: response.data.earnings_per_trip || 50,
        weeklyBreakdown: response.data.weekly_breakdown || []
      });
    } catch (error) {
      console.error("Error fetching earnings data:", error);
    }
  };

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Rider Earnings</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={backButton}>
              ←
            </button>
            <div style={headerTitle}>My Earnings</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Today's Earnings Card */}
          <div style={todayCard}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: "0.7rem", color: "#666", marginBottom: 4 }}>
                TODAY'S EARNINGS
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: ORANGE, marginBottom: 8 }}>
                ৳{earningsData.todayEarnings}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#666" }}>
                {earningsData.todayTrips} trips completed
              </div>
            </div>
            
            <div style={statsGrid}>
              <div style={statItem}>
                <div style={statValue}>৳{earningsData.earningsPerTrip}</div>
                <div style={statLabel}>Per Trip</div>
              </div>
              <div style={statItem}>
                <div style={statValue}>⭐ {earningsData.averageRating.toFixed(1)}</div>
                <div style={statLabel}>Rating</div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={summaryGrid}>
            <div style={summaryCard}>
              <div style={summaryValue}>৳{earningsData.weeklyEarnings}</div>
              <div style={summaryLabel}>This Week</div>
            </div>
            <div style={summaryCard}>
              <div style={summaryValue}>৳{earningsData.totalEarnings}</div>
              <div style={summaryLabel}>Total Earned</div>
            </div>
          </div>

          {/* Trip Statistics */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Trip Statistics</div>
            
            <div style={tripStatsGrid}>
              <div style={tripStatItem}>
                <div style={tripStatIcon}>🚴</div>
                <div>
                  <div style={tripStatValue}>{earningsData.totalTrips}</div>
                  <div style={tripStatLabel}>Total Trips</div>
                </div>
              </div>
              
              <div style={tripStatItem}>
                <div style={tripStatIcon}>📦</div>
                <div>
                  <div style={tripStatValue}>{earningsData.todayTrips}</div>
                  <div style={tripStatLabel}>Today's Trips</div>
                </div>
              </div>
              
              <div style={tripStatItem}>
                <div style={tripStatIcon}>💰</div>
                <div>
                  <div style={tripStatValue}>৳{earningsData.earningsPerTrip}</div>
                  <div style={tripStatLabel}>Avg per Trip</div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Tips */}
          <div style={tipsCard}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 12, color: "#333" }}>
              💡 Earning Tips
            </div>
            <div style={tipsList}>
              <div style={tipItem}>
                <span style={tipIcon}>🕐</span>
                <span style={tipText}>Work during peak hours (12-2 PM, 7-9 PM) for more orders</span>
              </div>
              <div style={tipItem}>
                <span style={tipIcon}>⭐</span>
                <span style={tipText}>Maintain high ratings to get priority on orders</span>
              </div>
              <div style={tipItem}>
                <span style={tipIcon}>📍</span>
                <span style={tipText}>Stay in busy areas like restaurants and shopping centers</span>
              </div>
              <div style={tipItem}>
                <span style={tipIcon}>🚀</span>
                <span style={tipText}>Complete deliveries quickly to take more orders</span>
              </div>
            </div>
          </div>

          <RiderBottomNav active="earnings" />
        </div>
      </div>
    </div>
  );
}

function RiderBottomNav({ active }) {
  const navigate = useNavigate();
  return (
    <div style={bottomNav}>
      <button style={navBtn(active === "home")} onClick={() => navigate("/rider-dashboard")}>
        🏠
      </button>
      <button style={navBtn(active === "orders")} onClick={() => navigate("/rider-orders")}>
        📦
      </button>
      <button style={navBtn(active === "earnings")} onClick={() => navigate("/rider-earnings")}>
        💰
      </button>
      <button style={navBtn(active === "profile")} onClick={() => navigate("/rider-profile")}>
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
};

const headerRow = { 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "space-between",
  marginBottom: 20 
};

const backButton = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "#f2f3f7",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const headerTitle = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#444"
};

const todayCard = {
  background: "linear-gradient(135deg, #fff5eb 0%, #ffffff 100%)",
  borderRadius: 20,
  padding: 20,
  marginBottom: 20,
  border: `1px solid ${ORANGE}20`
};

const statsGrid = {
  display: "flex",
  gap: 20,
  justifyContent: "center"
};

const statItem = {
  textAlign: "center"
};

const statValue = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 4
};

const statLabel = {
  fontSize: "0.7rem",
  color: "#666"
};

const summaryGrid = {
  display: "flex",
  gap: 12,
  marginBottom: 20
};

const summaryCard = {
  flex: 1,
  background: "#f8f9fa",
  borderRadius: 16,
  padding: 16,
  textAlign: "center"
};

const summaryValue = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 4
};

const summaryLabel = {
  fontSize: "0.7rem",
  color: "#666"
};

const sectionCard = {
  background: "#f8f9fa",
  borderRadius: 16,
  padding: 16,
  marginBottom: 20
};

const sectionTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 16
};

const tripStatsGrid = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const tripStatItem = {
  display: "flex",
  alignItems: "center",
  gap: 12
};

const tripStatIcon = {
  fontSize: "1.5rem",
  width: 40,
  textAlign: "center"
};

const tripStatValue = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 2
};

const tripStatLabel = {
  fontSize: "0.7rem",
  color: "#666"
};

const tipsCard = {
  background: "#f0f8ff",
  borderRadius: 16,
  padding: 16,
  marginBottom: 20
};

const tipsList = {
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const tipItem = {
  display: "flex",
  alignItems: "flex-start",
  gap: 8
};

const tipIcon = {
  fontSize: "0.8rem",
  marginTop: 2
};

const tipText = {
  fontSize: "0.7rem",
  color: "#666",
  lineHeight: 1.4
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
};

const navBtn = (isActive) => ({
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
  color: isActive ? ORANGE : "#9a9a9a",
});