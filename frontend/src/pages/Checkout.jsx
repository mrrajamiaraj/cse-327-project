import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
    fetchAddresses();
    getCurrentLocation();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/customer/cart/');
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart");
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/customer/addresses/');
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data.find(addr => addr.is_default) || response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location"
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!useCurrentLocation && !selectedAddress) {
      setError("Please select a delivery address");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const checkoutData = {
        payment_method: paymentMethod,
        note: note.trim()
      };

      if (useCurrentLocation && currentLocation) {
        checkoutData.current_location = currentLocation;
      } else if (selectedAddress) {
        checkoutData.address_id = selectedAddress.id;
      }

      const response = await api.post('/customer/checkout/', checkoutData);
      
      if (response.data.order_id) {
        // Navigate to payment page with order details
        navigate('/payment', {
          state: {
            orderId: response.data.order_id,
            total: cart.total,
            paymentMethod: paymentMethod
          }
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error.response?.data?.error || "Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={phoneCard}>
          <div style={loadingContainer}>
            <div style={spinner}></div>
            <div>Loading checkout...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div style={pageWrap}>
        <div style={phoneCard}>
          <div style={emptyContainer}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🛒</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>
              Your cart is empty
            </div>
            <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: 20 }}>
              Add some delicious items to your cart first
            </div>
            <button onClick={() => navigate('/home')} style={primaryButton}>
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={phoneCard}>
        {/* Header */}
        <div style={header}>
          <button onClick={() => navigate(-1)} style={backButton}>←</button>
          <div style={headerTitle}>Checkout</div>
          <div style={{ width: 30 }}></div>
        </div>

        {error && (
          <div style={errorMessage}>
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div style={section}>
          <div style={sectionTitle}>Order Summary</div>
          <div style={orderSummary}>
            {cart.items.map((item, index) => (
              <div key={index} style={orderItem}>
                <div style={itemInfo}>
                  <div style={itemName}>{item.food_name}</div>
                  <div style={itemDetails}>
                    Qty: {item.quantity} × ৳{item.food_price}
                  </div>
                </div>
                <div style={itemPrice}>৳{(item.quantity * item.food_price).toFixed(2)}</div>
              </div>
            ))}
            
            <div style={summaryRow}>
              <span>Subtotal</span>
              <span>৳{cart.subtotal}</span>
            </div>
            <div style={summaryRow}>
              <span>Delivery Fee</span>
              <span>৳{cart.delivery_fee}</span>
            </div>
            <div style={{ ...summaryRow, ...totalRow }}>
              <span>Total</span>
              <span>৳{cart.total}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={section}>
          <div style={sectionTitle}>Delivery Address</div>
          
          {/* Current Location Option */}
          {currentLocation && (
            <div style={addressOption} onClick={() => setUseCurrentLocation(!useCurrentLocation)}>
              <div style={radioButton}>
                {useCurrentLocation && <div style={radioSelected}></div>}
              </div>
              <div style={addressInfo}>
                <div style={addressTitle}>📍 Use Current Location</div>
                <div style={addressText}>Deliver to my current location</div>
              </div>
            </div>
          )}

          {/* Saved Addresses */}
          {addresses.map((address) => (
            <div 
              key={address.id} 
              style={addressOption} 
              onClick={() => {
                setSelectedAddress(address);
                setUseCurrentLocation(false);
              }}
            >
              <div style={radioButton}>
                {!useCurrentLocation && selectedAddress?.id === address.id && (
                  <div style={radioSelected}></div>
                )}
              </div>
              <div style={addressInfo}>
                <div style={addressTitle}>{address.title}</div>
                <div style={addressText}>{address.address}</div>
              </div>
            </div>
          ))}

          <button 
            onClick={() => navigate('/add-address')} 
            style={addAddressButton}
          >
            + Add New Address
          </button>
        </div>

        {/* Payment Method */}
        <div style={section}>
          <div style={sectionTitle}>Payment Method</div>
          
          {['cod', 'card', 'mobile_banking'].map((method) => (
            <div 
              key={method} 
              style={paymentOption} 
              onClick={() => setPaymentMethod(method)}
            >
              <div style={radioButton}>
                {paymentMethod === method && <div style={radioSelected}></div>}
              </div>
              <div style={paymentInfo}>
                <div style={paymentTitle}>
                  {method === 'cod' && '💰 Cash on Delivery'}
                  {method === 'card' && '💳 Card Payment'}
                  {method === 'mobile_banking' && '📱 Mobile Banking (bKash)'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Note */}
        <div style={section}>
          <div style={sectionTitle}>Order Note (Optional)</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any special instructions for the restaurant or rider..."
            style={noteInput}
            maxLength={200}
          />
        </div>

        {/* Checkout Button */}
        <div style={checkoutSection}>
          <button
            onClick={handleCheckout}
            disabled={processing || (!useCurrentLocation && !selectedAddress)}
            style={{
              ...checkoutButton,
              opacity: processing || (!useCurrentLocation && !selectedAddress) ? 0.6 : 1,
              cursor: processing || (!useCurrentLocation && !selectedAddress) ? 'not-allowed' : 'pointer'
            }}
          >
            {processing ? 'Processing...' : `Place Order - ৳${cart.total}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Styles */
const pageWrap = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  padding: "18px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const phoneCard = {
  borderRadius: 28,
  background: "#fff",
  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
  padding: "14px 12px 20px",
  minHeight: 690,
  width: "100%",
  maxWidth: 360,
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 20
};

const backButton = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "#f2f3f7",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const headerTitle = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#444"
};

const loadingContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: 400,
  fontSize: "0.9rem",
  color: "#666"
};

const spinner = {
  width: 40,
  height: 40,
  border: `3px solid #f3f3f3`,
  borderTop: `3px solid ${ORANGE}`,
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  marginBottom: 16
};

const emptyContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: 400,
  textAlign: "center"
};

const errorMessage = {
  background: "#fee",
  color: "#c33",
  padding: 12,
  borderRadius: 8,
  marginBottom: 16,
  fontSize: "0.8rem",
  textAlign: "center"
};

const section = {
  marginBottom: 24
};

const sectionTitle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 12
};

const orderSummary = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 16
};

const orderItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
  paddingBottom: 12,
  borderBottom: "1px solid #eee"
};

const itemInfo = {
  flex: 1
};

const itemName = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 4
};

const itemDetails = {
  fontSize: "0.7rem",
  color: "#666"
};

const itemPrice = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333"
};

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
  fontSize: "0.8rem"
};

