import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import api from "../services/api";

const ORANGE = "#ff7a00";
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "18px",
};

export default function AddAddress() {
  const navigate = useNavigate();
  const location = useLocation();
  const editAddress = location.state?.address;

  // simple form state
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [postCode, setPostCode] = useState("");
  const [apartment, setApartment] = useState("");
  const [label, setLabel] = useState("Home");

  // map center (default: NSU)
  const [coords, setCoords] = useState({
    lat: 23.8151,
    lng: 90.4277,
  });

  // Load existing address if editing
  useEffect(() => {
    if (editAddress) {
      setLabel(editAddress.title);
      
      // Parse the combined address back into separate fields
      // Check if it's the new format (with |||) or old format (with commas)
      if (editAddress.address.includes("|||")) {
        // New format: address|||street|||apartment|||postCode
        const parts = editAddress.address.split("|||");
        setAddress(parts[0] || "");
        setStreet(parts[1] || "");
        setApartment(parts[2] || "");
        setPostCode(parts[3] || "");
      } else {
        // Old format: fallback to comma separation
        const parts = editAddress.address.split(", ");
        if (parts.length >= 1) setAddress(parts[0] || "");
        if (parts.length >= 2) setStreet(parts[1] || "");
        if (parts.length >= 3) setApartment(parts[2] || "");
        if (parts.length >= 4) setPostCode(parts[3] || "");
      }
      
      setCoords({ lat: editAddress.lat, lng: editAddress.lng });
    }
  }, [editAddress]);

  // Use session location if available, otherwise use default
  useEffect(() => {
    if (!editAddress) {
      const sessionLocation = sessionStorage.getItem("currentSessionLocation");
      if (sessionLocation) {
        const loc = JSON.parse(sessionLocation);
        setCoords({ lat: loc.latitude, lng: loc.longitude });
      }
      // Don't automatically request location - user can manually adjust on map
    }
  }, [editAddress]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!address.trim()) {
      alert("Please enter an address");
      return;
    }

    
    // Combine all address fields with a special separator to preserve empty fields
    // Format: address|||street|||apartment|||postCode
    const fullAddress = `${address}|||${street}|||${apartment}|||${postCode}`;
    
    const data = {
      title: label,
      address: fullAddress,
      lat: coords.lat,
      lng: coords.lng,
      is_default: false
    };

    try {
      if (editAddress) {
        // Update existing address
        await api.put(`customer/addresses/${editAddress.id}/`, data);
        alert("Address updated successfully!");
      } else {
        // Create new address
        await api.post('customer/addresses/', data);
        alert("Address saved successfully!");
      }
      navigate("/addresses");
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
    } finally {
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });



  const handleMapClick = async (e) => {
    const newLat = e.latLng.lat();
    const newLng = e.latLng.lng();
    setCoords({ lat: newLat, lng: newLng });
    
    // Don't auto-fill - let user enter address manually
    // Just update the coordinates display
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f2f2f2",
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 32,
          background: "#ffffff",
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          padding: "16px 16px 20px",
        }}
      >
        {/* Grey top label */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#b0b0b0",
            marginBottom: 10,
          }}
        >
          {editAddress ? "Edit Address" : "Add New Address"}
        </div>

        {/* Map area with back button */}
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 14,
            position: "relative",
            height: 180,
          }}
        >
          {/* Interactive Google Map */}
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={coords}
              zoom={15}
              onClick={handleMapClick}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              <Marker position={coords} />
            </GoogleMap>
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                fontSize: "0.85rem",
              }}
            >
              Map Loading
            </div>
          )}

          {/* Back button over map */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              background: "#20252f",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              zIndex: 10,
            }}
          >
            ←
          </button>
        </div>

        {/* Form card (white) */}
        <form onSubmit={handleSave}>
          {/* LOCATION COORDINATES (Read-only) */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 6,
              marginBottom: 6,
            }}>
              <span style={{ fontSize: "1rem" }}>📍</span>
              <FieldLabel label="Location Coordinates" style={{ marginBottom: 0, marginTop: 0 }} />
            </div>
            <div style={{
              background: "#fff7f0",
              border: `1px solid ${ORANGE}30`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: "0.8rem",
              color: "#666",
              fontFamily: "monospace",
            }}>
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </div>
          </div>

          {/* Delivery Details Section */}
          <div style={{
            background: "#f9fafb",
            borderRadius: 12,
            padding: "14px",
            marginBottom: 16,
          }}>
            <h3 style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#333",
              marginBottom: 12,
              marginTop: 0,
            }}>
              🍔 Delivery Address
            </h3>

            {/* ADDRESS */}
            <div style={{ marginBottom: 10 }}>
              <FieldLabel label="Address" />
              <InputBox 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                required
              />
            </div>

            {/* STREET NUMBER + FLAT NUMBER in same row */}
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <FieldLabel label="Street No." />
                <InputBox
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street no."
                />
              </div>
              <div style={{ flex: 1 }}>
                <FieldLabel label="Flat No." />
                <InputBox
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Flat no."
                />
              </div>
            </div>

            {/* POSTAL CODE */}
            <div style={{ marginBottom: 0, maxWidth: "150px" }}>
              <FieldLabel label="Postal Code" />
              <InputBox
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
                placeholder="Postal code"
              />
            </div>
          </div>

          {/* LABEL AS buttons */}
          <div style={{ marginBottom: 20 }}>
            <FieldLabel label="Save As" />
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 8,
              }}
            >
              {[
                { name: "Home", icon: "🏠" },
                { name: "Work", icon: "🏢" },
                { name: "Other", icon: "📍" }
              ].map((item) => {
                const active = label === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setLabel(item.name)}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: 12,
                      border: active ? `2px solid ${ORANGE}` : "2px solid #e5e7eb",
                      background: active ? "#fff7f0" : "#fff",
                      color: active ? ORANGE : "#666",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      fontWeight: active ? 600 : 500,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SAVE LOCATION button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: 12,
              border: "none",
              background: ORANGE,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "all 0.2s ease",
            }}
          >
editAddress ? "✓ UPDATE ADDRESS" : "✓ SAVE ADDRESS"
          </button>
        </form>
      </div>
    </div>
  );
}

function FieldLabel({ label, style }) {
  return (
    <div
      style={{
        fontSize: "0.7rem",
        color: "#666",
        marginBottom: 4,
        marginTop: 6,
        fontWeight: 500,
        ...style,
      }}
    >
      {label}
    </div>
  );
}

function InputBox({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "#fff",
        fontSize: "0.85rem",
        outline: "none",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = ORANGE;
        e.target.style.boxShadow = `0 0 0 3px ${ORANGE}15`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#e5e7eb";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}
