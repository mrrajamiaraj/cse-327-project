// src/components/RiderNavigation.jsx
import { useState, useEffect } from "react";
import DeliveryTrackingMap from './DeliveryTrackingMap';
import locationService from '../services/locationService';
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RiderNavigation({ orderId }) {
  const [order, setOrder] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
    startLocationTracking();
    
    return () => {
      locationService.stopTracking();
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rider/orders/${orderId}/`);
      setOrder(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError('Failed to load order information');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    try {
      // Subscribe to location updates
      const unsubscribe = locationService.subscribe((location, error) => {
        if (error) {
          console.error('Location tracking error:', error);
          setError('Location tracking failed');
          return;
        }
        
        if (location) {
          setCurrentLocation(location);
          setIsTracking(true);
        }
      });

      // Start tracking with frequent updates for riders
      locationService.startTracking({
        updateInterval: 3000 // Update every 3 seconds
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      setError('Could not start location tracking');
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      await api.post(`/rider/orders/${orderId}/update-status/`, {
        status: newStatus
      });
      fetchOrderDetails(); // Refresh order details
    } catch (error) {
      console.error("Error updating order status:", error);
      alert('Failed to update order status');
    }
  };

  const handleRouteUpdate = (info) => {
    setRouteInfo(info);
  };

  if (loading) {
    return (
      <div style={navigationCard}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>🔄</div>
          <div style={{ fontSize: "0.9rem", color: "#666" }}>
            Loading navigation...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={navigationCard}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>❌</div>
          <div style={{ fontSize: "0.9rem", color: "#ff4444", marginBottom: 16 }}>
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={statusButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={navigationCard}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: "0.9rem", color: "#666" }}>
            No active delivery
          </div>
        </div>
      </div>
    );
  }

  // Prepare locations for the map
  const restaurantLocation = order.restaurant ? {
    lat: order.restaurant.lat || 23.8103,
    lng: order.restaurant.lng || 90.4125,
    name: order.restaurant.name,
    address: order.restaurant.address
  } : null;

  const customerLocation = order.address ? {
    lat: order.address.lat,
    lng: order.address.lng,
    address: order.address.address
  } : order.delivery_location ? {
    lat: order.delivery_location.lat,
    lng: order.delivery_location.lng,
    address: order.delivery_location.address || 'Customer Location'
  } : null;

  // Determine destination based on order status
  const getDestination = () => {
    if (order.status === 'rider_assigned') {
      return { ...restaurantLocation, type: 'restaurant' };
    } else if (['picked_up', 'out_for_delivery'].includes(order.status)) {
      return { ...customerLocation, type: 'customer' };
    }
    return null;
  };

  const destination = getDestination();

  return (
    <div style={navigationCard}>
      {/* Destination Header */}
      {destination && (
        <div style={destinationHeader}>
          <div style={destinationIcon}>
            {destination.type === 'restaurant' ? '🏪' : '🏠'}
          </div>
          <div style={destinationInfo}>
            <div style={destinationTitle}>
              {destination.type === 'restaurant' ? 'Pickup from' : 'Deliver to'}
            </div>
            <div style={destinationName}>{destination.name || 'Destination'}</div>
            <div style={destinationAddress}>{destination.address}</div>
          </div>
        </div>
      )}

      {/* Interactive Map */}
      <div style={{ position: 'relative', height: '300px', marginBottom: 16 }}>
        <DeliveryTrackingMap
          restaurantLocation={restaurantLocation}
          customerLocation={customerLocation}
          riderLocation={currentLocation}
          showRoute={true}
          userType="rider"
          onRouteUpdate={handleRouteUpdate}
          style={{ height: '100%', width: '100%' }}
        />
        
        {/* Route Info Overlay */}
        {routeInfo && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: '#333',
            zIndex: 1000
          }}>
            📍 {routeInfo.distance} km • ⏱️ {routeInfo.time} min
          </div>
        )}
        
        {/* Location Status */}
        {!isTracking && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            right: '10px',
            background: 'rgba(255, 68, 68, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: '600',
            textAlign: 'center',
            zIndex: 1000
          }}>
            ⚠️ Location tracking disabled
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={navigationControls}>
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
        
        {/* Chat Button */}
        {['rider_assigned', 'picked_up', 'out_for_delivery'].includes(order.status) && (
          <button
            onClick={() => window.open(`/rider/chat/${orderId}`, '_blank')}
            style={chatButton}
          >
            💬 Chat with Customer
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
          <span>{order.items?.length || 0} items</span>
        </div>
      </div>

      {/* Current Location Status */}
      {currentLocation && (
        <div style={locationStatus}>
          <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: 4 }}>
            Your Location:
          </div>
          <div style={{ fontSize: "0.8rem" }}>
            📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
          </div>
          <div style={{ fontSize: "0.75rem", color: ORANGE, marginTop: 4 }}>
            {currentLocation.is_moving ? '🚴 Moving' : '⏸️ Stopped'}
            {currentLocation.speed && ` • ${Math.round(currentLocation.speed * 3.6)} km/h`}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#999", marginTop: 2 }}>
            Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
          </div>
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
  fontSize: "1.5rem",
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

const chatButton = {
  padding: "12px 16px",
  borderRadius: 8,
  border: "none",
  background: "#007bff",
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