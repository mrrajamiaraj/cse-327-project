// src/pages/OrderTracking.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import webSocketService from "../services/websocket";
import RealTimeMap from "../components/RealTimeMap";

const ORANGE = "#ff7a00";

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
    
    // Connect to WebSocket for real-time updates
    const handleWebSocketMessage = (data) => {
      console.log('WebSocket message received:', data);
      
      if (data.type === 'order_update') {
        setOrder(prevOrder => ({ ...prevOrder, ...data.data }));
        // Refresh tracking data when order status changes
        fetchTrackingData();
      } else if (data.type === 'location_update') {
        setTrackingData(prevData => ({
          ...prevData,
          rider: {
            ...prevData?.rider,
            location: data.data
          }
        }));
      }
    };

    const handleWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    const handleWebSocketClose = (event) => {
      console.log('WebSocket closed:', event);
      setConnectionStatus('disconnected');
    };

    // Connect to WebSocket
    webSocketService.connectToOrder(
      orderId,
      handleWebSocketMessage,
      handleWebSocketError,
      handleWebSocketClose
    );
    
    setConnectionStatus('connected');
    
    // Cleanup WebSocket connection on unmount
    return () => {
      webSocketService.disconnect(`order/${orderId}`);
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/customer/orders/${orderId}/`);
      setOrder(response.data);
      
      // Fetch tracking data if order is in trackable state
      if (['preparing', 'ready_for_pickup', 'rider_assigned', 'picked_up', 'out_for_delivery'].includes(response.data.status)) {
        fetchTrackingData();
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  const fetchTrackingData = async () => {
    try {
      const response = await api.get(`/customer/orders/${orderId}/track/`);
      setTrackingData(response.data);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { icon: '⏳', text: 'Order Placed', color: '#ffc107', description: 'Restaurant is reviewing your order' },
      'preparing': { icon: '👨‍🍳', text: 'Preparing Your Food', color: ORANGE, description: 'Chef is cooking your delicious meal' },
      'ready_for_pickup': { icon: '📦', text: 'Ready for Pickup', color: '#17a2b8', description: 'Food is ready! Looking for a delivery rider' },
      'rider_assigned': { icon: '🚴', text: 'Rider Assigned', color: '#007bff', description: 'Rider is heading to the restaurant' },
      'picked_up': { icon: '🚚', text: 'Order Picked Up', color: '#6f42c1', description: 'Rider has collected your order' },
      'out_for_delivery': { icon: '🛵', text: 'On the Way!', color: '#28a745', description: 'Your food is coming to you!' },
      'delivered': { icon: '✅', text: 'Delivered', color: '#28a745', description: 'Enjoy your meal!' },
      'cancelled': { icon: '❌', text: 'Cancelled', color: '#dc3545', description: 'Order was cancelled' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const getProgressPercentage = (status) => {
    const progressMap = {
      'pending': 10,
      'preparing': 25,
      'ready_for_pickup': 40,
      'rider_assigned': 55,
      'picked_up': 70,
      'out_for_delivery': 85,
      'delivered': 100,
      'cancelled': 0
    };
    return progressMap[status] || 0;
  };

  const getTimeRemaining = () => {
    if (!trackingData) return null;
    
    if (order.status === 'preparing' && trackingData.prep_time_remaining) {
      return `${trackingData.prep_time_remaining} min remaining`;
    }
    
    if (order.status === 'out_for_delivery' && trackingData.eta) {
      return `ETA: ${trackingData.eta}`;
    }
    
    return null;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={phoneCard}>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>🔄</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>Loading order details...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={phoneCard}>
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>❌</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>Order not found</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const progress = getProgressPercentage(order.status);

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Order Tracking</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={backButton}>
              ←
            </button>
            <div style={headerTitle}>Order #{order.id}</div>
            <div style={connectionIndicator}>
              {connectionStatus === 'connected' && <div style={connectedDot}>🟢</div>}
              {connectionStatus === 'connecting' && <div style={connectingDot}>🟡</div>}
              {connectionStatus === 'error' && <div style={errorDot}>🔴</div>}
            </div>
          </div>

          {/* Current Status */}
          <div style={statusCard}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ ...statusIcon, background: statusInfo.color }}>
                {statusInfo.icon}
              </div>
              <div>
                <div style={statusText}>{statusInfo.text}</div>
                <div style={statusDescription}>{statusInfo.description}</div>
                {getTimeRemaining() && (
                  <div style={timeRemaining}>{getTimeRemaining()}</div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={progressContainer}>
              <div style={{ ...progressBar, width: `${progress}%`, background: statusInfo.color }} />
            </div>
            <div style={{ fontSize: "0.7rem", color: "#666", textAlign: "center", marginTop: 8 }}>
              {progress}% Complete
            </div>
          </div>

          {/* Real-time Map */}
          {trackingData && ['rider_assigned', 'picked_up', 'out_for_delivery'].includes(order.status) && (
            <div style={mapCard}>
              <div style={mapTitle}>📍 Live Tracking</div>
              <RealTimeMap
                restaurantLocation={trackingData.restaurant?.lat && trackingData.restaurant?.lng ? {
                  lat: trackingData.restaurant.lat,
                  lng: trackingData.restaurant.lng
                } : null}
                deliveryLocation={trackingData.delivery_address?.lat && trackingData.delivery_address?.lng ? {
                  lat: trackingData.delivery_address.lat,
                  lng: trackingData.delivery_address.lng
                } : null}
                riderLocation={trackingData.rider?.location}
                orderStatus={order.status}
                showRoute={order.status === 'out_for_delivery'}
              />
              {trackingData.rider?.location && (
                <div style={mapInfo}>
                  <div style={{ fontSize: "0.75rem", color: "#666" }}>
                    Last updated: {new Date(trackingData.rider.location.last_updated).toLocaleTimeString()}
                  </div>
                  {trackingData.eta && (
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: ORANGE }}>
                      ETA: {trackingData.eta}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rider Information */}
          {trackingData?.rider && (
            <div style={riderCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={riderAvatar}>🚴</div>
                <div>
                  <div style={riderName}>
                    {trackingData.rider.name}
                  </div>
                  <div style={riderInfo}>
                    ⭐ {trackingData.rider.rating} • Professional Rider
                  </div>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  {trackingData.rider.phone && (
                    <button style={callButton}>📞</button>
                  )}
                </div>
              </div>

              {trackingData.rider.location && (
                <div style={locationInfo}>
                  <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: 4 }}>
                    {order.status === 'rider_assigned' && "📍 Heading to restaurant"}
                    {order.status === 'picked_up' && "📍 Heading to you"}
                    {order.status === 'out_for_delivery' && `📍 ${trackingData.eta || 'On the way'}`}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#999" }}>
                    {trackingData.rider.location.is_moving ? "🚴 Moving" : "⏸️ Stopped"} • 
                    Last updated: {formatTime(trackingData.rider.location.last_updated)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Restaurant Information */}
          <div style={infoCard}>
            <div style={infoTitle}>Restaurant</div>
            <div style={infoContent}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: "1rem" }}>🏪</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{order.restaurant?.name}</span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "#666", paddingLeft: 24 }}>
                {order.restaurant?.address}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div style={infoCard}>
            <div style={infoTitle}>Delivery Address</div>
            <div style={infoContent}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: "1rem" }}>🏠</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {order.address?.title || "Current Location"}
                </span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "#666", paddingLeft: 24 }}>
                {order.address?.address || order.delivery_location?.address || "Address not available"}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div style={infoCard}>
            <div style={infoTitle}>Order Items ({order.items?.length || 0})</div>
            <div style={infoContent}>
              {order.items?.map((item, index) => (
                <div key={index} style={orderItem}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                        {item.quantity}x {item.food_name || `Item ${index + 1}`}
                      </div>
                      {item.variants && item.variants.length > 0 && (
                        <div style={{ fontSize: "0.7rem", color: "#666" }}>
                          Variants: {item.variants.join(", ")}
                        </div>
                      )}
                      {item.addons && item.addons.length > 0 && (
                        <div style={{ fontSize: "0.7rem", color: "#666" }}>
                          Add-ons: {item.addons.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div style={summaryCard}>
            <div style={summaryRow}>
              <span>Subtotal</span>
              <span>৳{order.subtotal}</span>
            </div>
            <div style={summaryRow}>
              <span>Delivery Fee</span>
              <span>৳{order.delivery_fee}</span>
            </div>
            <div style={{ ...summaryRow, ...totalRow }}>
              <span>Total</span>
              <span>৳{order.total}</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "#666", marginTop: 8 }}>
              Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 
                       order.payment_method === 'card' ? 'Card Payment' : 'Mobile Banking'}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={actionButtons}>
            {order.status === 'pending' && (
              <button style={cancelButton}>
                Cancel Order
              </button>
            )}
            
            {/* Chat button when rider is assigned */}
            {['rider_assigned', 'picked_up', 'out_for_delivery'].includes(order.status) && trackingData?.rider && (
              <button 
                style={chatButton}
                onClick={() => navigate(`/chat/${orderId}`)}
              >
                💬 Chat with Rider
              </button>
            )}
            
            {order.status === 'delivered' && (
              <button style={rateButton}>
                Rate Order
              </button>
            )}
            
            <button style={reorderButton}>
              Reorder
            </button>
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

const statusCard = {
  background: "#f8f9fa",
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  textAlign: "center"
};

const timeRemaining = {
  fontSize: "0.75rem",
  color: ORANGE,
  fontWeight: 600,
  marginTop: 4
};

const mapCard = {
  background: "#f8f9fa",
  borderRadius: 16,
  padding: 16,
  marginBottom: 20
};

const mapTitle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 12
};

const mapInfo = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 12,
  padding: "8px 12px",
  background: "#fff",
  borderRadius: 8
};

const statusIcon = {
  width: 50,
  height: 50,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.5rem",
  color: "#fff"
};

const statusText = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 4
};

const statusDescription = {
  fontSize: "0.75rem",
  color: "#666"
};

const progressContainer = {
  width: "100%",
  height: 6,
  background: "#e0e0e0",
  borderRadius: 3,
  overflow: "hidden"
};

const progressBar = {
  height: "100%",
  borderRadius: 3,
  transition: "width 0.3s ease"
};

const riderCard = {
  background: "#fff5eb",
  border: `1px solid ${ORANGE}30`,
  borderRadius: 16,
  padding: 16,
  marginBottom: 20
};

const riderAvatar = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  background: ORANGE,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem"
};

const riderName = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 2
};

const riderInfo = {
  fontSize: "0.7rem",
  color: "#666"
};

const callButton = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "#28a745",
  color: "#fff",
  cursor: "pointer",
  fontSize: "0.8rem"
};

const locationInfo = {
  background: "#fff",
  borderRadius: 8,
  padding: 12,
  marginTop: 12
};

const infoCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16
};

const infoTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 12
};

const infoContent = {
  fontSize: "0.75rem"
};

const orderItem = {
  padding: "8px 0",
  borderBottom: "1px solid #eee"
};

const summaryCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
  fontSize: "0.8rem"
};

const totalRow = {
  fontWeight: 700,
  fontSize: "0.9rem",
  paddingTop: 8,
  borderTop: "1px solid #ddd"
};

const actionButtons = {
  display: "flex",
  gap: 12,
  marginBottom: 20
};

const cancelButton = {
  flex: 1,
  padding: "12px",
  borderRadius: 8,
  border: "1px solid #dc3545",
  background: "#fff",
  color: "#dc3545",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const rateButton = {
  flex: 1,
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: "#ffc107",
  color: "#333",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const chatButton = {
  flex: 1,
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: "#28a745",
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const reorderButton = {
  flex: 1,
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: ORANGE,
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const connectionIndicator = {
  width: 30,
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const connectedDot = {
  fontSize: "0.6rem"
};

const connectingDot = {
  fontSize: "0.6rem"
};

const errorDot = {
  fontSize: "0.6rem"
};