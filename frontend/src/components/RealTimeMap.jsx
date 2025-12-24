// src/components/RealTimeMap.jsx
import { useState, useEffect, useRef } from "react";

const ORANGE = "#ff7a00";

export default function RealTimeMap({ 
  restaurantLocation, 
  deliveryLocation, 
  riderLocation, 
  orderStatus,
  showRoute = true 
}) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});

  useEffect(() => {
    // Load Google Maps API
    if (!window.google) {
      loadGoogleMapsAPI();
    } else {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (map && mapLoaded) {
      updateMapMarkers();
    }
  }, [restaurantLocation, deliveryLocation, riderLocation, orderStatus, map, mapLoaded]);

  const loadGoogleMapsAPI = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    // Default center (Dhaka, Bangladesh)
    const defaultCenter = { lat: 23.8103, lng: 90.4125 };
    
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: restaurantLocation || defaultCenter,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    setMap(mapInstance);
    setMapLoaded(true);
  };

  const updateMapMarkers = () => {
    if (!map || !window.google) return;

    // Clear existing markers
    Object.values(markers).forEach(marker => marker.setMap(null));
    const newMarkers = {};

    const bounds = new window.google.maps.LatLngBounds();

    // Restaurant marker
    if (restaurantLocation) {
      const restaurantMarker = new window.google.maps.Marker({
        position: restaurantLocation,
        map: map,
        title: "Restaurant",
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#28a745" stroke="white" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🏪</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });
      newMarkers.restaurant = restaurantMarker;
      bounds.extend(restaurantLocation);
    }

    // Delivery location marker
    if (deliveryLocation) {
      const deliveryMarker = new window.google.maps.Marker({
        position: deliveryLocation,
        map: map,
        title: "Delivery Location",
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#dc3545" stroke="white" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🏠</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });
      newMarkers.delivery = deliveryMarker;
      bounds.extend(deliveryLocation);
    }

    // Rider marker (if available and order is in progress)
    if (riderLocation && ['rider_assigned', 'picked_up', 'out_for_delivery'].includes(orderStatus)) {
      const riderMarker = new window.google.maps.Marker({
        position: { lat: riderLocation.lat, lng: riderLocation.lng },
        map: map,
        title: "Delivery Rider",
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${ORANGE}" stroke="white" stroke-width="3"/>
              <text x="20" y="26" text-anchor="middle" fill="white" font-size="16">🚴</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });
      newMarkers.rider = riderMarker;
      bounds.extend({ lat: riderLocation.lat, lng: riderLocation.lng });

      // Add rider movement animation if moving
      if (riderLocation.is_moving) {
        riderMarker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => riderMarker.setAnimation(null), 2000);
      }
    }

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
      
      // Don't zoom too close if only one marker
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 16) map.setZoom(16);
        window.google.maps.event.removeListener(listener);
      });
    }

    // Draw route if requested and we have the necessary points
    if (showRoute && riderLocation && deliveryLocation && orderStatus === 'out_for_delivery') {
      drawRoute(
        { lat: riderLocation.lat, lng: riderLocation.lng },
        deliveryLocation
      );
    }
  };

  const drawRoute = (origin, destination) => {
    if (!window.google || !map) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true, // We have our own markers
      polylineOptions: {
        strokeColor: ORANGE,
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    directionsRenderer.setMap(map);

    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      avoidTolls: true
    }, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      }
    });
  };

  // Fallback map for when Google Maps is not available
  const FallbackMap = () => (
    <div style={fallbackMapStyle}>
      <div style={fallbackContent}>
        <div style={{ fontSize: "2rem", marginBottom: 16 }}>🗺️</div>
        <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 8 }}>
          Real-time Map Tracking
        </div>
        <div style={{ fontSize: "0.8rem", color: "#666", textAlign: "center" }}>
          {orderStatus === 'preparing' && "🍳 Your food is being prepared"}
          {orderStatus === 'ready_for_pickup' && "📦 Food is ready, waiting for rider"}
          {orderStatus === 'rider_assigned' && "🚴 Rider is heading to restaurant"}
          {orderStatus === 'picked_up' && "🚚 Rider has picked up your order"}
          {orderStatus === 'out_for_delivery' && "🛵 Rider is on the way to you!"}
          {orderStatus === 'delivered' && "✅ Order delivered successfully"}
        </div>
        
        {riderLocation && (
          <div style={locationInfo}>
            <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: 4 }}>
              Rider Location:
            </div>
            <div style={{ fontSize: "0.8rem" }}>
              📍 Lat: {riderLocation.lat.toFixed(4)}, Lng: {riderLocation.lng.toFixed(4)}
            </div>
            {riderLocation.is_moving && (
              <div style={{ fontSize: "0.75rem", color: ORANGE, marginTop: 4 }}>
                🚴 Rider is moving
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={mapContainer}>
      {!window.google ? (
        <FallbackMap />
      ) : (
        <div ref={mapRef} style={mapStyle} />
      )}
      
      {/* Map Legend */}
      <div style={mapLegend}>
        <div style={legendItem}>
          <span style={{ ...legendIcon, background: "#28a745" }}>🏪</span>
          <span style={legendText}>Restaurant</span>
        </div>
        {riderLocation && (
          <div style={legendItem}>
            <span style={{ ...legendIcon, background: ORANGE }}>🚴</span>
            <span style={legendText}>Rider</span>
          </div>
        )}
        <div style={legendItem}>
          <span style={{ ...legendIcon, background: "#dc3545" }}>🏠</span>
          <span style={legendText}>Delivery</span>
        </div>
      </div>
    </div>
  );
}

/* Styles */
const mapContainer = {
  position: "relative",
  width: "100%",
  height: 300,
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #e0e0e0"
};

const mapStyle = {
  width: "100%",
  height: "100%"
};

const fallbackMapStyle = {
  width: "100%",
  height: "100%",
  background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const fallbackContent = {
  textAlign: "center",
  padding: 20
};

const locationInfo = {
  background: "rgba(255, 255, 255, 0.9)",
  borderRadius: 8,
  padding: 12,
  marginTop: 16,
  border: "1px solid #e0e0e0"
};

const mapLegend = {
  position: "absolute",
  top: 10,
  right: 10,
  background: "rgba(255, 255, 255, 0.95)",
  borderRadius: 8,
  padding: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const legendItem = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 4
};

const legendIcon = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
  color: "white"
};

const legendText = {
  fontSize: "0.7rem",
  color: "#333"
};