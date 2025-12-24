import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import api from "../services/api";

const ORANGE = "#ff7a00";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

// Check if we have a valid API key
const hasValidApiKey = GOOGLE_MAPS_API_KEY && 
  GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY" && 
  GOOGLE_MAPS_API_KEY !== "your_google_maps_api_key_here";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

export default function RestaurantSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [restaurantData, setRestaurantData] = useState({
    name: "",
    cuisine: "",
    address_title: "",
    address_line: "",
    area: "",
    city: "",
    postal_code: "",
    lat: 23.8103,
    lng: 90.4125,
    prep_time_minutes: 20
  });

  // Google Maps loader - only load if we have a valid API key
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    loadingElement: <div>Loading...</div>,
  });

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      const response = await api.get('/restaurant/profile/');
      setRestaurantData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      setError("Failed to load restaurant data");
      setLoading(false);
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const handleInputChange = (field, value) => {
    setRestaurantData(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
    setSuccess("");
  };

  const handleMapClick = (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setRestaurantData(prev => ({
      ...prev,
      lat: newLat,
      lng: newLng
    }));
    setSuccess("Location updated from map!");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!restaurantData.name.trim()) {
        setError("Restaurant name is required");
        setSaving(false);
        return;
      }
      
      if (!restaurantData.address_line.trim()) {
        setError("Address line is required");
        setSaving(false);
        return;
      }

      const response = await api.put('/restaurant/profile/', restaurantData);
      setSuccess("Restaurant settings updated successfully!");
      
      // Update local storage if user data changed
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...user,
        restaurant_name: restaurantData.name
      }));
      
    } catch (error) {
      console.error("Error saving restaurant data:", error);
      setError(error.response?.data?.error || "Failed to save restaurant settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={pageTitle}>Restaurant Settings</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px"}}>
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={pageTitle}>Restaurant Settings</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={header}>
            <button onClick={() => navigate(-1)} style={backBtn}>
              ←
            </button>
            <div style={headerTitle}>Restaurant Settings</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Form */}
          <div style={formContainer}>
            {error && (
              <div style={errorMessage}>
                {error}
              </div>
            )}
            
            {success && (
              <div style={successMessage}>
                {success}
              </div>
            )}

            {/* Basic Info */}
            <div style={section}>
              <div style={sectionTitle}>Basic Information</div>
              
              <div style={inputGroup}>
                <label style={label}>Restaurant Name *</label>
                <input
                  type="text"
                  value={restaurantData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={input}
                  placeholder="Enter restaurant name"
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Cuisine Type</label>
                <input
                  type="text"
                  value={restaurantData.cuisine}
                  onChange={(e) => handleInputChange('cuisine', e.target.value)}
                  style={input}
                  placeholder="e.g., Italian, Fast Food, Asian Fusion"
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Preparation Time (minutes)</label>
                <input
                  type="number"
                  value={restaurantData.prep_time_minutes}
                  onChange={(e) => handleInputChange('prep_time_minutes', parseInt(e.target.value) || 20)}
                  style={input}
                  min="5"
                  max="120"
                />
              </div>
            </div>

            {/* Address Section */}
            <div style={section}>
              <div style={sectionTitle}>Restaurant Address</div>
              
              <div style={inputGroup}>
                <label style={label}>Address Title</label>
                <input
                  type="text"
                  value={restaurantData.address_title}
                  onChange={(e) => handleInputChange('address_title', e.target.value)}
                  style={input}
                  placeholder="e.g., Main Branch, Downtown Location"
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Address Line *</label>
                <textarea
                  value={restaurantData.address_line}
                  onChange={(e) => handleInputChange('address_line', e.target.value)}
                  style={{...input, minHeight: "60px", resize: "vertical"}}
                  placeholder="Enter full address (street, building, etc.)"
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Area/Neighborhood</label>
                <input
                  type="text"
                  value={restaurantData.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  style={input}
                  placeholder="e.g., Dhanmondi, Gulshan, Old Dhaka"
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>City</label>
                <input
                  type="text"
                  value={restaurantData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  style={input}
                  placeholder="e.g., Dhaka, Chittagong"
                />
              </div>

              <div style={inputGroup}>
                <label style={label}>Postal Code</label>
                <input
                  type="text"
                  value={restaurantData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  style={input}
                  placeholder="e.g., 1209, 1000"
                />
              </div>
            </div>

            {/* Location Section */}
            <div style={section}>
              <div style={sectionTitle}>Restaurant Location</div>
              <div style={locationNote}>
                {hasValidApiKey 
                  ? "Click on the map to set your restaurant's precise location. This helps customers find you and improves delivery accuracy."
                  : "Set your restaurant's precise location using the coordinate inputs below. This helps customers find you and improves delivery accuracy."
                }
              </div>
              
              {/* Interactive Map */}
              <div style={mapContainer}>
                {!hasValidApiKey ? (
                  <div style={mapPlaceholder}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.2rem", marginBottom: "8px" }}>🗺️</div>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>Map Not Available</div>
                      <div style={{ fontSize: "0.7rem", color: "#666" }}>
                        Google Maps API key not configured
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "4px" }}>
                        Use manual coordinates below
                      </div>
                    </div>
                  </div>
                ) : isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={{ lat: restaurantData.lat, lng: restaurantData.lng }}
                    zoom={15}
                    onClick={handleMapClick}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      gestureHandling: 'cooperative',
                    }}
                    onLoad={() => console.log('Map loaded successfully')}
                    onError={(error) => console.error('Map error:', error)}
                  >
                    <Marker position={{ lat: restaurantData.lat, lng: restaurantData.lng }} />
                  </GoogleMap>
                ) : (
                  <div style={mapPlaceholder}>
                    <div>Loading Google Maps...</div>
                    <div style={{ fontSize: "0.7rem", marginTop: "4px", color: "#999" }}>
                      Please wait...
                    </div>
                  </div>
                )}
              </div>

              {/* Location Coordinates Display */}
              <div style={coordinatesDisplay}>
                <div style={coordinatesLabel}>
                  📍 Restaurant Location
                </div>
                <div style={coordinatesValue}>
                  {restaurantData.lat.toFixed(6)}, {restaurantData.lng.toFixed(6)}
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <label style={label}>Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={restaurantData.lat}
                    onChange={(e) => handleInputChange('lat', parseFloat(e.target.value) || 0)}
                    style={input}
                    placeholder="23.8103"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={label}>Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={restaurantData.lng}
                    onChange={(e) => handleInputChange('lng', parseFloat(e.target.value) || 0)}
                    style={input}
                    placeholder="90.4125"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...saveBtn,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer"
              }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
