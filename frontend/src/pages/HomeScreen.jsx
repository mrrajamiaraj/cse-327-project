import { useState } from "react";
import { useNavigate } from "react-router-dom";

// category icons from assets
import catAll from "../assets/cat-all.png";
import catHotdog from "../assets/cat-hotdog.png";
import catBurger from "../assets/cat-burger.png";
// import catPizza from "../assets/cat-pizza.png"; // use when you add pizza icon

const ORANGE = "#ff7a00";
const GREY_BG = "#f3f3f3";
const DARK_TEXT = "#222";

const categories = [
  { id: 1, label: "All", image: catAll },
  { id: 2, label: "Hot Dog", image: catHotdog },
  { id: 3, label: "Burger", image: catBurger },
  // { id: 4, label: "Pizza", image: catPizza }, // uncomment when pizza icon ready
];

const restaurants = [
  {
    id: 1,
    name: "Rose Garden Restaurant",
    subtitle: "Burger · Chicken · Rice · Wings",
    rating: 4.7,
    isFree: true,
    time: "20 min",
    image:
      "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    name: "Tasty Treat",
    subtitle: "Burger · Fast Food",
    rating: 4.5,
    isFree: true,
    time: "15 min",
    image:
      "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    name: "Spicy Hub",
    subtitle: "Pizza · Pasta · Grill",
    rating: 4.6,
    isFree: false,
    time: "25 min",
    image:
      "https://images.pexels.com/photos/2232/vegetables-italian-pizza-restaurant.jpg?auto=compress&cs=tinysrgb&w=800",
  },
];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const handleRestaurantClick = (id) => {
    // later you can use id in route, e.g. /restaurant-view/:id
    navigate("/restaurant-view");
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: GREY_BG,
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      {/* Phone styled card */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 32,
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          padding: "20px 18px 24px",
        }}
      >
        {/* Top row: menu + location + cart */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          {/* Left: menu + location */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Three-line menu button */}
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: GREY_BG,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 2,
                  borderRadius: 999,
                  background: "#333",
                }}
              />
              <span
                style={{
                  width: 18,
                  height: 2,
                  borderRadius: 999,
                  background: "#333",
                }}
              />
              <span
                style={{
                  width: 14,
                  height: 2,
                  borderRadius: 999,
                  background: "#333",
                }}
              />
            </button>

            {/* Location text */}
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: ORANGE,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                Deliver To
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.9rem",
                  color: "#444",
                }}
              >
                <span>NSU Campus</span>
                <span style={{ fontSize: "0.9rem" }}>▼</span>
              </div>
            </div>
          </div>

          {/* Right: cart icon with badge */}
          <div
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#111529",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => navigate("/cart")}
          >
            <span style={{ fontSize: "1.1rem" }}>🛒</span>
            <div
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: ORANGE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            >
              2
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 14 }}>
          <span style={{ fontSize: "0.95rem", color: "#666" }}>
            Hey <strong>Raja</strong>, Good Afternoon!
          </span>
        </div>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f5f5f7",
            padding: "10px 12px",
            borderRadius: 18,
            marginBottom: 20,
          }}
        >
          <span role="img" aria-label="search">
            🔍
          </span>
          <input
            placeholder="Search dishes, restaurants"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.9rem",
            }}
          />
        </div>

        {/* All Categories */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "1rem" }}>
              All Categories
            </span>
            <button
              style={{
                border: "none",
                background: "transparent",
                color: "#999",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              See All &gt;
            </button>
          </div>

          {/* horizontal slider */}
          <div
            style={{
              display: "flex",
              gap: 12,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                label={c.label}
                image={c.image}
                active={activeCategory === c.label}
                onClick={() => setActiveCategory(c.label)}
              />
            ))}
          </div>
        </div>

        {/* Open Restaurants */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "1rem" }}>
              Open Restaurants
            </span>
            <button
              style={{
                border: "none",
                background: "transparent",
                color: "#999",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              See All &gt;
            </button>
          </div>

          {/* Restaurant list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxHeight: 420,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {restaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRestaurantClick(r.id)}
                style={{
                  border: "none",
                  padding: 0,
                  textAlign: "left",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <RestaurantCard restaurant={r} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryPill({ label, image, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        minWidth: 85,
        height: 90,
        borderRadius: 25,
        background: "#fff",
        padding: "8px 10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: active
          ? "0 8px 20px rgba(0,0,0,0.15)"
          : "0 4px 8px rgba(0,0,0,0.05)",
        border: active ? `2px solid ${ORANGE}` : "2px solid transparent",
      }}
    >
      <img
        src={image}
        alt={label}
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          objectFit: "cover",
          marginBottom: 6,
        }}
      />
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: active ? 700 : 500,
          color: active ? ORANGE : "#333",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function RestaurantCard({ restaurant }) {
  return (
    <div
      style={{
        borderRadius: 26,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
      }}
    >
      {/* image */}
      <div style={{ height: 160, overflow: "hidden" }}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* text content */}
      <div style={{ padding: "10px 14px 12px" }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: "0.95rem",
            marginBottom: 4,
            color: DARK_TEXT,
          }}
        >
          {restaurant.name}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#888",
            marginBottom: 8,
          }}
        >
          {restaurant.subtitle}
        </div>

        {/* rating / free / time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: "0.8rem",
            color: "#777",
          }}
        >
          <span>
            ⭐ <strong>{restaurant.rating}</strong>
          </span>
          <span>{restaurant.isFree ? "Free" : "৳ 40 delivery"}</span>
          <span>⏱ {restaurant.time}</span>
        </div>
      </div>
    </div>
  );
}
