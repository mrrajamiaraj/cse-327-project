// src/components/RiderNavigation.jsx
import { useState, useEffect } from "react";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RiderNavigation({ orderId, currentLocation, onLocationUpdate }) {
  const [order, setOrder] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    if (currentLocation && onLocationUpdate) {
      // Send location update to backend
      updateRiderLocation();
    }
  }, [currentLocation]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/rider/current-order/`);
      setOrder(response.data);
      
      // Set destination based on order status
      if (response.data.status === 'rider_assigned') {
        // Going to restaurant
        setDestination({
          name: response.data.restaurant_name,
          address: response.data.restaurant_address,
          type: 'restaurant'
        });
      } else if (response.data.status === 'picked_up' || response.data.status === 'out_for_delivery') {
        // Going to customer
        setDestination({
          name: response.data.customer_name,
          address: response.data.delivery_address,
          type: 'customer'
        });
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const updateRiderLocation = async () => {
    try {
      await api.post('/rider/location/', {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        heading: currentLocation.heading,
        speed: currentLocation.speed,
        accuracy: currentLocation.accuracy,
        is_moving: currentLocation.speed > 1 // Consider moving if speed > 1 km/h
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const startNavigation = () => {
    if (!destination) return;
    
    setIsNavigating(true);
    
    // Open Google Maps for navigation
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.address)}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      await api.post(`/rider/orders/${orderId}/update-status/`, {
        status: newStatus
      });
      fetchOrderDetails(); // Refresh order details
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  if (!order || !destination) {
    return (
      <div style={navigationCard}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🗺️</div>
          <div style={{ fontSize: "0.9rem", color: "#666" }}>
            No active delivery
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={navigationCard}>
      {/* Destination Info */}
      <div style={destinationHeader}>
        <div style={destinationIcon}>
          {destination.type === 'restaurant' ? '🏪' : '🏠'}
        </div>
        <div style={destinationInfo}>
          <div style={destinationTitle}>
            {destination.type === 'restaurant' ? 'Pickup from' : 'Deliver to'}
          </div>
          <div style={destinationName}>{destination.name}</div>
          <div style={destinationAddress}>{destination.address}</div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div style={navigationControls}>
        <button
          onClick={startNavigation}
          style={navigationButton}
        >
          🧭 Start Navigation
        </button>
        
        {order.status === 'rider_assigned' && (
          <button
            onClick={() => updateOrderStatus('picked_up')}
            style={statusButton}
          >
            📦 Mark as Picked Up
          </button>
        )}
        
        {order.status === 'picked_up' && (
          <button
            onClick={() => updateOrderStatus('out_for_delivery')}
            style={statusButton}
          >
            🚚 Start Delivery
          </button>
        )}
        
        {order.status === 'out_for_delivery' && (
          <button
            onClick={() => updateOrderStatus('delivered')}
            style={deliveredButton}
          >
            ✅ Mark as Delivered
          </button>
        )}
      </div>

      {/* Order Summary */}
      <div style={orderSummary}>
        <div style={summaryTitle}>Order Summary</div>
        <div style={summaryRow}>
          <span>Order ID:</span>
          <span>#{order.id}</span>
        </div>
        <div style={summaryRow}>
          <span>Total Amount:</span>
          <span>৳{order.total}</span>
        </div>
        <div style={summaryRow}>
          <span>Payment:</span>
          <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
        </div>
        <div style={summaryRow}>
          <span>Items:</span>
          <span>{order.items_count} items</span>
        </div>
      </div>

      {/* Location Status */}
      {currentLocation && (
        <div style={locationStatus}>
          <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: 4 }}>
            Your Location:
          </div>
          <div style={{ fontSize: "0.8rem" }}>
            📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </div>
          {currentLocation.speed && (
            <div style={{ fontSize: "0.75rem", color: ORANGE, marginTop: 4 }}>
              🚴 Speed: {currentLocation.speed.toFixed(1)} km/h
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Styles */
const navigationCard = {
  background: "#fff",
  borderRadius: 16,
  padding: 16,
  margin: "16px 0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

const destinationHeader = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
  padding: 12,
  background: "#f8f9fa",
  borderRadius: 12
};

const destinationIcon = {
  fontSize: "2rem",
  width: 50,
  height: 50,
  borderRadius: "50%",
  background: ORANGE,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const destinationInfo = {
  flex: 1
};

const destinationTitle = {
  fontSize: "0.75rem",
  color: "#666",
  fontWeight: 600,
  marginBottom: 2
};

const destinationName = {
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 4
};

const destinationAddress = {
  fontSize: "0.8rem",
  color: "#666",
  lineHeight: 1.3
};

const navigationControls = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  marginBottom: 16
};

const navigationButton = {
  padding: "12px 16px",
  borderRadius: 8,
  border: "none",
  background: "#007bff",
  color: "#fff",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer"
};

const statusButton = {
  padding: "12px 16px",
  borderRadius: 8,
  border: "none",
  background: ORANGE,
  color: "#fff",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer"
};

const deliveredButton = {
  padding: "12px 16px",
  borderRadius: 8,
  border: "none",
  background: "#28a745",
  color: "#fff",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer"
};

const orderSummary = {
  background: "#f8f9fa",
  borderRadius: 8,
  padding: 12,
  marginBottom: 16
};

const summaryTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 8
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
  fontSize: "0.8rem"
};

const locationStatus = {
  background: "#e3f2fd",
  borderRadius: 8,
  padding: 12
};