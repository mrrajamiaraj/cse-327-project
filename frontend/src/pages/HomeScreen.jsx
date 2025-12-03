import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
// category icons from assets
import catAll from "../assets/cat-all.png";
import catHotdog from "../assets/cat-hotdog.png";
import catBurger from "../assets/cat-burger.png";
// import catPizza from "../assets/cat-pizza.png"; // use when you add pizza icon

const ORANGE = "#ff7a00";
const GREY_BG = "#f3f3f3";
const DARK_TEXT = "#222";

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]); // Store all for filtering
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false); // For menu dropdown
  const [userProfile, setUserProfile] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("customer/home/");
        // Transform backend categories
        const backendCategories = response.data.categories.map(c => ({
          id: c.id,
          label: c.name,
          image: c.icon || catAll
        }));

        // Add "All" category manually
        setCategories([{ id: 0, label: "All", image: catAll }, ...backendCategories]);

        // Transform restaurants
        const backendRestaurants = response.data.nearby_restaurants.map(r => ({
          id: r.id,
          name: r.name,
          subtitle: r.cuisine,
          rating: r.rating,
          isFree: r.delivery_time === "Free",
          time: r.delivery_time,
          image: r.banner || "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=800"
        }));
        setRestaurants(backendRestaurants);
        setAllRestaurants(backendRestaurants);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const response = await api.get('auth/profile/');
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchData();
    fetchProfile();

    // Load location from localStorage
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation));
    }
  }, []);

  // Filter restaurants when category changes
  useEffect(() => {
    const filterRestaurants = async () => {
      if (activeCategory === "All") {
        setRestaurants(allRestaurants);
      } else {
        // Fetch all foods to see which restaurants have items in this category
        try {
          const foodsResponse = await api.get('customer/food/');
          const selectedCategory = categories.find(c => c.label === activeCategory);
          
          // Find foods that belong to the selected category
          const foodsInCategory = foodsResponse.data.filter(food => 
            food.category === selectedCategory?.id
          );
          
          // Get unique restaurant IDs from those foods
          const restaurantIds = [...new Set(foodsInCategory.map(food => food.restaurant))];
          
          // Filter restaurants that have foods in this category
          const filtered = allRestaurants.filter(r => restaurantIds.includes(r.id));
          setRestaurants(filtered);
        } catch (error) {
          console.error("Error filtering restaurants:", error);
          // Fallback to cuisine-based filtering
          const filtered = allRestaurants.filter(r =>
            r.subtitle.toLowerCase().includes(activeCategory.toLowerCase())
          );
          setRestaurants(filtered);
        }
      }
    };
    
    filterRestaurants();
  }, [activeCategory, allRestaurants, categories]);

  const handleRestaurantClick = (restaurant) => {
    navigate("/restaurant-view", { state: { restaurant } });
  };

  const handleMenuClick = () => {
    navigate('/menu');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

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
          position: "relative"
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
              onClick={handleMenuClick}
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
                position: "relative"
              }}
            >
              <span style={{ width: 14, height: 2, borderRadius: 999, background: "#333" }} />
              <span style={{ width: 18, height: 2, borderRadius: 999, background: "#333" }} />
              <span style={{ width: 14, height: 2, borderRadius: 999, background: "#333" }} />

              {menuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 45,
                    left: 0,
                    background: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    borderRadius: 12,
                    padding: "12px",
                    zIndex: 10,
                    minWidth: 220,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Profile Info */}
                  <div style={{ padding: "8px", borderBottom: "1px solid #eee", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: 4 }}>
                      {userProfile?.first_name || userProfile?.email || "User"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {userProfile?.email}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#999", marginTop: 4 }}>
                      Role: {userProfile?.role || "customer"}
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/personal-info');
                    }}
                    style={{
                      padding: "10px 8px",
                      fontSize: "0.9rem",
                      color: "#333",
                      cursor: "pointer",
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                  >
                    👤 View Profile
                  </div>
                  <div
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/orders');
                    }}
                    style={{
                      padding: "10px 8px",
                      fontSize: "0.9rem",
                      color: "#333",
                      cursor: "pointer",
                      borderRadius: 6,
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                  >
                    📦 My Orders
                  </div>
                  <div
                    onClick={() => {
                      localStorage.removeItem('token');
                      setMenuOpen(false);
                      navigate('/login');
                    }}
                    style={{
                      padding: "10px 8px",
                      fontSize: "0.9rem",
                      color: "#ff4444",
                      cursor: "pointer",
                      borderRadius: 6,
                      borderTop: "1px solid #eee",
                      marginTop: 8,
                      paddingTop: 12,
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#fff5f5"}
                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                  >
                    🚪 Logout
                  </div>
                </div>
              )}
            </button>

            {/* Location text */}
            <div onClick={() => navigate('/location')} style={{ cursor: 'pointer' }}>
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
                  fontSize: "0.85rem",
                  color: "#444",
                  maxWidth: "180px",
                }}
              >
                <span style={{ 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}>
                  {userLocation?.address || "NSU Campus"}
                </span>
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
            Hey <strong>{userProfile?.first_name || "there"}</strong>, Good Afternoon!
          </span>
        </div>

        {/* Search bar */}
        <div
          onClick={() => navigate('/search')}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f5f5f7",
            padding: "10px 12px",
            borderRadius: 18,
            marginBottom: 20,
            cursor: "pointer"
          }}
        >
          <span role="img" aria-label="search">
            🔍
          </span>
          <input
            placeholder="Search dishes, restaurants"
            readOnly // Make it read-only so click triggers navigation
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.9rem",
              cursor: "pointer"
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
            <span style={{ fontWeight: 600, fontSize: "1rem", color: "#222" }}>
              All Categories
            </span>
            <button
              onClick={() => navigate('/search')} // Navigate to search/categories
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
            <span style={{ fontWeight: 600, fontSize: "1rem", color: "#222" }}>
              Open Restaurants
            </span>
            <button
              onClick={() => navigate('/restaurant-view')}
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
            {restaurants.length > 0 ? (
              restaurants.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRestaurantClick(r)}
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
              ))
            ) : (
              <div style={{ color: "#999", textAlign: "center", padding: "20px" }}>
                No restaurants found in this category.
              </div>
            )}
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
