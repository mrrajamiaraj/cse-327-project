import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer/favorites/');
      setFavorites(response.data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError("Failed to load favorites");
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await api.delete(`/customer/favorites/${favoriteId}/`);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={pageTitle}>Favorites</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center", color: "#666" }}>
              Loading your favorites...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={pageTitle}>Favorites</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={fetchFavorites}
                style={{
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Favorites</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={circleBtn} type="button">
              ←
            </button>
            <div style={headerTitle}>My Favorites</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Favorites List */}
          <div style={{ padding: "0 8px" }}>
            {favorites.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#999",
                fontSize: "0.9rem"
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>❤️</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "8px", color: "#333" }}>
                  No Favorites Yet
                </div>
                <div style={{ fontSize: "0.8rem", lineHeight: 1.4, marginBottom: "20px" }}>
                  Start adding restaurants and foods to your favorites to see them here
                </div>
                <button
                  onClick={() => navigate('/home')}
                  style={{
                    padding: "12px 24px",
                    background: ORANGE,
                    color: "white",
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: 600
                  }}
                >
                  Explore Restaurants
                </button>
              </div>
            ) : (
              favorites.map((favorite) => (
                <div key={favorite.id} style={favoriteCard}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {/* Restaurant/Food Image */}
                    <div style={imageContainer}>
                      {favorite.restaurant ? (
                        <img
                          src={favorite.restaurant.banner || "/api/placeholder/60/60"}
                          alt={favorite.restaurant.name}
                          style={favoriteImage}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : (
                        <img
                          src={favorite.food?.image || "/api/placeholder/60/60"}
                          alt={favorite.food?.name}
                          style={favoriteImage}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                      )}
                      <div style={{
                        ...favoriteImage,
                        display: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        color: "#999",
                        background: "#f0f0f0"
                      }}>
                        {favorite.restaurant ? "🏪" : "🍽️"}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={favoriteName}>
                        {favorite.restaurant?.name || favorite.food?.name}
                      </div>
                      <div style={favoriteSubtitle}>
                        {favorite.restaurant 
                          ? `${favorite.restaurant.cuisine} • ${favorite.restaurant.delivery_time || "30-45 min"}`
                          : `${favorite.food?.restaurant_name} • ৳${favorite.food?.price}`
                        }
                      </div>
                      {favorite.restaurant && (
                        <div style={favoriteRating}>
                          ⭐ {favorite.restaurant.rating || "4.5"} • Free delivery
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        onClick={() => {
                          if (favorite.restaurant) {
                            navigate("/restaurant-view", { state: { restaurant: favorite.restaurant } });
                          } else {
                            navigate("/food-details", { state: { food: favorite.food } });
                          }
                        }}
                        style={viewButton}
                      >
                        View
                      </button>
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        style={removeButton}
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Styles */
const pageWrap = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  padding: "18px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const pageTitle = { 
  fontSize: "0.8rem", 
  color: "#c0c0c0", 
  marginBottom: 8, 
  paddingLeft: 6 
};

const phoneCard = {
  borderRadius: 28,
  background: "#fff",
  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
  padding: "14px 12px 20px",
  minHeight: 690,
  position: "relative",
  overflow: "hidden",
};

const headerRow = { 
  display: "flex", 
  alignItems: "center", 
  gap: 10, 
  marginBottom: 20 
};

const circleBtn = { 
  width: 30, 
  height: 30, 
  borderRadius: "50%", 
  border: "none", 
  background: "#f2f3f7", 
  cursor: "pointer" 
};

const headerTitle = { 
  fontSize: "0.85rem", 
  fontWeight: 700, 
  color: "#444" 
};

const favoriteCard = {
  background: "#f8f9fa",
  borderRadius: "16px",
  padding: "16px",
  marginBottom: "12px",
  border: "1px solid #e9ecef",
};

const imageContainer = {
  width: 60,
  height: 60,
  borderRadius: "12px",
  overflow: "hidden",
  flexShrink: 0,
  position: "relative"
};

const favoriteImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const favoriteName = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: "4px"
};

const favoriteSubtitle = {
  fontSize: "0.7rem",
  color: "#666",
  marginBottom: "4px"
};

const favoriteRating = {
  fontSize: "0.65rem",
  color: "#999"
};

const viewButton = {
  padding: "6px 12px",
  background: ORANGE,
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "0.7rem",
  cursor: "pointer",
  fontWeight: 600,
};

const removeButton = {
  padding: "6px 8px",
  background: "transparent",
  color: "#ff3b30",
  border: "1px solid #ff3b30",
  borderRadius: "12px",
  fontSize: "0.8rem",
  cursor: "pointer",
  fontWeight: 600,
};