import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function AddNewItems() {
  const navigate = useNavigate();

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isVeg, setIsVeg] = useState(true);
  const [stockQuantity, setStockQuantity] = useState("50");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
    
    // Check if user is logged in and is a restaurant owner
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id || user.role !== 'restaurant') {
      navigate("/login");
    }
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/customer/food/');
      // Get unique categories from existing foods
      const uniqueCategories = [...new Set(response.data.results?.map(food => food.category?.name).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSave = async () => {
    if (!itemName.trim() || !price.trim() || !description.trim() || !category) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const foodData = {
        name: itemName.trim(),
        price: parseFloat(price),
        description: description.trim(),
        category_name: category, // Backend will handle category creation/lookup
        is_veg: isVeg,
        stock_quantity: parseInt(stockQuantity) || 50,
        is_available: true
      };

      await api.post('/restaurant/menu/items/', foodData);
      
      alert("Food item added successfully!");
      navigate("/seller-dashboard");
      
    } catch (error) {
      console.error("Error saving food item:", error);
      setError(error.response?.data?.error || "Failed to save food item. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#c0c0c0",
            marginBottom: 8,
            paddingLeft: 6,
          }}
        >
          Add new Items
        </div>

        <div
          style={{
            borderRadius: 28,
            background: "#fff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
            padding: "14px 12px 16px",
            minHeight: 690,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
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
              Add New Items
            </div>

            <button
              onClick={() => {
                setItemName("");
                setPrice("");
                setDescription("");
                setCategory("");
                setIsVeg(true);
                setStockQuantity("50");
                setError("");
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#ff6b6b",
              }}
            >
              RESET
            </button>
          </div>

          {/* form */}
          <div style={{ padding: "0 6px" }}>
            {error && (
              <div style={{
                background: "#ffe6e6",
                color: "#d63031",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.75rem",
                marginBottom: "12px"
              }}>
                {error}
              </div>
            )}

            {/* item name */}
            <Label>ITEM NAME *</Label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Enter food item name"
              style={inputStyle}
            />

            {/* category */}
            <Label>CATEGORY *</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select category</option>
              <option value="Biriyani">Biriyani</option>
              <option value="Curry">Curry</option>
              <option value="Kebab">Kebab</option>
              <option value="Fish">Fish</option>
              <option value="Chicken">Chicken</option>
              <option value="Beef">Beef</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Dessert">Dessert</option>
              <option value="Snacks">Snacks</option>
              <option value="Drinks">Drinks</option>
            </select>

            {/* upload */}
            <Label>UPLOAD PHOTO/VIDEO</Label>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {/* preview */}
              <div style={previewBox}>
                <img
                  src="/src/assets/add-item-preview.png"
                  alt="preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>

              {/* add boxes */}
              <AddBox />
              <AddBox />
            </div>

            {/* price */}
            <Label>PRICE *</Label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#777",
                    fontSize: "0.8rem",
                  }}
                >
                  ৳
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  style={{ ...inputStyle, paddingLeft: 24 }}
                />
              </div>

              <div style={{ display: "flex", gap: 14, fontSize: "0.7rem" }}>
                <Check 
                  label="Vegetarian" 
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                />
              </div>
            </div>

            {/* stock quantity */}
            <Label>STOCK QUANTITY</Label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="Available quantity"
              style={inputStyle}
            />

            {/* ingredients */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Label style={{ marginBottom: 0 }}>INGRIDIENTS</Label>
                <button style={seeAllStyle}>See All ›</button>
              </div>

              <SubTitle>Basic</SubTitle>
              <IngredientRow
                items={[
                  { name: "Salt", emoji: "🧂" },
                  { name: "Chicken", emoji: "🍗" },
                  { name: "Onion", emoji: "🧅" },
                  { name: "Garlic", emoji: "🧄" },
                  { name: "Peppers", emoji: "🌶️" },
                  { name: "Ginger", emoji: "🫚" },
                ]}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                <SubTitle style={{ marginBottom: 0 }}>Fruit</SubTitle>
                <button style={seeAllStyle}>See All ›</button>
              </div>

              <IngredientRow
                items={[
                  { name: "Avocado", emoji: "🥑" },
                  { name: "Apple", emoji: "🍎" },
                  { name: "Blueberry", emoji: "🫐" },
                  { name: "Broccoli", emoji: "🥦" },
                  { name: "Orange", emoji: "🍊" },
                  { name: "Walnut", emoji: "🌰" },
                ]}
              />
            </div>

            {/* details */}
            <Label>DESCRIPTION *</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your food item, ingredients, taste, etc."
              style={{
                width: "100%",
                minHeight: 84,
                borderRadius: 12,
                border: "none",
                outline: "none",
                padding: "10px 12px",
                background: "#f6f7fb",
                fontSize: "0.75rem",
                color: "#666",
                resize: "none",
              }}
            />

            {/* save button */}
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                marginTop: 18,
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: "none",
                background: loading ? "#ccc" : ORANGE,
                color: "#fff",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
              }}
            >
              {loading ? "SAVING..." : "SAVE FOOD ITEM"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, style }) {
  return (
    <div
      style={{
        fontSize: "0.65rem",
        fontWeight: 800,
        color: "#9a9a9a",
        marginBottom: 6,
        marginTop: 10,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SubTitle({ children, style }) {
  return (
    <div
      style={{
        fontSize: "0.7rem",
        fontWeight: 800,
        color: "#444",
        marginBottom: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function AddBox() {
  return (
    <div
      style={{
        width: 86,
        height: 72,
        borderRadius: 16,
        background: "#f6f7fb",
        border: "1px dashed #cfd4e6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#8b91a6",
        fontSize: "0.7rem",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e5e7f3",
          marginBottom: 6,
          fontSize: "1rem",
        }}
      >
        ☁️
      </div>
      Add
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "#9a9a9a",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
      />
      {label}
    </label>
  );
}

function IngredientRow({ items }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
      {items.map((it) => (
        <div
          key={it.name}
          style={{
            width: 46,
            textAlign: "center",
            fontSize: "0.6rem",
            color: "#777",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              margin: "0 auto",
              borderRadius: "50%",
              background: "#f6f7fb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            {it.emoji}
          </div>
          <div style={{ marginTop: 4 }}>{it.name}</div>
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 36,
  borderRadius: 10,
  border: "none",
  outline: "none",
  padding: "0 12px",
  background: "#f6f7fb",
  fontSize: "0.75rem",
  color: "#444",
};

const previewBox = {
  width: 86,
  height: 72,
  borderRadius: 16,
  overflow: "hidden",
  background: "#f6f7fb",
  flexShrink: 0,
};

const seeAllStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#9a9a9a",
  fontSize: "0.7rem",
};
