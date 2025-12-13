import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) {
        navigate("/login");
        return;
      }

      // Fetch customer orders
      const response = await api.get('/orders/');
      setOrders(response.data.results || response.data);
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ff9500',
      'preparing': '#007aff',
      'ready_for_pickup': '#34c759',
      'rider_assigned': '#5856d6',
      'picked_up': '#af52de',
      'out_for_delivery': '#ff6b35',
      'delivered': '#30d158',
      'cancelled': '#ff3b30'
    };
    return colors[status] || '#666';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Order Placed',
      'preparing': 'Being Prepared',
      'ready_for_pickup': 'Ready for Pickup',
      'rider_assigned': 'Rider Assigned',
      'picked_up': 'Picked Up',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={pageTitle}>My Orders</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center", color: "#666" }}>
              Loading orders...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={pageTitle}>My Orders</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={fetchOrders}
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
        <div style={pageTitle}>My Orders</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={circleBtn} type="button">
              ←
            </button>
            <div style={headerTitle}>My Orders</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Orders List */}
          <div style={{ padding: "0 8px" }}>
            {orders.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
                fontSize: "0.9rem"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🍽️</div>
                No orders yet. Start ordering!
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} style={orderCard}>
                  <div style={orderHeader}>
                    <div>
                      <div style={orderNumber}>Order #{order.id}</div>
                      <div style={restaurantName}>{order.restaurant.name}</div>
                    </div>
                    <div style={orderTotal}>৳{order.total}</div>
                  </div>

                  <div style={orderStatus}>
                    <div 
                      style={{
                        ...statusBadge,
                        background: getStatusColor(order.status),
                      }}
                    >
                      {getStatusText(order.status)}
                    </div>
                    <div style={orderDate}>{formatDate(order.created_at)}</div>
                  </div>

                  <div style={orderItems}>
                    {order.items.slice(0, 2).map((item, index) => (
                      <div key={index} style={itemText}>
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div style={itemText}>
                        +{order.items.length - 2} more items
                      </div>
                    )}
                  </div>

                  <div style={orderActions}>
                    <button
                      onClick={() => navigate(`/chat/${order.id}`)}
                      style={chatButton}
                      type="button"
                    >
                      💬 Chat
                    </button>
                    
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => {/* Add review functionality */}}
                        style={reviewButton}
                        type="button"
                      >
                        ⭐ Review
                      </button>
                    )}
                    
                    {['pending', 'preparing'].includes(order.status) && (
                      <button
                        onClick={() => {/* Add cancel functionality */}}
                        style={cancelButton}
                        type="button"
                      >
                        ❌ Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
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
  padding: "14px 12px 20px",
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

const orderCard = {
  background: "#f8f9fa",
  borderRadius: "12px",
  padding: "16px",
  marginBottom: "12px",
  border: "1px solid #e9ecef",
};

const orderHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "8px",
};

const orderNumber = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#333",
};

const restaurantName = {
  fontSize: "0.7rem",
  color: "#666",
  marginTop: "2px",
};

const orderTotal = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: ORANGE,
};

const orderStatus = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};

const statusBadge = {
  padding: "4px 8px",
  borderRadius: "12px",
  fontSize: "0.65rem",
  fontWeight: 600,
  color: "white",
};

const orderDate = {
  fontSize: "0.65rem",
  color: "#999",
};

const orderItems = {
  marginBottom: "12px",
};

const itemText = {
  fontSize: "0.7rem",
  color: "#666",
  marginBottom: "2px",
};

const orderActions = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const chatButton = {
  padding: "6px 12px",
  background: ORANGE,
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "0.7rem",
  cursor: "pointer",
  fontWeight: 600,
};

const reviewButton = {
  padding: "6px 12px",
  background: "#34c759",
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "0.7rem",
  cursor: "pointer",
  fontWeight: 600,
};

const cancelButton = {
  padding: "6px 12px",
  background: "#ff3b30",
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "0.7rem",
  cursor: "pointer",
  fontWeight: 600,
};