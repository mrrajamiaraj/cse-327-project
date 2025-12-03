import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

// images from assets
import coverImg from "../assets/res-cover.png";
import burger1 from "../assets/item-burger1.png";

const ORANGE = "#ff7a00";

export default function RestaurantView() {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurant = location.state?.restaurant;

  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!restaurant?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch restaurant details
        const restaurantResponse = await api.get(`customer/restaurants/${restaurant.id}/`);
        setRestaurantDetails(restaurantResponse.data);

        // Fetch all foods and filter by restaurant
        const foodsResponse = await api.get('customer/food/');
        const restaurantFoods = foodsResponse.data.filter(food => food.restaurant === restaurant.id);
        setFoodItems(restaurantFoods);

        // Extract unique categories from foods
        const uniqueCategories = [...new Set(restaurantFoods.map(food => food.category?.name).filter(Boolean))];
        setCategories(["All", ...uniqueCategories]);
      } catch (error) {
        console.error("Error fetching restaurant data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurant]);

  // Fallback if no restaurant passed (e.g. direct access)
  const displayRestaurant = restaurantDetails || restaurant || {
    name: "Spicy Restaurant",
    subtitle: "Best spicy foods",
    rating: 4.8,
    time: "25 min",
    isFree: true,
    image: coverImg
  };

  // Filter foods by active category
  const filteredFoods = activeCategory === "All" 
    ? foodItems 
    : foodItems.filter(food => food.category?.name === activeCategory);

  const handleAddToCart = async (foodId) => {
    try {
      await api.post('customer/cart/', {
        food_id: foodId,
        quantity: 1,
        variants: [],
        addons: []
      });
      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

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

          <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#222" }}>
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
            style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 6, color: "#222" }}
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
              <strong style={{ color: "#333" }}>{displayRestaurant.rating}</strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555" }}>
              <span>⏱</span> {displayRestaurant.time}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#555" }}>
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
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 20,
                  border: cat === activeCategory ? "none" : "1px solid #ddd",
                  background: cat === activeCategory ? ORANGE : "#f9f9f9",
                  color: cat === activeCategory ? "#fff" : "#333",
                  fontSize: "0.85rem",
                  fontWeight: cat === activeCategory ? 600 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
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
            color: "#222",
            margin: "16px 0 10px",
          }}
        >
          {activeCategory} ({filteredFoods.length})
        </div>

        {/* horizontal food cards */}
        <div
          style={{
            padding: "0 20px 20px",
            display: "flex",
            gap: 16,
            overflowX: "auto",
          }}
        >
          {filteredFoods.length > 0 ? (
            filteredFoods.map((item) => (
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
                    src={item.image || burger1}
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
                      color: "#222",
                    }}
                  >
                    {item.name}
                  </div>

                  <div style={{ color: "#666", fontSize: "0.75rem" }}>
                    {item.description?.substring(0, 30)}...
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
                      onClick={() => handleAddToCart(item.id)}
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
            ))
          ) : (
            <div style={{ color: "#999", padding: "20px", textAlign: "center", width: "100%" }}>
              No items found in this category
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
