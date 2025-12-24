// src/pages/RiderOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RiderOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all"); // all, completed, cancelled
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'rider') {
        navigate("/login");
        return;
      }

      const response = await api.get('/rider/orders/history/');
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "completed") return order.status === "delivered";
    if (filter === "cancelled") return order.status === "cancelled";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'rider_assigned': return ORANGE;
      case 'picked_up': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return '✅ Delivered';
      case 'cancelled': return '❌ Cancelled';
      case 'rider_assigned': return '📦 Assigned';
      case 'picked_up': return '🚚 Picked Up';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Order History</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={backButton}>
              ←
            </button>
            <div style={headerTitle}>My Deliveries</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Filter Tabs */}
          <div style={filterTabs}>
            <button
              onClick={() => setFilter("all")}
              style={{
                ...filterTab,
                background: filter === "all" ? ORANGE : "transparent",
                color: filter === "all" ? "#fff" : "#666"
              }}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              style={{
                ...filterTab,
                background: filter === "completed" ? ORANGE : "transparent",
                color: filter === "completed" ? "#fff" : "#666"
              }}
            >
              Completed ({orders.filter(o => o.status === 'delivered').length})
            </button>
            <button
              onClick={() => setFilter("cancelled")}
              style={{
                ...filterTab,
                background: filter === "cancelled" ? ORANGE : "transparent",
                color: filter === "cancelled" ? "#fff" : "#666"
              }}
            >
              Cancelled ({orders.filter(o => o.status === 'cancelled').length})
            </button>
          </div>

          {/* Orders List */}
          <div style={{ marginBottom: 20 }}>
            {filteredOrders.length === 0 ? (
              <div style={emptyState}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>
                  No Orders Found
                </div>
                <div style={{ fontSize: "0.7rem", color: "#666" }}>
                  {filter === "all" 
                    ? "You haven't completed any deliveries yet"
                    : `No ${filter} orders found`
                  }
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredOrders.map((order) => (
                  <div key={order.id} style={orderCard}>
                    {/* Order Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          Order #{order.id}
                        </div>
                        <div 
                          style={{
                            ...statusBadge,
                            background: getStatusColor(order.status),
                          }}
                        >
                          {getStatusText(order.status)}
                        </div>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#666" }}>
                        {formatDate(order.created_at)}
                      </div>
                    </div>

                    {/* Restaurant Info */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 4 }}>
                        🏪 {order.restaurant?.name || 'Restaurant'}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#666" }}>
                        📍 {order.restaurant?.address || 'Address not available'}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: 4 }}>
                        👤 {order.user?.first_name} {order.user?.last_name}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#666" }}>
                        🏠 {order.address?.title} - {order.address?.address}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div style={orderDetails}>
                      <div style={orderDetailItem}>
                        <span style={{ fontSize: "0.7rem", color: "#666" }}>Total Amount:</span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>৳{order.total}</span>
                      </div>
                      <div style={orderDetailItem}>
                        <span style={{ fontSize: "0.7rem", color: "#666" }}>Payment:</span>
                        <span style={{ fontSize: "0.7rem" }}>
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : 
                           order.payment_method === 'card' ? 'Card Payment' : 
                           'Mobile Banking'}
                        </span>
                      </div>
                      <div style={orderDetailItem}>
                        <span style={{ fontSize: "0.7rem", color: "#666" }}>Items:</span>
                        <span style={{ fontSize: "0.7rem" }}>{order.items?.length || 0} items</span>
                      </div>
                      {order.status === 'delivered' && (
                        <div style={orderDetailItem}>
                          <span style={{ fontSize: "0.7rem", color: "#666" }}>Earnings:</span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: '#28a745' }}>৳50</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => navigate(`/rider/order-details/${order.id}`)}
                      style={viewDetailsButton}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <RiderBottomNav active="orders" />
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

const filterTabs = {
  display: "flex",
  gap: 8,
  marginBottom: 20,
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 4
};

const filterTab = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 8,
  border: "none",
  fontSize: "0.7rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const orderCard = {
  background: "#f8f9fa",
  borderRadius: 16,
  padding: 16,
  border: "1px solid #e0e0e0"
};

const statusBadge = {
  padding: "2px 8px",
  borderRadius: 12,
  fontSize: "0.65rem",
  fontWeight: 600,
  color: "#fff"
};

const orderDetails = {
  background: "#fff",
  borderRadius: 8,
  padding: 12,
  marginBottom: 12
};

const orderDetailItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6
};

const viewDetailsButton = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "none",
  background: ORANGE,
  color: "#fff",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer"
};

const emptyState = {
  textAlign: "center",
  padding: "60px 20px",
  background: "#f8f9fa",
  borderRadius: 16
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