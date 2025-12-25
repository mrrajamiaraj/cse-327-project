// src/pages/RiderDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RiderDashboard() {
  const [riderData, setRiderData] = useState({
    isOnline: false,
    todayEarnings: 0,
    completedTrips: 0,
    currentOrder: null,
    availableOrders: [],
    riderInfo: {
      name: "",
      rating: 0,
      totalTrips: 0
    },
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    totalDeliveries: 0,
    analytics: {
      todayDistance: 0,
      avgDeliveryTime: 0,
      acceptanceRate: 0,
      customerRating: 0
    }
  });
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRiderData();
    startLocationTracking();
    
    // Set up real-time updates every 30 seconds when online
    const interval = setInterval(() => {
      if (riderData.isOnline) {
        fetchAvailableOrders();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [riderData.isOnline]);

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            heading: position.coords.heading,
            speed: position.coords.speed ? position.coords.speed * 3.6 : 0,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    }
  };

  const fetchRiderData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'rider') {
        navigate("/login");
        return;
      }

      // Fetch rider profile and earnings
      const [profileResponse, earningsResponse] = await Promise.all([
        api.get('/rider/profile/'),
        api.get('/rider/earnings/')
      ]);

      // Calculate additional analytics
      const analytics = {
        todayDistance: Math.round(Math.random() * 50 + 10), // Mock data - replace with real API
        avgDeliveryTime: Math.round(Math.random() * 15 + 20), // Mock data
        acceptanceRate: Math.round(Math.random() * 20 + 80), // Mock data
        customerRating: (Math.random() * 1 + 4).toFixed(1) // Mock data
      };

      setRiderData(prev => ({
        ...prev,
        isOnline: profileResponse.data.is_online || false,
        todayEarnings: earningsResponse.data.today_earnings || 0,
        completedTrips: earningsResponse.data.today_trips || 0,
        weeklyEarnings: earningsResponse.data.weekly_earnings || 0,
        monthlyEarnings: earningsResponse.data.monthly_earnings || 0,
        averageRating: earningsResponse.data.average_rating || 0,
        totalDeliveries: earningsResponse.data.total_trips || 0,
        analytics,
        riderInfo: {
          name: `${profileResponse.data.first_name} ${profileResponse.data.last_name}`.trim() || profileResponse.data.email,
          rating: earningsResponse.data.average_rating || 0,
          totalTrips: earningsResponse.data.total_trips || 0
        }
      }));

      if (profileResponse.data.is_online) {
        fetchAvailableOrders();
        fetchCurrentOrder();
      }
    } catch (error) {
      console.error("Error fetching rider data:", error);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const response = await api.get('/rider/available-orders/');
      setRiderData(prev => ({
        ...prev,
        availableOrders: response.data || []
      }));
    } catch (error) {
      console.error("Error fetching available orders:", error);
    }
  };

  const fetchCurrentOrder = async () => {
    try {
      const response = await api.get('/rider/current-order/');
      setRiderData(prev => ({
        ...prev,
        currentOrder: response.data || null
      }));
    } catch (error) {
      console.error("Error fetching current order:", error);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !riderData.isOnline;
      await api.post('/rider/availability/', { is_online: newStatus });
      
      setRiderData(prev => ({
        ...prev,
        isOnline: newStatus,
        availableOrders: newStatus ? prev.availableOrders : []
      }));

      if (newStatus) {
        fetchAvailableOrders();
      }
    } catch (error) {
      console.error("Error toggling online status:", error);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await api.post(`/rider/orders/${orderId}/accept/`);
      fetchCurrentOrder();
      fetchAvailableOrders();
      setSelectedOrderIndex(null);
    } catch (error) {
      console.error("Error accepting order:", error);
      // Show user-friendly error message
      alert(error.response?.data?.error || "Failed to accept order. Please try again.");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.post(`/rider/orders/${orderId}/update-status/`, { status });
      fetchCurrentOrder();
      // Also refresh available orders in case this order is now complete
      if (status === 'delivered') {
        fetchAvailableOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.response?.data?.error || "Failed to update order status. Please try again.");
    }
  };

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Page Title */}
        <div style={pageTitle}>Rider Dashboard</div>

        {/* Main Card */}
        <div style={phoneCard}>
          {/* Header Section */}
          <div style={headerSection}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={riderAvatar}>🚴‍♂️</div>
              <div>
                <div style={riderName}>
                  {riderData.riderInfo.name}
                </div>
                <div style={riderStats}>
                  ⭐ {riderData.riderInfo.rating.toFixed(1)} • {riderData.riderInfo.totalTrips} deliveries
                </div>
              </div>
            </div>
            
            {/* Status Toggle */}
            <button
              onClick={toggleOnlineStatus}
              style={{
                ...statusToggle,
                background: riderData.isOnline 
                  ? `linear-gradient(135deg, ${ORANGE} 0%, #ff9533 100%)` 
                  : "#e9ecef",
                color: riderData.isOnline ? "#fff" : "#6c757d",
                boxShadow: riderData.isOnline 
                  ? `0 4px 12px rgba(255, 122, 0, 0.3)` 
                  : "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ fontSize: "0.5rem", marginBottom: 2 }}>
                {riderData.isOnline ? "🟢 ONLINE" : "⚫ OFFLINE"}
              </div>
              <div style={{ fontSize: "0.6rem", fontWeight: 500 }}>
                {riderData.isOnline ? "Available" : "Unavailable"}
              </div>
            </button>
          </div>

          {/* KPI Cards Row */}
          <div style={kpiRow}>
            <KPICard 
              value={`৳${riderData.todayEarnings.toFixed(0)}`} 
              label="TODAY'S EARNINGS" 
              icon="💰"
            />
            <KPICard 
              value={riderData.completedTrips} 
              label="COMPLETED TRIPS" 
              icon="📦"
            />
          </div>

          {/* Performance Analytics Card */}
          <div style={analyticsCard}>
            <div style={cardHeader}>
              <div>
                <div style={cardTitle}>Performance Analytics</div>
                <div style={cardSubtitle}>Today's performance metrics</div>
              </div>
              <button
                onClick={() => navigate("/rider-earnings")}
                style={detailsButton}
              >
                Details
              </button>
            </div>
            
            <div style={metricsGrid}>
              <MetricItem 
                icon="🛣️" 
                value={`${riderData.analytics.todayDistance}km`} 
                label="Distance" 
              />
              <MetricItem 
                icon="⏱️" 
                value={`${riderData.analytics.avgDeliveryTime}min`} 
                label="Avg Time" 
              />
              <MetricItem 
                icon="✅" 
                value={`${riderData.analytics.acceptanceRate}%`} 
                label="Accept Rate" 
              />
              <MetricItem 
                icon="⭐" 
                value={riderData.analytics.customerRating} 
                label="Rating" 
              />
            </div>
          </div>

          {/* Current Order Section */}
          {riderData.currentOrder && (
            <div style={currentOrderSection}>
              <div style={sectionTitle}>🚚 Current Delivery</div>
              <div style={currentOrderCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333" }}>
                    Order #{riderData.currentOrder.id}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: ORANGE, fontWeight: 600 }}>
                    ৳{riderData.currentOrder.delivery_fee}
                  </div>
                </div>
                
                <div style={{ fontSize: "0.7rem", color: "#666", marginBottom: 8 }}>
                  📍 From: {riderData.currentOrder.restaurant_name}
                </div>
                
                <div style={{ fontSize: "0.7rem", color: "#666", marginBottom: 16 }}>
                  🏠 To: {riderData.currentOrder.delivery_address}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {riderData.currentOrder.status === 'rider_assigned' && (
                    <button
                      onClick={() => updateOrderStatus(riderData.currentOrder.id, 'picked_up')}
                      style={{ ...actionButton, background: ORANGE, flex: 1 }}
                    >
                      📦 Mark Picked Up
                    </button>
                  )}
                  {riderData.currentOrder.status === 'picked_up' && (
                    <button
                      onClick={() => updateOrderStatus(riderData.currentOrder.id, 'out_for_delivery')}
                      style={{ ...actionButton, background: ORANGE, flex: 1 }}
                    >
                      🚚 Start Delivery
                    </button>
                  )}
                  {riderData.currentOrder.status === 'out_for_delivery' && (
                    <button
                      onClick={() => updateOrderStatus(riderData.currentOrder.id, 'delivered')}
                      style={{ ...actionButton, background: "#28a745", flex: 1 }}
                    >
                      ✅ Mark Delivered
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/rider/chat/${riderData.currentOrder.id}`)}
                    style={{ ...actionButton, background: "#007bff" }}
                  >
                    💬 Chat
                  </button>
                  <button
                    onClick={() => navigate(`/rider-navigation/${riderData.currentOrder.id}`)}
                    style={{ ...actionButton, background: "#6c757d" }}
                  >
                    🗺️ Navigate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Available Orders Section */}
          {riderData.isOnline && !riderData.currentOrder && (
            <div style={availableOrdersSection}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={sectionTitle}>📋 Available Orders</div>
                <button
                  onClick={fetchAvailableOrders}
                  style={refreshButton}
                >
                  🔄 Refresh
                </button>
              </div>

              {riderData.availableOrders.length === 0 ? (
                <div style={emptyOrdersState}>
                  <div style={{ fontSize: "3rem", marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 8, color: "#333" }}>
                    No Orders Available
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#666", textAlign: "center", lineHeight: 1.4 }}>
                    Stay online and we'll notify you when new delivery requests come in
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {riderData.availableOrders.map((order, index) => (
                    <div
                      key={order.id}
                      style={{
                        ...orderCard,
                        border: selectedOrderIndex === index 
                          ? `2px solid ${ORANGE}` 
                          : "1px solid #e9ecef",
                        boxShadow: selectedOrderIndex === index 
                          ? `0 4px 16px rgba(255, 122, 0, 0.2)` 
                          : "0 2px 8px rgba(0,0,0,0.06)"
                      }}
                      onClick={() => setSelectedOrderIndex(selectedOrderIndex === index ? null : index)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333" }}>
                          {order.restaurant_name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: ORANGE, fontWeight: 700 }}>
                          ৳{order.delivery_fee} • {order.distance}km
                        </div>
                      </div>
                      
                      <div style={{ fontSize: "0.7rem", color: "#666", marginBottom: 8 }}>
                        📍 Pickup: {order.pickup_address}
                      </div>
                      
                      <div style={{ fontSize: "0.7rem", color: "#666", marginBottom: 12 }}>
                        🏠 Delivery: {order.delivery_address}
                      </div>

                      {selectedOrderIndex === index && (
                        <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptOrder(order.id);
                            }}
                            style={{ ...actionButton, background: ORANGE, flex: 1 }}
                          >
                            ✅ Accept Order
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/rider/order-preview/${order.id}`);
                            }}
                            style={{ ...actionButton, background: "#6c757d" }}
                          >
                            👁️ Preview
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Offline State */}
          {!riderData.isOnline && (
            <div style={offlineSection}>
              <div style={offlineCard}>
                <div style={{ fontSize: "4rem", marginBottom: 16 }}>😴</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8, color: "#333" }}>
                  You're Currently Offline
                </div>
                <div style={{ fontSize: "0.75rem", color: "#666", textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
                  Turn on your availability to start receiving delivery requests and earn money today
                </div>
                <button
                  onClick={toggleOnlineStatus}
                  style={{ 
                    ...actionButton, 
                    background: `linear-gradient(135deg, ${ORANGE} 0%, #ff9533 100%)`,
                    fontSize: "0.8rem", 
                    padding: "14px 32px",
                    boxShadow: `0 4px 16px rgba(255, 122, 0, 0.3)`
                  }}
                >
                  🟢 Go Online Now
                </button>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <RiderBottomNav active="home" />
        </div>
      </div>
    </div>
  );
}

// Professional KPI Card Component
function KPICard({ value, label, icon }) {
  return (
    <div style={kpiCard}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: "1.2rem" }}>{icon}</span>
        <div style={kpiValue}>{value}</div>
      </div>
      <div style={kpiLabel}>{label}</div>
    </div>
  );
}

// Performance Metric Item Component
function MetricItem({ icon, value, label }) {
  return (
    <div style={metricItem}>
      <div style={{ fontSize: "1.1rem", marginBottom: 4 }}>{icon}</div>
      <div style={metricValue}>{value}</div>
      <div style={metricLabel}>{label}</div>
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

/* Professional Styles */
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
  fontWeight: 500,
  color: "#c0c0c0", 
  marginBottom: 8, 
  paddingLeft: 6 
};

const phoneCard = {
  borderRadius: 28,
  background: "#ffffff",
  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
  padding: "14px 12px 70px",
  minHeight: 690,
  position: "relative",
};

// Header Section Styles
const headerSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20,
  padding: "4px 0"
};

const riderAvatar = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "linear-gradient(135deg, #fff5eb 0%, #ffffff 100%)",
  border: `2px solid ${ORANGE}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.4rem"
};

const riderName = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 2
};

const riderStats = {
  fontSize: "0.7rem",
  color: "#666"
};

const statusToggle = {
  padding: "8px 16px",
  borderRadius: 16,
  border: "none",
  fontSize: "0.6rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.3s ease",
  textAlign: "center",
  minWidth: 80
};

// KPI Section Styles
const kpiRow = {
  display: "flex",
  gap: 12,
  marginBottom: 20
};

const kpiCard = {
  flex: 1,
  background: "#f7f8fc",
  borderRadius: 18,
  padding: "16px 12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};

const kpiValue = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#333"
};

const kpiLabel = {
  fontSize: "0.65rem",
  color: "#9a9a9a",
  fontWeight: 500,
  letterSpacing: 0.5
};

// Analytics Card Styles
const analyticsCard = {
  background: "#f7f8fc",
  borderRadius: 18,
  padding: "16px 14px",
  marginBottom: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16
};

const cardTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 2
};

const cardSubtitle = {
  fontSize: "0.65rem",
  color: "#9a9a9a"
};

const detailsButton = {
  border: "none",
  background: "transparent",
  fontSize: "0.7rem",
  color: ORANGE,
  cursor: "pointer",
  fontWeight: 600
};

const metricsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr 1fr",
  gap: 12
};

const metricItem = {
  textAlign: "center",
  padding: "8px 4px"
};

const metricValue = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 2
};

const metricLabel = {
  fontSize: "0.6rem",
  color: "#9a9a9a"
};

// Order Sections Styles
const currentOrderSection = {
  marginBottom: 20
};

const availableOrdersSection = {
  marginBottom: 20
};

const offlineSection = {
  marginBottom: 20
};

const sectionTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 12
};

const currentOrderCard = {
  background: "linear-gradient(135deg, #fff5eb 0%, #ffffff 100%)",
  border: `2px solid ${ORANGE}`,
  borderRadius: 16,
  padding: 16,
  boxShadow: `0 4px 16px rgba(255, 122, 0, 0.15)`
};

const orderCard = {
  background: "#ffffff",
  borderRadius: 16,
  padding: 16,
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
};

const refreshButton = {
  border: "none",
  background: "transparent",
  color: ORANGE,
  fontSize: "0.7rem",
  cursor: "pointer",
  fontWeight: 600
};

const emptyOrdersState = {
  textAlign: "center",
  padding: "50px 20px",
  background: "#fafbff",
  borderRadius: 18,
  border: "1px solid #f0f0f0"
};

const offlineCard = {
  textAlign: "center",
  padding: "60px 20px",
  background: "#fafbff",
  borderRadius: 18,
  border: "1px solid #f0f0f0"
};

const actionButton = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  color: "#fff",
  fontSize: "0.7rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease"
};

// Bottom Navigation Styles
const bottomNav = {
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
};

const navBtn = (isActive) => ({
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
  color: isActive ? ORANGE : "#9a9a9a",
  transition: "color 0.2s ease"
});