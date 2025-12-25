 import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import locationImg from "../assets/location.png";

const ORANGE = "#ff7a00";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

const SCREEN_WRAPPER = {
  width: "100vw",
  height: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px 0",
};

const CARD_CONTAINER = {
  width: "100%",
  maxWidth: 420,
  minHeight: 650,
  background: "#ffffff",
  borderRadius: 30,
  boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px 20px 24px",
};

const mapContainerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "20px",
  marginBottom: "16px",
};

export default function LocationAccess() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [showMap, setShowMap] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Simple address lookup without Google API (fallback)
  const getSimpleAddress = (lat, lng) => {
    return `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
  };

  const getAddressFromCoords = async (lat, lng) => {
    // Skip Google Geocoding API if not properly configured
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY") {
      return getSimpleAddress(lat, lng);
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.status === "OK" && data.results && data.results[0]) {
        return data.results[0].formatted_address;
      } else {
        // Fallback to coordinates for any API errors
        return getSimpleAddress(lat, lng);
      }
    } catch (error) {
      return getSimpleAddress(lat, lng);
    }
  };



  const requestLocation = () => {
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to get address from Google, fallback to coordinates
        let addressText;
        try {
          addressText = await getAddressFromCoords(latitude, longitude);
        } catch (err) {
          addressText = getSimpleAddress(latitude, longitude);
        }

        // Store location in state and localStorage
        const locationData = {
          latitude,
          longitude,
          address: addressText,
          timestamp: new Date().toISOString(),
          locationObtained: true, // Flag to indicate location was successfully obtained
        };

        setLocation({ lat: latitude, lng: longitude });
        setAddress(addressText);
        setShowMap(true);

        // Store in sessionStorage (cleared when browser closes) - NOT saved to database
        sessionStorage.setItem("currentSessionLocation", JSON.stringify(locationData));
        
        // Also keep in localStorage for convenience
        localStorage.setItem("userLocation", JSON.stringify(locationData));

        },
      (error) => {
        let errorMessage = "Unable to retrieve your location";

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage =
              "Location access denied. Please enable location permissions in your browser settings.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Location information unavailable. Please check your GPS settings.";
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out. Please try again or check your internet connection.";
            break;
          default:
            errorMessage = `Error getting location: ${error.message}`;
        }

        setError(errorMessage);
        
        // Clear any existing location data when location access fails
        sessionStorage.removeItem("currentSessionLocation");
        localStorage.removeItem("userLocation");
        },
      {
        enableHighAccuracy: true,
        timeout: 20000, // Increased timeout to 20 seconds
        maximumAge: 300000, // Allow cached location up to 5 minutes old
      }
    );
  };

  const handleContinue = () => {
    navigate("/home");
  };

  return (
    <div style={SCREEN_WRAPPER}>
      <div style={CARD_CONTAINER}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "#333",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Enable Location
        </h2>

        {!showMap ? (
          <>
            <img
              src={locationImg}
              alt="Location map"
              style={{
                width: 160,
                height: 160,
                borderRadius: 40,
                objectFit: "cover",
                marginBottom: 24,
                marginTop: 10,
              }}
            />

            <p
              style={{
                textAlign: "center",
                fontSize: "0.9rem",
                color: "#666",
                marginBottom: 24,
                padding: "0 20px",
                lineHeight: 1.5,
              }}
            >
              We need your location to show nearby restaurants and provide
              accurate delivery estimates
            </p>
          </>
        ) : (
          <>
            {location ? (
              isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={location}
                  zoom={15}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                  }}
                >
                  <Marker position={location} />
                </GoogleMap>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "250px",
                    borderRadius: "20px",
                    marginBottom: "16px",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                  }}
                >
                  Map unavailable (API not configured)
                </div>
              )
            ) : null}

            <div
              style={{
                width: "100%",
                padding: "16px",
                background: "#f9f9f9",
                borderRadius: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#999",
                  marginBottom: "4px",
                }}
              >
                Your Location
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#333",
                  fontWeight: 500,
                }}
              >
{address || "Getting address..."}
              </div>
            </div>
          </>
        )}

        {error && (
          <div
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 12,
              background: "#ffebee",
              color: "#c62828",
              fontSize: "0.85rem",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {!showMap ? (
          <button
            onClick={requestLocation}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 999,
              border: "none",
              background: ORANGE,
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            ACCESS LOCATION
          </button>
        ) : (
          <button
            onClick={handleContinue}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 999,
              border: "none",
              background: ORANGE,
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            CONTINUE
          </button>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "#999",
            marginTop: 8,
            padding: "0 10px",
          }}
        >
          DFOOD WILL ACCESS YOUR LOCATION ONLY WHILE USING THE APP
        </p>

        <button
          onClick={() => {
            // Clear any existing location data when user skips
            sessionStorage.removeItem("currentSessionLocation");
            localStorage.removeItem("userLocation");
            navigate("/home");
          }}
          style={{
            marginTop: 8,
            padding: "8px 16px",
            border: "none",
            background: "transparent",
            color: "#999",
            fontSize: "0.85rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
