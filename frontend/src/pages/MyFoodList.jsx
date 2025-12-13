import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";

const foods = [
  {
    id: "1",
    name: "Chicken Biryani",
    tag: "Lunch",
    rating: 4.9,
    reviews: 10,
    price: 240,
    image: "/src/assets/food-1.png",
  },
  {
    id: "2",
    name: "Chicken Bhuna",
    tag: "Lunch",
    rating: 4.9,
    reviews: 10,
    price: 120,
    image: "/src/assets/food-2.png",
  },
  {
    id: "3",
    name: "Kacchi Biryani",
    tag: "Lunch",
    rating: 4.9,
    reviews: 10,
    price: 300,
    image: "/src/assets/food-3.png",
  },
];

export default function MyFoodList() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        padding: "18px 0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* grey page title */}
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#c0c0c0",
            marginBottom: 8,
            paddingLeft: 6,
          }}
        >
          My Food
        </div>

        {/* phone card */}
        <div
          style={{
            position: "relative",
            borderRadius: 28,
            background: "#ffffff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
            padding: "14px 12px 66px",
            overflow: "hidden",
            minHeight: 690,
          }}
        >
          {/* header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
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

            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#444" }}>
              My Food List
            </div>
          </div>

          {/* tabs */}
          <div
            style={{
              display: "flex",
              gap: 20,
              fontSize: "0.7rem",
              color: "#888",
              marginBottom: 12,
              paddingLeft: 6,
              alignItems: "center",
            }}
          >
            <Tab active label="All" />
            <Tab label="Breakfast" />
            <Tab label="Lunch" />
            <Tab label="Dinner" />
          </div>

          {/* total */}
          <div
            style={{
              fontSize: "0.68rem",
              color: "#9a9a9a",
              marginBottom: 10,
              paddingLeft: 6,
            }}
          >
            Total {foods.length.toString().padStart(2, "0")} items
          </div>

          {/* list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "0 6px",
            }}
          >
            {foods.map((f) => (
              <FoodRow key={f.id} food={f} />
            ))}
          </div>

          {/* bottom nav */}
          <SellerBottomNav
            active="list"
            onBox={() => navigate("/my-food")}
            onOrders={() => navigate("/running-orders")}
          />
        </div>
      </div>
    </div>
  );
}

function Tab({ label, active }) {
  return (
    <div style={{ position: "relative", fontWeight: active ? 700 : 500 }}>
      <span style={{ color: active ? ORANGE : "#8a8a8a" }}>{label}</span>
      {active && (
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: -8,
            width: 18,
            height: 2,
            borderRadius: 10,
            background: ORANGE,
          }}
        />
      )}
    </div>
  );
}

function FoodRow({ food }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {/* image */}
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          overflow: "hidden",
          background: "#f2f2f2",
          flexShrink: 0,
        }}
      >
        <img
          src={food.image}
          alt={food.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>

      {/* middle text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#222" }}>
          {food.name}
        </div>

        <div
          style={{
            marginTop: 2,
            display: "inline-block",
            padding: "2px 8px",
            fontSize: "0.62rem",
            borderRadius: 999,
            background: "#ffe9d6",
            color: ORANGE,
            fontWeight: 700,
          }}
        >
          {food.tag}
        </div>

        <div
          style={{
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.65rem",
            color: "#9a9a9a",
          }}
        >
          <span style={{ color: ORANGE }}>★</span>
          <span style={{ color: "#444", fontWeight: 700 }}>{food.rating}</span>
          <span>({food.reviews} Review)</span>
        </div>
      </div>

      {/* right price */}
      <div style={{ textAlign: "right", minWidth: 70 }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#222" }}>
          ৳{food.price}
        </div>
        <div style={{ fontSize: "0.65rem", color: "#9a9a9a", marginTop: 4 }}>
          Pick UP
        </div>
      </div>

      {/* 3-dot */}
      <button
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#888",
          fontSize: "1.1rem",
          paddingLeft: 4,
        }}
      >
        ⋯
      </button>
    </div>
  );
}

function SellerBottomNav({ active, onBox, onOrders }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        right: 18,
        bottom: 10,
        height: 50,
        borderRadius: 24,
        background: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        fontSize: "1.1rem",
      }}
    >
      {/* box/list icon (active in screenshot) */}
      <button
        onClick={onBox}
        style={{
          ...navButtonStyle,
          color: active === "list" ? ORANGE : "#9a9a9a",
        }}
      >
        ▦
      </button>

      <button
        onClick={onOrders}
        style={{
          ...navButtonStyle,
        }}
      >
        ≡
      </button>

      <button
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: `2px solid ${ORANGE}`,
          background: "#fffaf6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ORANGE,
          fontSize: "1.3rem",
          marginTop: -22,
          boxShadow: "0 4px 12px rgba(255,122,0,0.55)",
        }}
      >
        +
      </button>

      <button style={navButtonStyle}>🔔</button>
      <button style={navButtonStyle}>👤</button>
    </div>
  );
}

const navButtonStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
};
