import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different markers
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: white;
        font-weight: bold;
      ">${icon}</div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const restaurantIcon = createCustomIcon('#ff7a00', '🏪');
const customerIcon = createCustomIcon('#28a745', '🏠');
const riderIcon = createCustomIcon('#007bff', '🚴');

// Routing component
function RoutingMachine({ waypoints, onRouteFound }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control
    routingControlRef.current = L.Routing.control({
      waypoints: waypoints.map(point => L.latLng(point.lat, point.lng)),
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: () => null, // Don't create default markers
      lineOptions: {
        styles: [{ color: '#ff7a00', weight: 4, opacity: 0.8 }]
      },
      show: false,
      collapsible: true,
      fitSelectedRoutes: true
    }).on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      if (onRouteFound) {
        onRouteFound({
          distance: (summary.totalDistance / 1000).toFixed(1), // km
          time: Math.round(summary.totalTime / 60) // minutes
        });
      }
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, waypoints, onRouteFound]);

  return null;
}

// Auto-fit bounds component
function AutoFitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      const validPositions = positions.filter(pos => pos && pos.lat && pos.lng);
      if (validPositions.length > 0) {
        const bounds = L.latLngBounds(validPositions.map(pos => [pos.lat, pos.lng]));
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, positions]);

  return null;
}

export default function DeliveryTrackingMap({
  restaurantLocation,
  customerLocation,
  riderLocation,
  showRoute = false,
  userType = 'customer', // 'customer', 'rider', 'restaurant'
  onRouteUpdate,
  className = '',
  style = {}
}) {
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]); // Default to Dhaka

  // Determine waypoints for routing
  const getWaypoints = () => {
    if (!showRoute) return [];
    
    const points = [];
    if (restaurantLocation && restaurantLocation.lat && restaurantLocation.lng) {
      points.push(restaurantLocation);
    }
    if (riderLocation && riderLocation.lat && riderLocation.lng) {
      points.push(riderLocation);
    }
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      points.push(customerLocation);
    }
    
    return points.length >= 2 ? points : [];
  };

  // Get all positions for auto-fitting bounds
  const getAllPositions = () => {
    const positions = [];
    if (restaurantLocation && restaurantLocation.lat && restaurantLocation.lng) {
      positions.push(restaurantLocation);
    }
    if (customerLocation && customerLocation.lat && customerLocation.lng) {
      positions.push(customerLocation);
    }
    if (riderLocation && riderLocation.lat && riderLocation.lng) {
      positions.push(riderLocation);
    }
    return positions;
  };

  // Update map center based on user type and available locations
  useEffect(() => {
    if (userType === 'customer' && customerLocation) {
      setMapCenter([customerLocation.lat, customerLocation.lng]);
    } else if (userType === 'rider' && riderLocation) {
      setMapCenter([riderLocation.lat, riderLocation.lng]);
    } else if (userType === 'restaurant' && restaurantLocation) {
      setMapCenter([restaurantLocation.lat, restaurantLocation.lng]);
    }
  }, [userType, customerLocation, riderLocation, restaurantLocation]);

  const handleRouteFound = (info) => {
    setRouteInfo(info);
    if (onRouteUpdate) {
      onRouteUpdate(info);
    }
  };

  const defaultStyle = {
    height: '400px',
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
    ...style
  };

  return (
    <div className={className} style={defaultStyle}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Restaurant Marker */}
        {restaurantLocation && restaurantLocation.lat && restaurantLocation.lng && (
          <Marker 
            position={[restaurantLocation.lat, restaurantLocation.lng]} 
            icon={restaurantIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>🏪 Restaurant</strong>
                <br />
                {restaurantLocation.name || 'Pickup Location'}
                <br />
                <small>{restaurantLocation.address || `${restaurantLocation.lat}, ${restaurantLocation.lng}`}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Customer Marker */}
        {customerLocation && customerLocation.lat && customerLocation.lng && (
          <Marker 
            position={[customerLocation.lat, customerLocation.lng]} 
            icon={customerIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>🏠 Customer</strong>
                <br />
                Delivery Location
                <br />
                <small>{customerLocation.address || `${customerLocation.lat}, ${customerLocation.lng}`}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Rider Marker */}
        {riderLocation && riderLocation.lat && riderLocation.lng && (
          <Marker 
            position={[riderLocation.lat, riderLocation.lng]} 
            icon={riderIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong>🚴 Delivery Rider</strong>
                <br />
                {riderLocation.name || 'Current Location'}
                <br />
                <small>
                  {riderLocation.is_moving ? '🚴 Moving' : '⏸️ Stopped'}
                  {riderLocation.speed && ` • ${riderLocation.speed} km/h`}
                </small>
                <br />
                <small>Updated: {riderLocation.last_updated ? new Date(riderLocation.last_updated).toLocaleTimeString() : 'Now'}</small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Routing */}
        {showRoute && <RoutingMachine waypoints={getWaypoints()} onRouteFound={handleRouteFound} />}

        {/* Auto-fit bounds */}
        <AutoFitBounds positions={getAllPositions()} />
      </MapContainer>

      {/* Route Info Display */}
      {routeInfo && showRoute && (
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
    </div>
  );
}