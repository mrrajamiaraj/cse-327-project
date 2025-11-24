const ORANGE = "#ff7a00";

export default function FoodDetails() {
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
        {/* Image */}
        <div style={{ height: 220, overflow: "hidden" }}>
          <img
            src="https://images.pexels.com/photos/2619967/pexels-photo-2619967.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Pizza"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "18px 18px 24px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 4 }}>
            Pizza Calzone
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#777", marginBottom: 12 }}>
            Freshly baked cheese pizza with tomato sauce and special toppings.
          </p>

          <div
            style={{
              display: "flex",
              gap: 8,
              fontSize: "0.8rem",
              color: "#777",
              marginBottom: 16,
            }}
          >
            <span>⭐ 4.8</span>
            <span>25 min</span>
            <span>Free delivery</span>
          </div>

          {/* Price + quantity + add to cart */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "0.8rem", color: "#999" }}>Price</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>৳ 1280</div>
            </div>

            <button
              style={{
                padding: "10px 22px",
                borderRadius: 999,
                border: "none",
                background: ORANGE,
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

