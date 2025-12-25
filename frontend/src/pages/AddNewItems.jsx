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
  const [ingredients, setIngredients] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await api.get('/restaurant/menu/categories/');
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Use default categories if API fails
      setCategories([
        "Biriyani", "Curry", "Kebab", "Fish", "Chicken", "Beef", 
        "Vegetarian", "Dessert", "Snacks", "Drinks", "Coffee", "Tea"
      ]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!itemName.trim() || !price.trim() || !description.trim() || !category) {
      setError("Please fill in all required fields");
      return;
    }

    if (parseFloat(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      setError("");
      setLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', itemName.trim());
      formData.append('price', parseFloat(price));
      formData.append('description', description.trim());
      formData.append('category_name', category);
      formData.append('is_veg', isVeg);
      formData.append('stock_quantity', parseInt(stockQuantity) || 50);
      formData.append('is_available', true);
      
      if (ingredients.trim()) {
        formData.append('ingredients', ingredients.trim());
      }
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await api.post('/restaurant/menu/items/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert("Food item added successfully!");
      navigate("/seller-dashboard");
      
    } catch (error) {
      console.error("Error saving food item:", error);
      setError(error.response?.data?.error || "Failed to save food item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setItemName("");
    setPrice("");
    setDescription("");
    setCategory("");
    setIsVeg(true);
    setStockQuantity("50");
    setIngredients("");
    setSelectedImage(null);
    setImagePreview(null);
    setError("");
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
              onClick={handleReset}
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
              {categories.map((cat, index) => (
                <option key={index} value={typeof cat === 'string' ? cat : cat.name}>
                  {typeof cat === 'string' ? cat : cat.name}
                </option>
              ))}
              <option value="Custom">+ Add New Category</option>
            </select>

            {/* Custom category input */}
            {category === "Custom" && (
              <>
                <Label>NEW CATEGORY NAME *</Label>
                <input
                  value=""
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter new category name"
                  style={inputStyle}
                />
              </>
            )}

            {/* upload */}
            <Label>UPLOAD PHOTO</Label>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {/* preview */}
              <div style={previewBox}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#999",
                    fontSize: "0.7rem"
                  }}>
                    No Image
                  </div>
                )}
              </div>

              {/* add boxes */}
              <AddBox onClick={() => document.getElementById('imageInput').click()} />
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
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
                  min="0"
                  step="0.01"
                  style={{ ...inputStyle, paddingLeft: 24 }}
                />
              </div>

              <div style={{ display: "flex", gap: 14, fontSize: "0.7rem", alignItems: "center" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#9a9a9a",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer"
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    style={{
                      width: "16px",
                      height: "16px",
                      accentColor: ORANGE,
                      cursor: "pointer"
                    }}
                  />
                  <span style={{ color: isVeg ? "#4CAF50" : "#666" }}>
                    {isVeg ? "🟢 Vegetarian" : "🔴 Non-Vegetarian"}
                  </span>
                </label>
              </div>
            </div>

            {/* stock quantity */}
            <Label>STOCK QUANTITY</Label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="Available quantity"
              min="0"
              style={inputStyle}
            />

            {/* ingredients */}
            <Label>INGREDIENTS</Label>
            <input
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="List main ingredients (optional)"
              style={inputStyle}
            />

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

function AddBox({ onClick }) {
  return (
    <div
      onClick={onClick}
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
        cursor: "pointer",
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
        📷
      </div>
      Add Photo
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
