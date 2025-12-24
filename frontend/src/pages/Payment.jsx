import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import { VisaLogo, MastercardLogo, BkashLogo, CashLogo, CardLogo, AmexLogo, DiscoverLogo } from "../components/PaymentLogos";
import BkashPaymentGateway from "../components/BkashPaymentGateway";
import CardPaymentGateway from "../components/CardPaymentGateway";

const ORANGE = "#ff7a00";
const METHODS = ["Cash", "Card", "Bkash"];

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  // total coming from Cart (fallback so it never crashes)
  const total = location.state?.total ?? 1160;

  const [method, setMethod] = useState("Cash");
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showBkashGateway, setShowBkashGateway] = useState(false);
  const [showCardGateway, setShowCardGateway] = useState(false);
  const [showCardDropdown, setShowCardDropdown] = useState(false);

  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;

  useEffect(() => {
    fetchPaymentMethods();
    loadSelectedAddress();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCardDropdown(false);
    };

    if (showCardDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCardDropdown]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('customer/payments/methods/');
      setCards(response.data);
      if (response.data.length > 0) {
        setSelectedCardId(response.data[0].id);
        // Keep Cash as default - let user choose payment method
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    }
  };

  const loadSelectedAddress = () => {
    // First check for saved address
    const savedAddress = localStorage.getItem("selectedDeliveryAddress");
    if (savedAddress) {
      console.log("Loading saved address:", savedAddress);
      setSelectedAddress(JSON.parse(savedAddress));
      return;
    }

    // If no saved address, check for current location
    const currentLocation = sessionStorage.getItem('currentSessionLocation');
    if (currentLocation) {
      console.log("Loading current location:", currentLocation);
      const locationData = JSON.parse(currentLocation);
      console.log("Parsed location data:", locationData);
      
      // Extract coordinates from the address string if lat/lng not directly available
      let lat = locationData.lat;
      let lng = locationData.lng;
      
      // If lat/lng not in locationData, try to extract from address string
      if (!lat || !lng) {
        const addressStr = locationData.address || "";
        const latMatch = addressStr.match(/Latitude:\s*([\d.-]+)/);
        const lngMatch = addressStr.match(/Longitude:\s*([\d.-]+)/);
        
        if (latMatch && lngMatch) {
          lat = parseFloat(latMatch[1]);
          lng = parseFloat(lngMatch[1]);
          console.log("Extracted coordinates from address string:", { lat, lng });
        }
      }
      
      // Create address object for current location
      const currentLocationAddress = {
        title: "Current Location",
        address: locationData.address || "Current Location",
        lat: lat,
        lng: lng
      };
      console.log("Created current location address:", currentLocationAddress);
      setSelectedAddress(currentLocationAddress);
    } else {
      console.log("No address found in localStorage or sessionStorage");
    }
  };

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    console.log("=== Payment Confirmation Debug ===");
    console.log("Selected address:", selectedAddress);
    
    if (!selectedAddress) {
      setError("Please select a delivery address first");
      return;
    }

    // Debug address validation
    console.log("Address ID:", selectedAddress.id);
    console.log("Address lat:", selectedAddress.lat);
    console.log("Address lng:", selectedAddress.lng);
    console.log("Has ID:", !!selectedAddress.id);
    console.log("Has lat/lng:", !!(selectedAddress.lat && selectedAddress.lng));

    // Validate address has either ID (saved address) or lat/lng (current location)
    if (!selectedAddress.id && (!selectedAddress.lat || !selectedAddress.lng)) {
      console.log("Validation failed - no ID and no lat/lng");
      setError("Invalid delivery address. Please select a valid address or current location.");
      return;
    }

    console.log("Address validation passed!");
    setError("");

    // If Bkash is selected, show the payment gateway
    if (method === "Bkash") {
      setShowBkashGateway(true);
      return;
    }

    // If card payment is selected, show the card gateway
    if (method === "Card") {
      if (!selectedCard) {
        setError("Please add a card first or select an existing card");
        return;
      }
      setShowCardGateway(true);
      return;
    }

    // Process other payment methods normally (Cash)
    await processPayment();
  };

  const processPayment = async (bkashData = null, cardData = null) => {
    setProcessing(true);
    setError("");
    
    try {
      let addressId = selectedAddress.id;

      // If current location (no ID), use coordinates directly without saving to database
      if (!selectedAddress.id && selectedAddress.lat && selectedAddress.lng) {
        console.log("Using current location directly for checkout...");
        // We'll pass the coordinates directly to the checkout API
        addressId = null; // Will be handled specially in checkout
      }

      // Map frontend method names to backend values
      const paymentMethodMap = {
        "Cash": "cod",
        "Card": "card",
        "Bkash": "mobile_banking"
      };

      let note = "";
      if (bkashData) {
        note = `Bkash Transaction ID: ${bkashData.transactionId}`;
      } else if (cardData) {
        note = `${cardData.cardType} Transaction ID: ${cardData.transactionId}`;
      }

      const checkoutData = {
        payment_method: paymentMethodMap[method] || "cod",
        note: note
      };

      // Add address info - either saved address ID or current location coordinates
      if (addressId) {
        checkoutData.address_id = addressId;
      } else if (selectedAddress.lat && selectedAddress.lng) {
        // Send current location coordinates directly
        checkoutData.current_location = {
          lat: selectedAddress.lat,
          lng: selectedAddress.lng,
          address: selectedAddress.address || "Current Location"
        };
      }

      console.log("=== Frontend Checkout Debug ===");
      console.log("Selected address:", selectedAddress);
      console.log("Using address ID:", addressId);
      console.log("Payment method:", method);
      console.log("Checkout data:", checkoutData);
      if (bkashData) console.log("Bkash data:", bkashData);
      if (cardData) console.log("Card data:", cardData);

      const response = await api.post('customer/checkout/', checkoutData);
      console.log("Checkout response:", response.data);

      // Navigate to success page with order details
      navigate("/payment-success", { 
        state: { 
          total,
          orderId: response.data.order_id,
          status: response.data.status,
          bkashData: bkashData,
          cardData: cardData
        } 
      });
    } catch (error) {
      console.error("Checkout error:", error);
      console.error("Error details:", error.response?.data);
      setError(`Payment failed: ${error.response?.data?.error || error.message}`);
      alert(`Payment failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBkashSuccess = (bkashData) => {
    setShowBkashGateway(false);
    processPayment(bkashData);
  };

  const handleBkashCancel = () => {
    setShowBkashGateway(false);
  };

  const handleBkashError = (error) => {
    setShowBkashGateway(false);
    alert(`Bkash payment failed: ${error}`);
  };

  const handleCardSuccess = (cardData) => {
    setShowCardGateway(false);
    processPayment(null, cardData);
  };

  const handleCardCancel = () => {
    setShowCardGateway(false);
  };

  const handleCardError = (error) => {
    setShowCardGateway(false);
    alert(`Card payment failed: ${error}`);
  };

  const handleAddNew = () => {
    navigate("/add-card", { state: { total } });
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
        {/* Header row */}
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
            Payment
          </span>
        </div>

        {/* Payment methods row */}
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: 8,
            paddingBottom: 8,
            marginBottom: 16,
          }}
        >
          {METHODS.map((m) => {
            const active = m === method;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                style={{
                  minWidth: 80,
                  padding: "10px 6px 6px",
                  borderRadius: 14,
                  border: active ? `2px solid ${ORANGE}` : "1px solid #e4e6f0",
                  background: active ? "#fff7f0" : "#f6f7fb",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  fontSize: "0.75rem",
                  position: "relative",
                }}
              >
                {/* Payment method logos */}
                <div
                  style={{
                    marginBottom: 4,
                    borderRadius: 6,
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {m === "Cash" && <CashLogo />}
                  {m === "Card" && <CardLogo />}
                  {m === "Bkash" && <BkashLogo />}
                </div>
                <span>{m}</span>

                {active && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: ORANGE,
                      border: "2px solid #fff",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Saved card dropdown (for card methods) */}
        {method === "Card" && (
          <div
            style={{
              background: "#f6f7fb",
              borderRadius: 12,
              padding: "8px 10px",
              marginBottom: 14,
              position: "relative",
            }}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (cards.length > 1) {
                  setShowCardDropdown(!showCardDropdown);
                }
              }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
                cursor: cards.length > 1 ? "pointer" : "default",
                padding: "4px",
                borderRadius: 6,
                transition: "background 0.2s",
                background: showCardDropdown ? "#e8f4fd" : "transparent",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#444",
                }}
              >
                <div
                  style={{
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  {method === "Card" && selectedCard && selectedCard.details?.card_type === "Visa" && <VisaLogo width={24} height={16} />}
                  {method === "Card" && selectedCard && selectedCard.details?.card_type === "Mastercard" && <MastercardLogo width={24} height={16} />}
                  {method === "Card" && selectedCard && selectedCard.details?.card_type === "American Express" && <AmexLogo width={24} height={16} />}
                  {method === "Card" && selectedCard && selectedCard.details?.card_type === "Discover" && <DiscoverLogo width={24} height={16} />}
                  {method === "Card" && !selectedCard && <CardLogo width={24} height={16} />}
                </div>
                <span>{selectedCard ? `${selectedCard.details?.card_type} •••• ${selectedCard.details?.last_four || selectedCard.details?.last4}` : "Select Card"}</span>
              </div>
              {/* dropdown arrow - only show if multiple cards */}
              {cards.length > 1 && (
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "#555",
                    transform: showCardDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  ▾
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                color: "#777",
              }}
            >
              {selectedCard ? (
                <>
                  •••• •••• •••• {selectedCard.details?.last_four || selectedCard.details?.last4}
                </>
              ) : (
                "No card available - Add a new card"
              )}
            </div>

            {/* Dropdown Menu for Card Selection */}
            {showCardDropdown && cards.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  marginTop: 4,
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCardId(card.id);
                      setShowCardDropdown(false);
                    }}
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: selectedCardId === card.id ? "#f8f9fa" : "#fff",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#f8f9fa"}
                    onMouseLeave={(e) => e.target.style.background = selectedCardId === card.id ? "#f8f9fa" : "#fff"}
                  >
                    <div style={{ width: 24, height: 16 }}>
                      {card.details?.card_type === "Visa" && <VisaLogo width={24} height={16} />}
                      {card.details?.card_type === "Mastercard" && <MastercardLogo width={24} height={16} />}
                      {card.details?.card_type === "American Express" && <AmexLogo width={24} height={16} />}
                      {card.details?.card_type === "Discover" && <DiscoverLogo width={24} height={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#333" }}>
                        {card.details?.card_type} •••• {card.details?.last_four}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#666" }}>
                        {card.details?.card_holder}
                      </div>
                    </div>
                    {selectedCardId === card.id && (
                      <div style={{ color: ORANGE, fontSize: "0.8rem" }}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cash on Delivery info */}
        {method === "Cash" && (
          <div
            style={{
              background: "#f0f8ff",
              borderRadius: 12,
              padding: "12px",
              marginBottom: 14,
              border: "1px solid #e3f2fd",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1976d2", marginBottom: 4 }}>
              💰 Cash on Delivery
            </div>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>
              Pay with cash when your order arrives
            </div>
          </div>
        )}



        {/* Bkash Mobile Banking info */}
        {method === "Bkash" && (
          <div
            style={{
              background: "#fce4ec",
              borderRadius: 12,
              padding: "12px",
              marginBottom: 14,
              border: "1px solid #f8bbd9",
            }}
          >
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#e2136e", marginBottom: 4 }}>
              📱 Bkash Mobile Banking
            </div>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>
              Pay securely with your Bkash mobile wallet
            </div>
          </div>
        )}

        {/* + ADD NEW big bordered box (only for card methods) */}
        {method === "Card" && (
          <button
            type="button"
            onClick={handleAddNew}
            style={{
              width: "100%",
              height: 60,
              borderRadius: 10,
              border: `2px solid ${ORANGE}`,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              color: ORANGE,
              fontWeight: 600,
              marginBottom: 24,
              cursor: "pointer",
            }}
          >
            + ADD NEW
          </button>
        )}

        {/* Total row */}
        <div
          style={{
            fontSize: "0.85rem",
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#a0a0a0", marginRight: 4 }}>TOTAL:</span>
          <span style={{ fontWeight: 700 }}>৳{total}</span>
        </div>

        {/* Delivery Address Display */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: "0.7rem", color: "#a0a0a0", marginBottom: 4 }}>
            DELIVERY ADDRESS
          </div>
          <div style={{ fontSize: "0.8rem", color: "#555" }}>
            {selectedAddress 
              ? (selectedAddress.title 
                  ? `${selectedAddress.title} - ${selectedAddress.address?.includes("|||") 
                      ? selectedAddress.address.split("|||").filter(Boolean).join(", ")
                      : selectedAddress.address}`
                  : selectedAddress.address)
              : "No address selected"}
          </div>
          {selectedAddress && !selectedAddress.id && selectedAddress.lat && selectedAddress.lng && (
            <div style={{ fontSize: "0.7rem", color: "#4caf50", marginTop: 4 }}>
              📍 Using current location for delivery
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div style={{
            background: "#ffebee",
            border: "1px solid #f44336",
            borderRadius: 8,
            padding: "12px",
            marginBottom: 16,
            fontSize: "0.8rem",
            color: "#d32f2f"
          }}>
            {error}
          </div>
        )}

        {/* PAY & CONFIRM */}
        <button
          onClick={handleConfirm}
          disabled={!selectedAddress || (method === "Card" && !selectedCard) || processing}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 10,
            border: "none",
            background: (!selectedAddress || (method === "Card" && !selectedCard) || processing)
              ? "#ccc" 
              : ORANGE,
            color: "#fff",
            fontWeight: 700,
            cursor: (!selectedAddress || (method === "Card" && !selectedCard) || processing)
              ? "not-allowed" 
              : "pointer",
            fontSize: "0.9rem",
          }}
        >
          {processing ? "PROCESSING..." : "PAY & CONFIRM"}
        </button>
      </div>

      {/* Bkash Payment Gateway Modal */}
      {showBkashGateway && (
        <BkashPaymentGateway
          amount={total}
          onSuccess={handleBkashSuccess}
          onCancel={handleBkashCancel}
          onError={handleBkashError}
        />
      )}

      {/* Card Payment Gateway Modal */}
      {showCardGateway && selectedCard && (
        <CardPaymentGateway
          amount={total}
          cardType={selectedCard.card_type || selectedCard.details?.card_type}
          cardDetails={selectedCard}
          onSuccess={handleCardSuccess}
          onCancel={handleCardCancel}
          onError={handleCardError}
        />
      )}
    </div>
  );
}
