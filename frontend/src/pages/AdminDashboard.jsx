// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingRestaurants: 0,
    activeRiders: 0,
    recentOrders: [],
    recentUsers: [],
    platformStats: {
      dailyOrders: 0,
      weeklyRevenue: 0,
      monthlyGrowth: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'admin') {
        navigate("/login");
        return;
      }

      const response = await api.get('/admin/dashboard/');
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching admin dashboard:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>⏳</div>
          <div>Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <div style={pageTitle}>Admin Dashboard</div>

        <div style={dashboardContainer}>
          {/* Header */}
          <div style={headerSection}>
            <div style={headerTitle}>Platform Overview</div>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              style={logoutButton}
            >
              🚪 Logout
            </button>
          </div>

          {/* Stats Grid */}
          <div style={statsGrid}>
            <div style={statCard}>
              <div style={statIcon}>👥</div>
              <div style={statValue}>{dashboardData.totalUsers}</div>
              <div style={statLabel}>Total Users</div>
              <button
                onClick={() => navigate("/admin/users")}
                style={statButton}
              >
                Manage
              </button>
            </div>

            <div style={statCard}>
              <div style={statIcon}>🏪</div>
              <div style={statValue}>{dashboardData.totalRestaurants}</div>
              <div style={statLabel}>Restaurants</div>
              <button
                onClick={() => navigate("/admin/restaurants")}
                style={statButton}
              >
                Manage
              </button>
            </div>

            <div style={statCard}>
              <div style={statIcon}>📦</div>
              <div style={statValue}>{dashboardData.totalOrders}</div>
              <div style={statLabel}>Total Orders</div>
            </div>

            <div style={statCard}>
              <div style={statIcon}>💰</div>
              <div style={statValue}>৳{dashboardData.totalRevenue.toLocaleString()}</div>
              <div style={statLabel}>Total Revenue</div>
            </div>

            <div style={statCard}>
              <div style={statIcon}>⏳</div>
              <div style={statValue}>{dashboardData.pendingRestaurants}</div>
              <div style={statLabel}>Pending Approvals</div>
              <button
                onClick={() => navigate("/admin/restaurants?status=pending")}
                style={statButton}
              >
                Review
              </button>
            </div>

            <div style={statCard}>
              <div style={statIcon}>🚴</div>
              <div style={statValue}>{dashboardData.activeRiders}</div>
              <div style={statLabel}>Active Riders</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={quickActionsSection}>
            <div style={sectionTitle}>Quick Actions</div>
            <div style={actionsGrid}>
              <button
                onClick={() => navigate("/admin/users")}
                style={actionCard}
              >
                <div style={actionIcon}>👥</div>
                <div style={actionText}>Manage Users</div>
              </button>

              <button
                onClick={() => navigate("/admin/restaurants")}
                style={actionCard}
              >
                <div style={actionIcon}>🏪</div>
                <div style={actionText}>Approve Restaurants</div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={recentSection}>
            <div style={sectionTitle}>Recent Activity</div>
            <div style={activityGrid}>
              <div style={activityCard}>
                <div style={activityTitle}>Recent Orders</div>
                <div style={activityList}>
                  {dashboardData.recentOrders.length > 0 ? (
                    dashboardData.recentOrders.map((order, index) => (
                      <div key={index} style={activityItem}>
                        <div>Order #{order.id} - ৳{order.total}</div>
                        <div style={activityTime}>{order.time}</div>
                      </div>
                    ))
                  ) : (
                    <div style={emptyState}>No recent orders</div>
                  )}
                </div>
              </div>

              <div style={activityCard}>
                <div style={activityTitle}>New Users</div>
                <div style={activityList}>
                  {dashboardData.recentUsers.length > 0 ? (
                    dashboardData.recentUsers.map((user, index) => (
                      <div key={index} style={activityItem}>
                        <div>{user.name} ({user.role})</div>
                        <div style={activityTime}>{user.time}</div>
                      </div>
                    ))
                  ) : (
                    <div style={emptyState}>No new users</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  padding: "20px",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const pageTitle = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 20,
  textAlign: "center"
};

const dashboardContainer = {
  background: "#fff",
  borderRadius: 16,
  padding: 30,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
};

const headerSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 30,
  paddingBottom: 20,
  borderBottom: "1px solid #eee"
};

const headerTitle = {
  fontSize: "1.8rem",
  fontWeight: 700,
  color: "#333"
};

const logoutButton = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#dc3545",
  color: "#fff",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
  marginBottom: 40
};

const statCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 20,
  textAlign: "center",
  border: "1px solid #e9ecef"
};

const statIcon = {
  fontSize: "2rem",
  marginBottom: 10
};

const statValue = {
  fontSize: "1.8rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 5
};

const statLabel = {
  fontSize: "0.9rem",
  color: "#666",
  marginBottom: 15
};

const statButton = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "none",
  background: ORANGE,
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const quickActionsSection = {
  marginBottom: 40
};

const sectionTitle = {
  fontSize: "1.3rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 20
};

const actionsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 15
};

const actionCard = {
  background: "#fff",
  border: "2px solid #e9ecef",
  borderRadius: 12,
  padding: 20,
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const actionIcon = {
  fontSize: "2rem",
  marginBottom: 10
};

const actionText = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333"
};

const recentSection = {
  marginBottom: 20
};

const activityGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20
};

const activityCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 20
};

const activityTitle = {
  fontSize: "1.1rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 15
};

const activityList = {
  display: "flex",
  flexDirection: "column",
  gap: 10
};

const activityItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #eee",
  fontSize: "0.9rem"
};

const activityTime = {
  fontSize: "0.8rem",
  color: "#666"
};

const emptyState = {
  textAlign: "center",
  color: "#999",
  fontSize: "0.9rem",
  padding: "20px 0"
};