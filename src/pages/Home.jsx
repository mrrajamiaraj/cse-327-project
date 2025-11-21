import { useState } from "react";

const sampleMenu = [
  { id: 1, name: "Margherita Pizza", price: 450, category: "Pizza" },
  { id: 2, name: "Beef Burger", price: 320, category: "Burger" },
  { id: 3, name: "Chicken Biryani", price: 280, category: "Rice" },
  { id: 4, name: "Cold Coffee", price: 180, category: "Drinks" },
];

export default function Home() {
  const [showDiscount, setShowDiscount] = useState(true);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Home – Menu</h1>
      <p style={{ color: "#555", marginBottom: "16px" }}>
        Choose from popular items near you.
      </p>

      {/* Simple menu grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {sampleMenu.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "16px",
              borderRadius: "12px",
              background: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ marginBottom: "4px" }}>{item.name}</h3>
            <p style={{ fontSize: "0.85rem", color: "#777" }}>
              Category: {item.category}
            </p>
            <p style={{ marginTop: "8px", fontWeight: "bold" }}>৳ {item.price}</p>
            <button
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                borderRadius: "999px",
                border: "none",
                background: "#222",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {/* Discount popup */}
      {showDiscount && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "360px",
              background: "#fff",
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h2>Special Discount!</h2>
            <p style={{ marginTop: "8px" }}>
              Use code <strong>CSE327</strong> to get{" "}
              <strong>20% OFF</strong> on your first order.
            </p>

            <button
              onClick={() => setShowDiscount(false)}
              style={{
                marginTop: "16px",
                padding: "10px 18px",
                borderRadius: "999px",
                border: "none",
                background: "#222",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
