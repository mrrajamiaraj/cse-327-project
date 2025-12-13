import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import api from "../services/api";

import pizzaCalzone from "../assets/pizza-calzone.png";
import pizzaRoma from "../assets/pizza-roma.png";

const ORANGE = "#ff7a00";

export default function EditCart() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]); // Store original cart state
  const [removedItems, setRemovedItems] = useState([]); // Track removed items
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchCartData();
    fetchAddresses();
    loadSelectedAddress();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('customer/addresses/');
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const loadSelectedAddress = () => {
    // Load selected delivery address from localStorage
    const savedAddressId = localStorage.getItem("selectedDeliveryAddressId");
    const savedAddress = localStorage.getItem("selectedDeliveryAddress");
    
    if (savedAddressId && savedAddress) {
      setSelectedAddressId(parseInt(savedAddressId));
      setSelectedAddress(JSON.parse(savedAddress));
    } else {
      // Fallback to current location if available
      const sessionLocation = sessionStorage.getItem('currentSessionLocation');
      if (sessionLocation) {
        setSelectedAddress(JSON.parse(sessionLocation));
      }
    }
  };

  const fetchCartData = async () => {
    try {
      const response = await api.get('customer/cart/');
      console.log("Cart API Response:", response.data);
      
      // Transform backend data to match component structure
      const transformedItems = response.data.items?.map(item => ({
        id: item.id,
        name: item.food.name,
        size: item.variants?.join(", ") || 'Regular',
        price: parseFloat(item.food.price),
        qty: item.quantity,
        image: item.food.image || pizzaCalzone, // Use backend image URL or fallback
        foodId: item.food.id
      })) || [];
      
      setItems(transformedItems);
      setOriginalItems(transformedItems); // Store original state
    } catch (error) {
      console.error("Error fetching cart:", error);
      // Fallback to sample data if API fails
      const fallbackItems = [
        {
          id: 1,
          name: "Pizza Calzone",
          size: '14"',
          price: 640,
          qty: 1,
          image: pizzaCalzone,
        },
        {
          id: 2,
          name: "Pizza Roma",
          size: '14"',
          price: 520,
          qty: 1,
          image: pizzaRoma,
        },
      ];
      setItems(fallbackItems);
      setOriginalItems(fallbackItems); // Store original state
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address) => {
    localStorage.setItem("selectedDeliveryAddressId", address.id);
    localStorage.setItem("selectedDeliveryAddress", JSON.stringify(address));
    setSelectedAddressId(address.id);
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleSelectCurrentLocation = () => {
    localStorage.removeItem("selectedDeliveryAddressId");
    localStorage.removeItem("selectedDeliveryAddress");
    setSelectedAddressId(null);
    const sessionLocation = sessionStorage.getItem('currentSessionLocation');
    if (sessionLocation) {
      setSelectedAddress(JSON.parse(sessionLocation));
    }
    setShowAddressModal(false);
  };

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );

  const hasChanges = useMemo(() => {
    if (removedItems.length > 0) return true;
    
    return items.some(item => {
      const originalItem = originalItems.find(orig => orig.id === item.id);
      return !originalItem || originalItem.qty !== item.qty;
    });
  }, [items, originalItems, removedItems]);

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const newQty = Math.max(1, it.qty + delta);
          return { ...it, qty: newQty };
        }
        return it;
      })
    );
  };

  const removeItem = (id) => {
    const itemToRemove = items.find(it => it.id === id);
    if (itemToRemove) {
      setRemovedItems(prev => [...prev, itemToRemove]);
      setItems(prev => prev.filter(it => it.id !== id));
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Remove items that were deleted
      for (const removedItem of removedItems) {
        await api.delete(`customer/cart/${removedItem.id}/remove_item/`);
      }

      // Update quantities for remaining items
      for (const item of items) {
        const originalItem = originalItems.find(orig => orig.id === item.id);
        if (originalItem && originalItem.qty !== item.qty) {
          await api.patch(`customer/cart/${item.id}/update_item/`, { quantity: item.qty });
        }
      }

      console.log("All changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes");
      throw error; // Re-throw to prevent navigation
    } finally {
      setSaving(false);
    }
  };

  // DONE button (top-right)
  const handleDone = async () => {
    try {
      await saveChanges();
      navigate(-1); // go back to normal cart only after successful save
    } catch (error) {
      // Stay on page if save failed
    }
  };

  // ⬇⬇⬇ IMPORTANT: same as Cart.jsx
  const handlePlaceOrder = () => {
    navigate("/payment", { state: { total } });
  };
  // ⬆⬆⬆

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#222' }}>
        Loading cart...
      </div>
    );
  }

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
        }}
      >
        {/* blue title above card */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#1e88e5",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          My Cart
          {hasChanges && (
            <span style={{
              fontSize: "0.7rem",
              background: "#ff7a00",
              color: "#fff",
              padding: "2px 6px",
              borderRadius: 4,
              fontWeight: 600,
            }}>
              UNSAVED
            </span>
          )}
        </div>

        <div
          style={{
            borderRadius: 32,
            background: "#111321",
            boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
            overflow: "hidden",
          }}
        >
          {/* dark top section */}
          <div
            style={{
              padding: "16px 16px 22px",
              color: "#fff",
            }}
          >
            {/* header row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <button
                  onClick={() => {
                    if (hasChanges) {
                      const confirmDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
                      if (!confirmDiscard) return;
                    }
                    navigate(-1);
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "none",
                    background: "#1e202f",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ←
                </button>
                <span
                  style={{ fontSize: "0.9rem", fontWeight: 600 }}
                >
                  Cart
                </span>
              </div>

              <button
                onClick={handleDone}
                disabled={saving}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "0.75rem",
                  color: saving ? "#999" : (hasChanges ? "#ff7a00" : "#7fe089"),
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                {saving ? "SAVING..." : (hasChanges ? "SAVE" : "DONE")}
              </button>
            </div>

            {/* items with delete buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 10,
                  }}
                >
                  {/* image */}
                  <div
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 18,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  {/* text + controls */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "4px 0",
                    }}
                  >
                    {/* name + red X */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        {item.name}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          border: "none",
                          background: "#f44336",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        ×
                      </button>
                    </div>

                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        marginTop: 2,
                      }}
                    >
                      ৳{item.price}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#b0b0b0",
                      }}
                    >
                      {item.size}
                    </div>

                    {/* qty controls */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginTop: 6,
                      }}
                    >
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        style={qtyButtonStyle}
                      >
                        −
                      </button>

                      <span
                        style={{
                          minWidth: 16,
                          textAlign: "center",
                          fontSize: "0.85rem",
                        }}
                      >
                        {item.qty}
                      </span>

                      <button
                        onClick={() => updateQty(item.id, 1)}
                        style={qtyButtonStyle}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* white bottom sheet – same as Cart */}
          <div
            style={{
              background: "#fff",
              borderTopLeftRadius: 26,
              borderTopRightRadius: 26,
              padding: "14px 16px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.7rem",
                color: "#a0a0a0",
                marginBottom: 6,
              }}
            >
              <span>DELIVERY ADDRESS</span>
              <button
                onClick={() => setShowAddressModal(true)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "0.7rem",
                  color: "#ff7a00",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                CHANGE
              </button>
            </div>

            <div
              onClick={() => setShowAddressModal(true)}
              style={{
                background: "#f4f6fb",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: "0.8rem",
                color: "#555",
                marginBottom: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                {selectedAddress 
                  ? (selectedAddress.title 
                      ? `${selectedAddress.title} - ${selectedAddress.address?.includes("|||") 
                          ? selectedAddress.address.split("|||").filter(Boolean).join(", ")
                          : selectedAddress.address}`
                      : selectedAddress.address)
                  : "Select delivery address"}
              </span>
              <span style={{ fontSize: "0.9rem", color: "#999" }}>▼</span>
            </div>

            {/* total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                fontSize: "0.85rem",
              }}
            >
              <div>
                <span style={{ color: "#a0a0a0", marginRight: 4 }}>
                  TOTAL:
                </span>
                <span style={{ fontWeight: 700 }}>৳{total}</span>
              </div>

              <button
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "0.75rem",
                  color: "#ff7a00",
                  cursor: "pointer",
                }}
              >
                Breakdown &gt;
              </button>
            </div>

            {/* PLACE ORDER – now works */}
            <button
              onClick={handlePlaceOrder}
              style={{
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
              PLACE ORDER
            </button>
          </div>
        </div>

        {/* Address Selection Modal */}
        {showAddressModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowAddressModal(false)}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "20px",
                maxWidth: 380,
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", color: "#333" }}>
                Select Delivery Address
              </h3>

              {/* Current Location */}
              {sessionStorage.getItem('currentSessionLocation') && (
                <div
                  onClick={handleSelectCurrentLocation}
                  style={{
                    background: selectedAddressId === null ? "#fff7f0" : "#f9f9f9",
                    border: selectedAddressId === null ? `2px solid ${ORANGE}` : "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "12px",
                    marginBottom: 10,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.2rem" }}>📍</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>
                        Current Location
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#666" }}>
                        {JSON.parse(sessionStorage.getItem('currentSessionLocation')).address}
                      </div>
                    </div>
                    {selectedAddressId === null && (
                      <div style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        background: ORANGE,
                        color: "#fff",
                        fontSize: "0.65rem",
                        fontWeight: 600,
                      }}>
                        SELECTED
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Saved Addresses */}
              {addresses.map((addr) => {
                const isSelected = addr.id === selectedAddressId;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    style={{
                      background: isSelected ? "#fff7f0" : "#f9f9f9",
                      border: isSelected ? `2px solid ${ORANGE}` : "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: "12px",
                      marginBottom: 10,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.2rem" }}>
                        {addr.title === "Home" ? "🏠" : addr.title === "Work" ? "🏢" : "📍"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>
                          {addr.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#666" }}>
                          {addr.address.includes("|||") 
                            ? addr.address.split("|||").filter(Boolean).join(", ")
                            : addr.address
                          }
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: ORANGE,
                          color: "#fff",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                        }}>
                          SELECTED
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Use Current Location Button */}
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  navigate('/location');
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: ORANGE,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                📍 Use Current Location
              </button>

              {/* Add New Address Button */}
              <button
                onClick={() => {
                  setShowAddressModal(false);
                  navigate('/add-address');
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: `2px dashed ${ORANGE}`,
                  background: "#fff",
                  color: ORANGE,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  marginTop: 10,
                }}
              >
                + Add New Address
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const qtyButtonStyle = {
  width: 26,
  height: 26,
  borderRadius: "50%",
  border: "none",
  background: "#1e202f",
  color: "#fff",
  cursor: "pointer",
  fontSize: "0.9rem",
};
