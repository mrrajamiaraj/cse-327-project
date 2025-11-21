const ORANGE = "#ff7a00";

export default function RestaurantView() {
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 32,
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 200, overflow: "hidden" }}>
          <img
            src="https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Restaurant"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ padding: "18px 18px 24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 4 }}>
            Spicy Restaurant
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#777", marginBottom: 10 }}>
            Best spicy foods with burgers, sandwiches, pizza and more.
          </p>

          <div
            style={{
              display: "flex",
              gap: 8,
              fontSize: "0.8rem",
              color: "#777",
              marginBottom: 14,
            }}
          >
            <span>⭐ 4.8</span>
            <span>25 min</span>
            <span>Free delivery</span>
          </div>

          {/* Simple menu list inside restaurant */}
          <h3 style={{ fontSize: "0.9rem", marginBottom: 8 }}>Popular items</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {["Burger 1.0", "Burger Premium", "Spicy Wings"].map((item, i) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 10px",
                  borderRadius: 14,
                  background: "#f8f8f9",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>{item}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  ৳ {300 + i * 50}
                </span>
              </div>
            ))}
          </div>

          <button
            style={{
              marginTop: 16,
              width: "100%",
              padding: "10px",
              borderRadius: 999,
              border: "none",
              background: ORANGE,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            VIEW CART
          </button>
        </div>
      </div>
    </div>
  );
}
