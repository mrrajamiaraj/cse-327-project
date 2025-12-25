import { useState, useEffect } from 'react';
import DeliveryTrackingMap from './DeliveryTrackingMap';
import locationService from '../services/locationService';
import api from '../services/api';

const ORANGE = "#ff7a00";

export default function RiderTrackingMap({ 
  orderId, 
  userType = 'customer',
  onLocationUpdate,
  className = '',
  style = {}
}) {
  const [orderData, setOrderData] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // Fetch order data
  useEffect(() => {
    fetchOrderData();
  }, [orderId]);

  // Set up real-time location updates
  useEffect(() => {
    if (!orderData || !orderData.rider) return;

    const updateRiderLocation = async () => {
      try {
        const response = await api.get(`/rider/orders/get_location/?rider_id=${orderData.rider.id}`);
        const locationData = {
          lat: response.data.location.lat,
          lng: response.data.location.lng,
          name: response.data.name,
          is_moving: response.data.location.is_moving,
          speed: response.data.location.speed,
          last_updated: response.data.location.last_updated
        };
        setRiderLocation(locationData);
        
        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }
      } catch (error) {
        console.error('Failed to fetch rider location:', error);
      }
    };

    // Initial fetch
    updateRiderLocation();

    // Set up periodic updates every 5 seconds
    const interval = setInterval(updateRiderLocation, 5000);

    return () => clearInterval(interval);
  }, [orderData, onLocationUpdate]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const endpoint = userType === 'rider' 
        ? `/rider/orders/${orderId}/`
        : `/customer/orders/${orderId}/`;
      
      const response = await api.get(endpoint);
      setOrderData(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch order data:', error);
      setError('Failed to load order information');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteUpdate = (info) => {
    setRouteInfo(info);
  };

  if (loading) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔄</div>
          <div>Loading tracking information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div style={{ textAlign: 'center', color: '#ff4444' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>❌</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📦</div>
          <div>No order data available</div>
        </div>
      </div>
    );
  }

  // Prepare locations for the map
  const restaurantLocation = orderData.restaurant ? {
    lat: orderData.restaurant.lat || 23.8103,
    lng: orderData.restaurant.lng || 90.4125,
    name: orderData.restaurant.name,
    address: orderData.restaurant.address
  } : null;

  const customerLocation = orderData.address ? {
    lat: orderData.address.lat,
    lng: orderData.address.lng,
    address: orderData.address.address
  } : orderData.delivery_location ? {
    lat: orderData.delivery_location.lat,
    lng: orderData.delivery_location.lng,
    address: orderData.delivery_location.address || 'Customer Location'
  } : null;

  // Determine if route should be shown based on order status
  const shouldShowRoute = ['rider_assigned', 'picked_up', 'out_for_delivery'].includes(orderData.status);

  return (
    <div className={className} style={style}>
      <DeliveryTrackingMap
        restaurantLocation={restaurantLocation}
        customerLocation={customerLocation}
        riderLocation={riderLocation}
        showRoute={shouldShowRoute}
        userType={userType}
        onRouteUpdate={handleRouteUpdate}
        style={{ height: '100%', width: '100%' }}
      />
      
      {/* Status Information */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontSize: '0.8rem',
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontWeight: '600', color: ORANGE }}>
            Order #{orderId}
          </div>
          <div style={{ 
            padding: '2px 8px', 
            borderRadius: '12px', 
            background: getStatusColor(orderData.status),
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: '600'
          }}>
            {getStatusText(orderData.status)}
          </div>
        </div>
        
        {riderLocation && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
            <div>
              🚴 {riderLocation.is_moving ? 'Moving' : 'Stopped'}
              {riderLocation.speed && ` • ${Math.round(riderLocation.speed)} km/h`}
            </div>
            <div>
              Updated: {riderLocation.last_updated ? new Date(riderLocation.last_updated).toLocaleTimeString() : 'Now'}
            </div>
          </div>
        )}
        
        {routeInfo && (
          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#333', fontWeight: '600' }}>
            📍 Distance: {routeInfo.distance} km • ⏱️ ETA: {routeInfo.time} min
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getStatusColor(status) {
  const colors = {
    'pending': '#ffc107',
    'preparing': '#ff7a00',
    'ready_for_pickup': '#17a2b8',
    'rider_assigned': '#007bff',
    'picked_up': '#6f42c1',
    'out_for_delivery': '#28a745',
    'delivered': '#28a745',
    'cancelled': '#dc3545'
  };
  return colors[status] || '#6c757d';
}

function getStatusText(status) {
  const texts = {
    'pending': 'Pending',
    'preparing': 'Preparing',
    'ready_for_pickup': 'Ready',
    'rider_assigned': 'Rider Assigned',
    'picked_up': 'Picked Up',
    'out_for_delivery': 'On the Way',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled'
  };
  return texts[status] || status;
}