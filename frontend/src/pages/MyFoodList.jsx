import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function MyFoodList() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    fetchMyFoods();
    fetchCategories();
  }, []);

  const fetchMyFoods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurant/menu/items/');
      setFoods(response.data || []);
    } catch (error) {
      console.error("Error fetching foods:", error);
      setError("Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/restaurant/menu/categories/');
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Get unique categories from current food items
  const getAvailableCategories = () => {
    const foodCategories = [...new Set(foods.map(food => food.category?.name).filter(Boolean))];
    return foodCategories.slice(0, 3); // Show only first 3 categories as tabs
  };

  // Filter foods based on active tab
  const filteredFoods = foods.filter(food => {
    if (activeTab === "All") return true;
    const categoryName = food.category?.name || food.category;
    return categoryName?.toLowerCase() === activeTab.toLowerCase();
  });

  const handleDeleteFood = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      try {
        await api.delete(`/restaurant/menu/items/${foodId}/`);
        setFoods(foods.filter(food => food.id !== foodId));
      } catch (error) {
        console.error("Error deleting food:", error);
        alert("Failed to delete food item");
      }
    }
  };

  const handleEditFood = (foodId) => {
    // For now, just show an alert - edit functionality can be added later
    alert(`Edit functionality for food item ${foodId} will be available soon`);
  };

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
            <Tab active={activeTab === "All"} label="All" onClick={() => setActiveTab("All")} />
            {getAvailableCategories().map(category => (
              <Tab 
                key={category}
                active={activeTab === category} 
                label={category} 
                onClick={() => setActiveTab(category)} 
              />
            ))}
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
            Total {filteredFoods.length.toString().padStart(2, "0")} items
          </div>

          {/* loading state */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
              Loading your food items...
            </div>
          )}

          {/* error state */}
          {error && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#ff4444" }}>
              {error}
              <button 
                onClick={fetchMyFoods}
                style={{
                  display: "block",
                  margin: "10px auto",
                  padding: "8px 16px",
                  background: ORANGE,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* empty state */}
          {!loading && !error && filteredFoods.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#666" }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px" }}>🍽️</div>
              <div style={{ marginBottom: "10px" }}>No food items found</div>
              <button 
                onClick={() => navigate("/add-new-items")}
                style={{
                  padding: "8px 16px",
                  background: ORANGE,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Add Your First Item
              </button>
            </div>
          )}

          {/* list */}
          {!loading && !error && filteredFoods.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "0 6px",
              }}
            >
              {filteredFoods.map((f) => (
                <FoodRow 
                  key={f.id} 
                  food={f} 
                  onEdit={handleEditFood}
                  onDelete={handleDeleteFood}
                />
              ))}
            </div>
          )}

          {/* bottom nav */}
          <SellerBottomNav
            active="list"
            onBox={() => navigate("/my-food")}
            onOrders={() => navigate("/running-orders")}
            onAdd={() => navigate("/add-new-items")}
          />
        </div>
      </div>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <div 
      style={{ position: "relative", fontWeight: active ? 700 : 500, cursor: "pointer" }}
      onClick={onClick}
    >
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

function FoodRow({ food, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", position: "relative" }}>
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
        {food.image ? (
          <img
            src={food.image}
            alt={food.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div 
          style={{ 
            width: "100%", 
            height: "100%", 
            display: food.image ? "none" : "flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontSize: "1.5rem",
            color: "#999"
          }}
        >
          🍽️
        </div>
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
          {food.category?.name || food.category || "General"}
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
          <span style={{ color: food.is_available ? "#4CAF50" : "#ff4444" }}>
            {food.is_available ? "●" : "●"}
          </span>
          <span style={{ color: "#444", fontWeight: 700 }}>
            {food.is_available ? "Available" : "Unavailable"}
          </span>
          <span>Stock: {food.stock_quantity || 0}</span>
        </div>
      </div>

      {/* right price */}
      <div style={{ textAlign: "right", minWidth: 70 }}>
        <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "#222" }}>
          ৳{food.price}
        </div>
        <div style={{ fontSize: "0.65rem", color: "#9a9a9a", marginTop: 4 }}>
          {food.is_available ? "Available" : "Unavailable"}
        </div>
      </div>

      {/* 3-dot menu */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
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

        {/* Dropdown menu */}
        {showMenu && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              background: "white",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 10,
              minWidth: "120px"
            }}
          >
            <button
              onClick={() => {
                onEdit(food.id);
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.7rem"
              }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => {
                onDelete(food.id);
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "none",
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "0.7rem",
                color: "#ff4444"
              }}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5
          }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

function SellerBottomNav({ active, onBox, onOrders, onAdd }) {
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
        onClick={onAdd}
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
          cursor: "pointer"
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
