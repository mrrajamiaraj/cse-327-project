import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function FoodDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadFoodDetails = async () => {
      try {
        // Check if food data was passed via state
        if (location.state?.food) {
          setFood(location.state.food);
          setLoading(false);
        } else if (location.state?.foodId) {
          // Fetch food details by ID
          const response = await api.get(`/customer/food/${location.state.foodId}/`);
          setFood(response.data);
          setLoading(false);
        } else {
          // No food data provided, redirect back
          navigate(-1);
        }
      } catch (error) {
        console.error("Error loading food details:", error);
        navigate(-1);
      }
    };

    loadFoodDetails();
  }, [location.state, navigate]);

  const addToCart = async () => {
    try {
      await api.post('/customer/cart/add/', {
        food_id: food.id,
        quantity: quantity
      });
      
      // Show success message or navigate to cart
      alert('Added to cart successfully!');
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ color: "#666", fontSize: "1rem" }}>Loading...</div>
      </div>
    );
  }

  if (!food) {
    return (
      <div style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ color: "#666", fontSize: "1rem" }}>Food not found</div>
      </div>
    );
  }
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
            src={food.image || "https://images.pexels.com/photos/2619967/pexels-photo-2619967.jpeg?auto=compress&cs=tinysrgb&w=800"}
            alt={food.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "18px 18px 24px" }}>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              marginBottom: "12px",
              color: "#666"
            }}
          >
            ← Back
          </button>

          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 4, color: "#222" }}>
            {food.name}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#777", marginBottom: 12 }}>
            {food.description || `Delicious ${food.name} from ${food.restaurant}`}
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
            <span>⭐ 4.5</span>
            <span>🕒 20-30 min</span>
            <span>🏪 {food.restaurant}</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: "1.3rem", fontWeight: 700, color: ORANGE }}>
              ৳{food.price}
            </span>
          </div>

          {/* Quantity Selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: 8, color: "#222" }}>
              Quantity
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                −
              </button>
              <span style={{ fontSize: "1.1rem", fontWeight: 600, minWidth: "30px", textAlign: "center" }}>
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            style={{
              width: "100%",
              padding: "14px",
              background: ORANGE,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.background = "#e66a00"}
            onMouseLeave={(e) => e.target.style.background = ORANGE}
          >
            Add to Cart • ৳{(food.price * quantity).toFixed(0)}
          </button>
        </div>
      </div>
    </div>
  );
}