const pageWrap = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f2f2f2",
  display: "flex",
  justifyContent: "center",
  padding: "24px 0",
};

const pageTitle = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 16,
  textAlign: "center",
};

const phoneCard = {
  width: "100%",
  maxWidth: 380,
  borderRadius: 32,
  background: "#ffffff",
  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
  overflow: "hidden",
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid #f0f0f0",
};

const backBtn = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "#f2f3f7",
  cursor: "pointer",
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const headerTitle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
};

const formContainer = {
  padding: "20px",
};

const section = {
  marginBottom: "24px",
};

const sectionTitle = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: "12px",
  paddingBottom: "6px",
  borderBottom: "2px solid " + ORANGE,
};

const inputGroup = {
  marginBottom: "16px",
};

const label = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#555",
  marginBottom: "6px",
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  fontSize: "0.8rem",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const locationNote = {
  fontSize: "0.7rem",
  color: "#666",
  marginBottom: "12px",
  padding: "8px 12px",
  background: "#f8f9fa",
  borderRadius: "6px",
  border: "1px solid #e9ecef",
};

const saveBtn = {
  width: "100%",
  padding: "12px",
  background: ORANGE,
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "pointer",
  marginTop: "20px",
  transition: "background-color 0.2s",
};

const errorMessage = {
  background: "#ffebee",
  border: "1px solid #f44336",
  borderRadius: "6px",
  padding: "10px 12px",
  fontSize: "0.75rem",
  color: "#d32f2f",
  marginBottom: "16px",
};

const successMessage = {
  background: "#e8f5e8",
  border: "1px solid #4caf50",
  borderRadius: "6px",
  padding: "10px 12px",
  fontSize: "0.75rem",
  color: "#2e7d32",
  marginBottom: "16px",
};

const mapContainer = {
  width: "100%",
  height: "200px",
  borderRadius: "12px",
  overflow: "hidden",
  marginBottom: "12px",
  border: "2px solid #e0e0e0",
  position: "relative",
};

const mapPlaceholder = {
  width: "100%",
  height: "100%",
  background: "#f0f0f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#666",
  fontSize: "0.85rem",
};

const coordinatesDisplay = {
  background: "#fff7f0",
  border: "1px solid " + ORANGE + "30",
  borderRadius: "8px",
  padding: "10px 12px",
  marginBottom: "12px",
};

const coordinatesLabel = {
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#666",
  marginBottom: "4px",
};

const coordinatesValue = {
  fontSize: "0.8rem",
  fontFamily: "monospace",
  color: "#333",
  fontWeight: 600,
};