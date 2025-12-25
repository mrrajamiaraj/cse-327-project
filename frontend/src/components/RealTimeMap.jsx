import { useState, useEffect } from 'react';
import DeliveryTrackingMap from './DeliveryTrackingMap';
import locationService from '../services/locationService';

const ORANGE = "#ff7a00";

/* Styles */
const mapContainer = {
  position: "relative",
  width: "100%",
  height: 300,
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #e0e0e0"
};

const statusOverlay = {
  position: "absolute",
  top: 10,
  left: 10,
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: 8,
  padding: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  zIndex: 1000
};

const statusText = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 4
};

const routeInfoText = {
  fontSize: "0.75rem",
  color: ORANGE,
  fontWeight: 600
};

const locationInfoOverlay = {
  position: "absolute",
  bottom: 10,
  left: 10,
  right: 10,
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: 8,
  padding: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  zIndex: 1000
};

export default function RealTimeMap({ 
  restaurantLocation, 
  deliveryLocation, 
  riderLocation, 
  orderStatus,
  showRoute = true 
}) {
  const [currentRiderLocation, setCurrentRiderLocation] = useState(riderLocation);
  const [routeInfo, setRouteInfo] = useState(null);

  // Update rider location from props
  useEffect(() => {
    setCurrentRiderLocation(riderLocation);
  }, [riderLocation]);

  // Subscribe to real-time location updates if this is for a rider
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (user.role === 'rider' && ['rider_assigned', 'picked_up', 'out_for_delivery'].includes(orderStatus)) {
      const unsubscribe = locationService.subscribe((location, error) => {
        if (error) {
          console.error('Location tracking error:', error);
          return;
        }
        
        if (location) {
          setCurrentRiderLocation(location);
        }
      });

      return unsubscribe;
    }
  }, [orderStatus]);

  const handleRouteUpdate = (info) => {
    setRouteInfo(info);
  };

  // Prepare locations for the map
  const mapRestaurantLocation = restaurantLocation ? {
    lat: restaurantLocation.lat || 23.8103,
    lng: restaurantLocation.lng || 90.4125,
    name: restaurantLocation.name || 'Restaurant',
    address: restaurantLocation.address || 'Pickup Location'
  } : null;

  const mapDeliveryLocation = deliveryLocation ? {
    lat: deliveryLocation.lat,
    lng: deliveryLocation.lng,
    address: deliveryLocation.address || 'Delivery Location'
  } : null;

  const mapRiderLocation = currentRiderLocation ? {
    lat: currentRiderLocation.lat,
    lng: currentRiderLocation.lng,
    is_moving: currentRiderLocation.is_moving || false,
    speed: currentRiderLocation.speed || null,
    last_updated: currentRiderLocation.timestamp || currentRiderLocation.last_updated
  } : null;

  return (
    <div style={mapContainer}>
      <DeliveryTrackingMap
        restaurantLocation={mapRestaurantLocation}
        customerLocation={mapDeliveryLocation}
        riderLocation={mapRiderLocation}
        showRoute={showRoute && ['rider_assigned', 'picked_up', 'out_for_delivery'].includes(orderStatus)}
        userType="customer"
        onRouteUpdate={handleRouteUpdate}
        style={{ height: '100%', width: '100%' }}
      />
      
      {/* Status Overlay */}
      <div style={statusOverlay}>
        <div style={statusText}>
          {orderStatus === 'preparing' && "🍳 Preparing your order"}
          {orderStatus === 'ready_for_pickup' && "📦 Ready for pickup"}
          {orderStatus === 'rider_assigned' && "🚴 Rider heading to restaurant"}
          {orderStatus === 'picked_up' && "📦 Order picked up"}
          {orderStatus === 'out_for_delivery' && "🛵 On the way to you!"}
          {orderStatus === 'delivered' && "✅ Delivered"}
        </div>
        
        {routeInfo && showRoute && (
          <div style={routeInfoText}>
            📍 {routeInfo.distance} km • ⏱️ {routeInfo.time} min
          </div>
        )}
      </div>

      {/* Real-time Location Info */}
      {mapRiderLocation && ['rider_assigned', 'picked_up', 'out_for_delivery'].includes(orderStatus) && (
        <div style={locationInfoOverlay}>
          <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: 4 }}>
            Rider Status:
          </div>
          <div style={{ fontSize: "0.8rem", display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{mapRiderLocation.is_moving ? '🚴 Moving' : '⏸️ Stopped'}</span>
            {mapRiderLocation.speed && (
              <span>• {Math.round(mapRiderLocation.speed)} km/h</span>
            )}
          </div>
          <div style={{ fontSize: "0.7rem", color: "#999", marginTop: 2 }}>
            Updated: {mapRiderLocation.last_updated ? 
              new Date(mapRiderLocation.last_updated).toLocaleTimeString() : 'Now'}
          </div>
        </div>
      )}
    </div>
  );
}