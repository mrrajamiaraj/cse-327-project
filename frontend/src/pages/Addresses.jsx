import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function Addresses() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // Get current session location from sessionStorage (NOT from database)
    const sessionLocation = sessionStorage.getItem("currentSessionLocation");
    if (sessionLocation) {
      setCurrentLocation(JSON.parse(sessionLocation));
    }
    
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('customer/addresses/');
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await api.delete(`customer/addresses/${addressId}/`);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      alert("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address");
    }
  };

  const handleEdit = (address) => {
    navigate("/add-address", { state: { address } });
  };

  const getIconForLabel = (label) => {
    const icons = {
      'Home': { icon: '🏠', bg: '#e7f3ff' },
      'Work': { icon: '🏢', bg: '#f5e7ff' },
      'Other': { icon: '📍', bg: '#fff3e7' }
    };
    return icons[label] || icons['Other'];
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
          Address
        </div>

        {/* Header row inside white card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "#f2f3f7",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ←
          </button>
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#555",
            }}
          >
            My Address
          </span>
        </div>

        {/* Address cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Current Session Location */}
          {currentLocation && (
            <div
              onClick={() => {
                const url = `https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
                window.open(url, '_blank');
              }}
              style={{
                background: "#f5f7fb",
                borderRadius: 14,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Left: icon + text */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 12,
                    background: "#e7f3ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  📍
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "0.8rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      marginBottom: 2,
                      color: "#444",
                    }}
                  >
                    Current Location
                  </span>
                  <span
                    style={{
                      whiteSpace: "pre-line",
                      color: "#888",
                      fontSize: "0.75rem",
                    }}
                  >
                    {currentLocation.address}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Saved Addresses */}
          {addresses.length > 0 ? (
            addresses.map((addr) => {
              const iconData = getIconForLabel(addr.title);
              return (
                <div
                  key={addr.id}
                  style={{
                    background: "#f5f7fb",
                    borderRadius: 14,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Left: icon + text */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 12,
                        background: iconData.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                      }}
                    >
                      {iconData.icon}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "0.8rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          marginBottom: 2,
                          color: "#444",
                        }}
                      >
                        {addr.title}
                      </span>
                      <span
                        style={{
                          whiteSpace: "pre-line",
                          color: "#888",
                          fontSize: "0.75rem",
                        }}
                      >
                        {addr.address.includes("|||") 
                          ? addr.address.split("|||").filter(Boolean).join(", ")
                          : addr.address
                        }
                      </span>
                    </div>
                  </div>

                  {/* Right: edit/delete icons */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: "0.9rem",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(addr)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: ORANGE,
                        fontSize: "0.9rem",
                      }}
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#e53935",
                        fontSize: "0.95rem",
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            !currentLocation && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                No addresses saved yet
              </div>
            )
          )}
        </div>

        {/* Add New Address button */}
        <button
        onClick={() => navigate("/add-address")}
        style={{
        marginTop: 30,
        width: "100%",
        padding: "11px 0",
        borderRadius: 10,
        border: "none",
        background: ORANGE,
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "0.9rem",
      }}
>
  ADD NEW ADDRESS
</button>

      </div>
    </div>
  );
}