const totalRow = {
  fontWeight: 700,
  fontSize: "0.9rem",
  paddingTop: 8,
  borderTop: "1px solid #ddd",
  marginTop: 8
};

const addressOption = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  marginBottom: 8,
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const radioButton = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "2px solid #ddd",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const radioSelected = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: ORANGE
};

const addressInfo = {
  flex: 1
};

const addressTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 4
};

const addressText = {
  fontSize: "0.7rem",
  color: "#666"
};

const addAddressButton = {
  width: "100%",
  padding: 12,
  border: `1px dashed ${ORANGE}`,
  background: "transparent",
  color: ORANGE,
  borderRadius: 8,
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const paymentOption = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  marginBottom: 8,
  cursor: "pointer"
};

const paymentInfo = {
  flex: 1
};

const paymentTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333"
};

const noteInput = {
  width: "100%",
  minHeight: 80,
  padding: 12,
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  fontSize: "0.8rem",
  fontFamily: "inherit",
  resize: "vertical"
};

const checkoutSection = {
  marginTop: 24,
  paddingTop: 16,
  borderTop: "1px solid #eee"
};

const checkoutButton = {
  width: "100%",
  padding: 16,
  background: ORANGE,
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer"
};

const primaryButton = {
  padding: "12px 24px",
  background: ORANGE,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};
