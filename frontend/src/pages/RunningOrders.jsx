import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RunningOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ runningOrders: 0, orderRequests: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRunningOrders();
  }, []);

  const fetchRunningOrders = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      // Fetch restaurant orders
      const response = await api.get('/restaurant/orders/');
      const allOrders = response.data;
      
      // Filter running orders (pending, preparing, ready_for_pickup)
      const runningOrders = allOrders.filter(order => 
        ['pending', 'preparing', 'ready_for_pickup'].includes(order.status)
      );
      
      // Calculate stats
      const orderRequests = allOrders.filter(order => order.status === 'pending').length;
      
      setOrders(runningOrders);
      setStats({
        runningOrders: runningOrders.length,
        orderRequests: orderRequests
      });
      
    } catch (error) {
      console.error("Error fetching running orders:", error);
      setError("Failed to load orders");
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      let endpoint = '';
      let data = {};
      
      switch (action) {
        case 'accept':
          endpoint = `/restaurant/orders/${orderId}/accept/`;
          data = { prep_time_minutes: 30 }; // Default prep time
          break;
        case 'ready':
          endpoint = `/restaurant/orders/${orderId}/ready/`;
          break;
        case 'reject':
          endpoint = `/restaurant/orders/${orderId}/reject/`;
          break;
        default:
          return;
      }
      
      await api.post(endpoint, data);
      
      // Refresh orders after action
      fetchRunningOrders();
      
    } catch (error) {
      console.error(`Error ${action} order:`, error);
      alert(`Failed to ${action} order. Please try again.`);
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
            Loading Orders...
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
            onClick={fetchRunningOrders}
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
                <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  {stats.runningOrders.toString().padStart(2, "0")}
                </div>
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
                <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  {stats.orderRequests.toString().padStart(2, "0")}
                </div>
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
                {stats.runningOrders} Running Order{stats.runningOrders !== 1 ? 's' : ''}
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
              {orders.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#999",
                  fontSize: "0.9rem"
                }}>
                  No running orders at the moment
                </div>
              ) : (
                orders.map((order) => (
                  <OrderRow 
                    key={order.id} 
                    order={order} 
                    onAction={handleOrderAction}
                  />
                ))
              )}
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

function OrderRow({ order, onAction }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9500';
      case 'preparing': return '#007aff';
      case 'ready_for_pickup': return '#34c759';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'New Order';
      case 'preparing': return 'Preparing';
      case 'ready_for_pickup': return 'Ready';
      default: return status;
    }
  };

  const getActionButtons = (status) => {
    switch (status) {
      case 'pending':
        return (
          <>
            <button
              onClick={() => onAction(order.id, 'accept')}
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
              Accept
            </button>
            <button
              onClick={() => onAction(order.id, 'reject')}
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
              Reject
            </button>
          </>
        );
      case 'preparing':
        return (
          <button
            onClick={() => onAction(order.id, 'ready')}
            style={{
              padding: "5px 10px",
              borderRadius: 10,
              border: "none",
              background: "#34c759",
              color: "#fff",
              fontSize: "0.7rem",
              cursor: "pointer",
            }}
          >
            Mark Ready
          </button>
        );
      case 'ready_for_pickup':
        return (
          <div style={{
            padding: "5px 10px",
            borderRadius: 10,
            background: "#e8f5e8",
            color: "#34c759",
            fontSize: "0.7rem",
            fontWeight: 600,
          }}>
            Ready for Pickup
          </div>
        );
      default:
        return null;
    }
  };

  // Get first item from order for display
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
  const itemCount = order.items ? order.items.length : 0;

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* order icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "#f2f2f2",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
        }}
      >
        🍽️
      </div>

      {/* text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "0.68rem",
            color: getStatusColor(order.status),
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          #{getStatusText(order.status)}
        </div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#222" }}>
          Order #{order.id}
        </div>
        <div style={{ fontSize: "0.68rem", color: "#9a9a9a" }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''} • {order.user?.first_name || 'Customer'}
        </div>
        <div style={{ fontSize: "0.78rem", fontWeight: 800, marginTop: 2 }}>
          ৳{order.total}
        </div>
      </div>

      {/* buttons */}
      <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
        {getActionButtons(order.status)}
      </div>
    </div>
  );
}
