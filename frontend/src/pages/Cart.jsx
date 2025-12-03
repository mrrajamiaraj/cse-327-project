import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

import pizzaCalzone from "../assets/pizza-calzone.png";
import pizzaRoma from "../assets/pizza-roma.png";

const ORANGE = "#ff7a00";

export default function Cart() {
  const navigate = useNavigate();

  const [items, setItems] = useState([
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
  ]);

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items]
  );

  const updateQty = (id, delta) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      )
    );
  };

  // ⬇⬇⬇ changed: go to Payment screen with total
  const handlePlaceOrder = () => {
    navigate("/payment", { state: { total } });
  };
  // ⬆⬆⬆

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
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        marginBottom: 2,
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
            2118 Thornridge Cir, Syracuse
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
