import { useNavigate, useLocation } from "react-router-dom";

// images from assets
import coverImg from "../assets/res-cover.png";
import burger1 from "../assets/item-burger1.png";
import burger2 from "../assets/item-burger2.png";

const ORANGE = "#ff7a00";

export default function RestaurantView() {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurant = location.state?.restaurant;

  // Fallback if no restaurant passed (e.g. direct access)
  const displayRestaurant = restaurant || {
    name: "Spicy Restaurant",
    subtitle: "Best spicy foods",
    rating: 4.8,
    time: "25 min",
    isFree: true,
    image: coverImg
  };

  const foodItems = [
    {
      id: 1,
      name: "Burger Ferguson",
      subtitle: "Spicy Restaurant",
      price: 400,
      image: burger1,
    },
    {
      id: 2,
      name: "Rockin' Burgers",
      subtitle: "Cafecachafino",
      price: 380,
      image: burger2,
    },
  ];

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f4f4f4",
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
        {/* header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 20px 8px 20px",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#f1f1f1",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ←
          </button>

          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
            Restaurant View
          </span>

          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#f1f1f1",
              border: "none",
              fontSize: "1.4rem",
              cursor: "pointer",
            }}
          >
            ⋯
          </button>
        </div>

        {/* cover image */}
        <div style={{ padding: "0 20px", marginBottom: 10 }}>
          <img
            src={displayRestaurant.image || coverImg}
            alt="restaurant"
            style={{
              width: "100%",
              height: 180,
              borderRadius: 20,
              objectFit: "cover",
            }}
          />
        </div>

        {/* text section */}
        <div style={{ padding: "0 20px" }}>
          <div
            style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 6 }}
          >
            {displayRestaurant.name}
          </div>

          <p
            style={{
              color: "#777",
              fontSize: "0.85rem",
              lineHeight: 1.4,
              marginBottom: 14,
            }}
          >
            {displayRestaurant.subtitle || "Delicious food waiting for you."}
          </p>

          {/* rating row */}
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: ORANGE }}>⭐</span>
              <strong>{displayRestaurant.rating}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>⏱</span> {displayRestaurant.time}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>🚚</span> {displayRestaurant.isFree ? "Free delivery" : "Delivery fees apply"}
            </div>
          </div>

          {/* category chips */}
          <div
            style={{
              display: "flex",
              gap: 10,
              overflowX: "auto",
              paddingBottom: 10,
            }}
          >
            {["Burger", "Sandwich", "Pizza", "Snacks"].map((cat, i) => (
              <button
                key={i}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  border: cat === "Burger" ? "none" : "1px solid #ddd",
                  background: cat === "Burger" ? ORANGE : "#fff",
                  color: cat === "Burger" ? "#fff" : "#333",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* section title */}
        <div
          style={{
            padding: "0 20px",
            fontSize: "1.05rem",
            fontWeight: 600,
            margin: "16px 0 10px",
          }}
        >
          Burger (10)
        </div>

        {/* horizontal burger cards */}
        <div
          style={{
            padding: "0 20px 20px",
            display: "flex",
            gap: 16,
            overflowX: "auto",
          }}
        >
          {foodItems.map((item) => (
            <div
              key={item.id}
              style={{
                width: 160,
                background: "#fff",
                borderRadius: 22,
                boxShadow: "0 8px 16px rgba(0,0,0,0.10)",
                paddingBottom: 12,
                flexShrink: 0,
              }}
            >
              <div style={{ width: "100%", height: 110, overflow: "hidden" }}>
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

              <div style={{ padding: "10px" }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 4,
                    fontSize: "0.95rem",
                  }}
                >
                  {item.name}
                </div>

                <div style={{ color: "#777", fontSize: "0.75rem" }}>
                  {item.subtitle}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#000",
                    }}
                  >
                    ৳{item.price}
                  </span>

                  <button
                    style={{
                      width: 32,
                      height: 32,
                      background: ORANGE,
                      borderRadius: "50%",
                      border: "none",
                      color: "#fff",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
