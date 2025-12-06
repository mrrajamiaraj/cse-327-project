import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function Cart() {
  const navigate = useNavigate();

  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState(null);

  useEffect(() => {
    fetchCart();
    fetchDefaultAddress();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('customer/cart/');
      console.log("Cart API Response:", response.data);
      console.log("Cart Items:", response.data?.items);
      setCartData(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultAddress = async () => {
    try {
      const response = await api.get('customer/addresses/');
      const defaultAddr = response.data.find(addr => addr.is_default);
      setDefaultAddress(defaultAddr);
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const updateQty = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      // Remove item if quantity is 0
      try {
        await api.delete(`customer/cart/${cartItemId}/remove_item/`);
        fetchCart();
      } catch (error) {
        console.error("Error removing item:", error);
      }
      return;
    }
    
    try {
      // Update quantity via API
      await api.patch(`customer/cart/${cartItemId}/update_item/`, { quantity: newQuantity });
      // Refresh cart
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    }
  };

  const handlePlaceOrder = () => {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/payment", { state: { total: cartData.total } });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#222' }}>
        Loading cart...
      </div>
    );
  }

  const items = cartData?.items || [];
  const subtotal = cartData?.subtotal || 0;
  const deliveryFee = cartData?.delivery_fee || 0;
  const total = cartData?.total || 0;

  console.log("Rendering cart with items:", items);
  console.log("Items length:", items.length);

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
          background: "#111321",
          boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* dark top: items */}
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
                onClick={() => navigate(-1)}
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
              onClick={() => navigate("/edit-cart")}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.75rem",
                color: "#ffb274",
                cursor: "pointer",
              }}
            >
              EDIT ITEMS
            </button>
          </div>

          {/* cart items */}
          {items.length > 0 ? (
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
                      src={item.food.image || "https://via.placeholder.com/70"}
                      alt={item.food.name}
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
                    <div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          marginBottom: 2,
                        }}
                      >
                        {item.food.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          marginBottom: 2,
                        }}
                      >
                        ৳{item.food.price}
                      </div>
                      {item.variants && item.variants.length > 0 && (
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#b0b0b0",
                          }}
                        >
                          {item.variants.join(", ")}
                        </div>
                      )}
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
                        onClick={() => updateQty(item.id, item.quantity - 1)}
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
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        style={qtyButtonStyle}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
              Your cart is empty
            </div>
          )}
        </div>

        {/* white bottom sheet */}
        <div
          style={{
            background: "#fff",
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            padding: "14px 16px 18px",
          }}
        >
          {/* delivery address */}
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
              onClick={() => navigate("/addresses")}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.7rem",
                color: "#ff7a00",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              EDIT
            </button>
          </div>

          <div
            style={{
              background: "#f4f6fb",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: "0.8rem",
              color: "#555",
              marginBottom: 12,
            }}
          >
            {defaultAddress ? defaultAddress.address : "No address set"}
          </div>

          {/* total breakdown */}
          <div style={{ marginBottom: 12, fontSize: "0.85rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
                color: "#666",
              }}
            >
              <span>Subtotal:</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                color: "#666",
              }}
            >
              <span>Delivery Fee:</span>
              <span>৳{deliveryFee.toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 8,
                borderTop: "1px solid #e0e0e0",
              }}
            >
              <span style={{ fontWeight: 700 }}>TOTAL:</span>
              <span style={{ fontWeight: 700, color: ORANGE }}>৳{total.toFixed(2)}</span>
            </div>
          </div>

          {/* PLACE ORDER */}
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
