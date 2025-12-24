// src/pages/RiderOrderPreview.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RiderOrderPreview() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'rider') {
        navigate("/login");
        return;
      }

      const response = await api.get(`/rider/orders/available/${orderId}/`);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  const acceptOrder = async () => {
    try {
      await api.post(`/rider/orders/available/${orderId}/accept/`);
      navigate("/rider-dashboard");
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    // Simple distance calculation (in reality, you'd use a proper mapping service)
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>⏳</div>
          <div>Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>❌</div>
          <div>Order not found or no longer available</div>
          <button
            onClick={() => navigate("/rider-dashboard")}
            style={{ ...actionButton, background: ORANGE, marginTop: 20 }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const estimatedDistance = order.restaurant?.lat && order.address?.lat 
    ? calculateDistance(order.restaurant.lat, order.restaurant.lng, order.address.lat, order.address.lng)
    : "2.5";

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Order Preview</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={backButton}>
              ←
            </button>
            <div style={headerTitle}>Order #{order.id}</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Order Summary */}
          <div style={summaryCard}>
            <div style={summaryTitle}>Delivery Summary</div>
            <div style={summaryRow}>
              <span>💰 Delivery Fee:</span>
              <span style={{ fontWeight: 600, color: ORANGE }}>৳50</span>
            </div>
            <div style={summaryRow}>
              <span>📍 Distance:</span>
              <span>{estimatedDistance} km</span>
            </div>
            <div style={summaryRow}>
              <span>⏱️ Estimated Time:</span>
              <span>25-30 minutes</span>
            </div>
            <div style={summaryRow}>
              <span>💳 Payment:</span>
              <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
            </div>
          </div>

          {/* Restaurant Details */}
          <div style={detailCard}>
            <div style={cardTitle}>📍 Pickup Location</div>
            <div style={locationInfo}>
              <div style={locationName}>{order.restaurant?.name}</div>
              <div style={locationAddress}>{order.restaurant?.address}</div>
              <div style={locationNote}>
                Prep Time: {order.restaurant?.prep_time_minutes || 20} minutes
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div style={detailCard}>
            <div style={cardTitle}>🏠 Delivery Location</div>
            <div style={locationInfo}>
              <div style={locationName}>
                {order.user?.first_name} {order.user?.last_name}
              </div>
              <div style={locationAddress}>
                {order.address?.title} - {order.address?.address}
              </div>
              {order.user?.phone && (
                <div style={locationNote}>📞 {order.user.phone}</div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div style={detailCard}>
            <div style={cardTitle}>🍽️ Order Items ({order.items?.length || 0})</div>
            <div style={itemsList}>
              {order.items?.map((item, index) => (
                <div key={index} style={orderItem}>
                  <div style={itemInfo}>
                    <div style={itemName}>
                      {item.quantity}x {item.food_name || `Item ${index + 1}`}
                    </div>
                    {item.variants && item.variants.length > 0 && (
                      <div style={itemDetails}>
                        Variants: {item.variants.join(", ")}
                      </div>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <div style={itemDetails}>
                        Add-ons: {item.addons.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div style={totalCard}>
            <div style={totalRow}>
              <span>Subtotal:</span>
              <span>৳{order.subtotal}</span>
            </div>
            <div style={totalRow}>
              <span>Delivery Fee:</span>
              <span>৳{order.delivery_fee}</span>
            </div>
            <div style={{ ...totalRow, ...finalTotal }}>
              <span>Total Amount:</span>
              <span>৳{order.total}</span>
            </div>
          </div>

          {/* Special Instructions */}
          {order.note && (
            <div style={noteCard}>
              <div style={cardTitle}>📝 Special Instructions</div>
              <div style={noteText}>{order.note}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={actionButtons}>
            <button
              onClick={() => navigate("/rider-dashboard")}
              style={{ ...actionButton, background: "#6c757d" }}
            >
              ❌ Decline
            </button>
            <button
              onClick={acceptOrder}
              style={{ ...actionButton, background: ORANGE }}
            >
              ✅ Accept Order
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

const summaryCard = {
  background: "#fff5eb",
  border: `1px solid ${ORANGE}30`,
  borderRadius: 16,
  padding: 16,
  marginBottom: 16
};

const summaryTitle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 12
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
  fontSize: "0.8rem"
};

const detailCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16
};

const cardTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 12
};

const locationInfo = {
  fontSize: "0.8rem"
};

const locationName = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 4
};

const locationAddress = {
  color: "#666",
  marginBottom: 4,
  lineHeight: 1.4
};

const locationNote = {
  fontSize: "0.75rem",
  color: "#999"
};

const itemsList = {
  display: "flex",
  flexDirection: "column",
  gap: 8
};

const orderItem = {
  padding: "8px 0",
  borderBottom: "1px solid #eee"
};

const itemInfo = {
  fontSize: "0.8rem"
};

const itemName = {
  fontWeight: 600,
  color: "#333",
  marginBottom: 4
};

const itemDetails = {
  fontSize: "0.75rem",
  color: "#666",
  marginBottom: 2
};

const totalCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 16,
  marginBottom: 16
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
  fontSize: "0.8rem"
};

const finalTotal = {
  fontWeight: 700,
  fontSize: "0.9rem",
  paddingTop: 8,
  borderTop: "1px solid #ddd",
  color: ORANGE
};

const noteCard = {
  background: "#e3f2fd",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20
};

const noteText = {
  fontSize: "0.8rem",
  color: "#333",
  lineHeight: 1.4,
  fontStyle: "italic"
};

const actionButtons = {
  display: "flex",
  gap: 12
};

const actionButton = {
  flex: 1,
  padding: "14px",
  borderRadius: 12,
  border: "none",
  color: "#fff",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer"
};