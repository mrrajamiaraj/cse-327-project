import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RunningOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ runningOrders: 0, orderRequests: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRunningOrders();
  }, []);

  const fetchRunningOrders = async () => {
    try {
      
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      // Fetch active orders only (more efficient)
      const response = await api.get('/restaurant/orders/?status=active');
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
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#333",
                  fontWeight: 600,
                }}
              >
                {stats.runningOrders} Running Order{stats.runningOrders !== 1 ? 's' : ''}
              </div>
              
              {/* Refresh button */}
              <button
                onClick={fetchRunningOrders}
                style={{
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "transparent",
                  color: "#666",
                  fontSize: "0.6rem",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
              >
                🔄
              </button>
              
              <div
                style={{
                  width: 90,
                  height: 3,
                  borderRadius: 999,
                  background: "#e9e9e9",
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
                    onViewDetails={() => setSelectedOrder(order)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <OrderDetailsModal 
              order={selectedOrder} 
              onClose={() => setSelectedOrder(null)}
              onAction={handleOrderAction}
            />
          )}

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

function OrderRow({ order, onAction, onViewDetails }) {
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

  // Use enhanced items data
  const itemsDetails = order.items_details || order.items || [];
  const itemCount = itemsDetails.length;
  const firstItem = itemsDetails[0];

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* order icon */}
      <div
        onClick={onViewDetails}
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
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => e.target.style.background = "#e8e8e8"}
        onMouseLeave={(e) => e.target.style.background = "#f2f2f2"}
      >
        🍽️
      </div>

      {/* text */}
      <div style={{ flex: 1 }} onClick={onViewDetails}>
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
        
        {/* Enhanced order details */}
        <div style={{ fontSize: "0.68rem", color: "#9a9a9a", marginBottom: 2 }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''} • {order.user?.first_name || 'Customer'}
        </div>
        
        {/* Show first item name if available */}
        {firstItem && firstItem.food_name && (
          <div style={{ fontSize: "0.65rem", color: "#666", marginBottom: 2 }}>
            {firstItem.food_name}{itemCount > 1 ? ` +${itemCount - 1} more` : ''}
          </div>
        )}
        
        {/* Time and payment info */}
        <div style={{ fontSize: "0.6rem", color: "#999", marginBottom: 3 }}>
          {order.time_ago || 'Recently'} • {order.payment_method?.toUpperCase() || 'COD'}
        </div>
        
        {/* Delivery address */}
        {order.delivery_address_display && (
          <div style={{ 
            fontSize: "0.6rem", 
            color: "#666", 
            marginBottom: 3,
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}>
            📍 {order.delivery_address_display}
          </div>
        )}
        
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

function OrderDetailsModal({ order, onClose, onAction }) {
  if (!order) return null;

  const itemsDetails = order.items_details || order.items || [];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "20px",
          maxWidth: 380,
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#333" }}>
            Order #{order.id}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#999"
            }}
          >
            ×
          </button>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: 16, padding: "12px", background: "#f9f9f9", borderRadius: 12 }}>
          <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 4 }}>
            Customer: {order.user?.first_name || 'Unknown'} {order.user?.last_name || ''}
          </div>
          {order.user?.phone && (
            <div style={{ fontSize: "0.8rem", color: "#666" }}>
              📞 {order.user.phone}
            </div>
          )}
          <div style={{ fontSize: "0.8rem", color: "#666", marginTop: 4 }}>
            📍 {order.delivery_address_display}
          </div>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: "0.9rem", marginBottom: 8, color: "#333" }}>Order Items</h4>
          {itemsDetails.map((item, index) => (
            <div key={index} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "8px 0",
              borderBottom: index < itemsDetails.length - 1 ? "1px solid #f0f0f0" : "none"
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {item.food_name || `Item ${item.food_id}`}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#666" }}>
                  ৳{item.food_price} × {item.quantity}
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                ৳{item.subtotal || (item.food_price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{ marginBottom: 16, padding: "12px", background: "#f9f9f9", borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.8rem" }}>Subtotal:</span>
            <span style={{ fontSize: "0.8rem" }}>৳{order.subtotal}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.8rem" }}>Delivery Fee:</span>
            <span style={{ fontSize: "0.8rem" }}>৳{order.delivery_fee}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #ddd", paddingTop: 4 }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Total:</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>৳{order.total}</span>
          </div>
        </div>

        {/* Order Info */}
        <div style={{ marginBottom: 16, fontSize: "0.8rem", color: "#666" }}>
          <div>Payment: {order.payment_method?.toUpperCase() || 'COD'}</div>
          <div>Ordered: {order.formatted_created_at} ({order.time_ago})</div>
          {order.note && <div>Note: {order.note}</div>}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  onAction(order.id, 'reject');
                  onClose();
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid #ff4c4c",
                  background: "transparent",
                  color: "#ff4c4c",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Reject
              </button>
              <button
                onClick={() => {
                  onAction(order.id, 'accept');
                  onClose();
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: ORANGE,
                  color: "#fff",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Accept Order
              </button>
            </>
          )}
          {order.status === 'preparing' && (
            <button
              onClick={() => {
                onAction(order.id, 'ready');
                onClose();
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: "none",
                background: "#34c759",
                color: "#fff",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Mark Ready
            </button>
          )}
        </div>
      </div>
    </div>
  );
}