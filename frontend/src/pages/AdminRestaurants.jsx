// src/pages/AdminRestaurants.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for status filter from URL params
    const statusParam = searchParams.get('status');
    if (statusParam === 'pending') {
      setFilter('pending');
    }
    fetchRestaurants();
  }, [searchParams]);

  useEffect(() => {
    filterRestaurants();
  }, [restaurants, filter, searchTerm]);

  const fetchRestaurants = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'admin') {
        navigate("/login");
        return;
      }

      const response = await api.get('/admin/restaurants/');
      setRestaurants(response.data.results || response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setLoading(false);
    }
  };

  const filterRestaurants = () => {
    let filtered = restaurants;

    // Filter by approval status
    if (filter === "approved") {
      filtered = filtered.filter(restaurant => restaurant.is_approved);
    } else if (filter === "pending") {
      filtered = filtered.filter(restaurant => !restaurant.is_approved);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.owner?.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRestaurants(filtered);
  };

  const approveRestaurant = async (restaurantId) => {
    try {
      await api.post(`/admin/restaurants/${restaurantId}/approve/`);
      fetchRestaurants(); // Refresh the list
    } catch (error) {
      console.error("Error approving restaurant:", error);
    }
  };

  const toggleRestaurantStatus = async (restaurantId, currentStatus) => {
    try {
      await api.patch(`/admin/restaurants/${restaurantId}/`, {
        is_approved: !currentStatus
      });
      fetchRestaurants(); // Refresh the list
    } catch (error) {
      console.error("Error updating restaurant status:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>⏳</div>
          <div>Loading restaurants...</div>
        </div>
      </div>
    );
  }

  const pendingCount = restaurants.filter(r => !r.is_approved).length;
  const approvedCount = restaurants.filter(r => r.is_approved).length;

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <div style={headerSection}>
          <button onClick={() => navigate("/admin-dashboard")} style={backButton}>
            ← Back to Dashboard
          </button>
          <div style={pageTitle}>Restaurant Management</div>
        </div>

        <div style={dashboardContainer}>
          {/* Filters and Search */}
          <div style={filtersSection}>
            <div style={filterTabs}>
              <button
                onClick={() => setFilter("all")}
                style={{
                  ...filterTab,
                  background: filter === "all" ? ORANGE : "transparent",
                  color: filter === "all" ? "#fff" : "#666"
                }}
              >
                All ({restaurants.length})
              </button>
              <button
                onClick={() => setFilter("approved")}
                style={{
                  ...filterTab,
                  background: filter === "approved" ? ORANGE : "transparent",
                  color: filter === "approved" ? "#fff" : "#666"
                }}
              >
                ✅ Approved ({approvedCount})
              </button>
              <button
                onClick={() => setFilter("pending")}
                style={{
                  ...filterTab,
                  background: filter === "pending" ? ORANGE : "transparent",
                  color: filter === "pending" ? "#fff" : "#666"
                }}
              >
                ⏳ Pending ({pendingCount})
              </button>
            </div>

            <input
              type="text"
              placeholder="Search restaurants by name, cuisine, or owner email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInput}
            />
          </div>

          {/* Restaurants Grid */}
          <div style={restaurantsGrid}>
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} style={restaurantCard}>
                {/* Restaurant Image */}
                <div style={restaurantImageContainer}>
                  {restaurant.banner ? (
                    <img
                      src={restaurant.banner}
                      alt={restaurant.name}
                      style={restaurantImage}
                    />
                  ) : (
                    <div style={restaurantImagePlaceholder}>
                      🏪
                    </div>
                  )}
                  <div
                    style={{
                      ...statusBadge,
                      background: restaurant.is_approved ? "#28a745" : "#ffc107",
                      color: restaurant.is_approved ? "#fff" : "#333"
                    }}
                  >
                    {restaurant.is_approved ? "✅ Approved" : "⏳ Pending"}
                  </div>
                </div>

                {/* Restaurant Info */}
                <div style={restaurantInfo}>
                  <div style={restaurantName}>{restaurant.name}</div>
                  <div style={restaurantCuisine}>{restaurant.cuisine}</div>
                  
                  {restaurant.address && (
                    <div style={restaurantAddress}>
                      📍 {restaurant.address}
                    </div>
                  )}

                  <div style={ownerInfo}>
                    <div style={ownerLabel}>Owner:</div>
                    <div style={ownerDetails}>
                      {restaurant.owner?.first_name} {restaurant.owner?.last_name}
                    </div>
                    <div style={ownerEmail}>{restaurant.owner?.email}</div>
                  </div>

                  <div style={restaurantStats}>
                    <div style={statItem}>
                      <span style={statLabel}>Prep Time:</span>
                      <span style={statValue}>{restaurant.prep_time_minutes} min</span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>Rating:</span>
                      <span style={statValue}>⭐ {restaurant.average_rating || 0}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={actionButtons}>
                    {!restaurant.is_approved ? (
                      <button
                        onClick={() => approveRestaurant(restaurant.id)}
                        style={{ ...actionButton, background: "#28a745" }}
                      >
                        ✅ Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleRestaurantStatus(restaurant.id, restaurant.is_approved)}
                        style={{ ...actionButton, background: "#dc3545" }}
                      >
                        ❌ Revoke
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigate(`/admin/restaurants/${restaurant.id}`)}
                      style={{ ...actionButton, background: "#007bff" }}
                    >
                      👁️ View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRestaurants.length === 0 && (
            <div style={emptyState}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>🏪</div>
              <div style={{ fontSize: "1.2rem", marginBottom: 8 }}>No restaurants found</div>
              {searchTerm && (
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  Try adjusting your search or filters
                </div>
              )}
            </div>
          )}
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
  padding: "20px",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const headerSection = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  marginBottom: 20
};

const backButton = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#6c757d",
  color: "#fff",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer"
};

const pageTitle = {
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#333"
};

const dashboardContainer = {
  background: "#fff",
  borderRadius: 16,
  padding: 30,
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
};

const filtersSection = {
  marginBottom: 30
};

const filterTabs = {
  display: "flex",
  gap: 8,
  marginBottom: 20,
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 4
};

const filterTab = {
  flex: 1,
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const searchInput = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "0.9rem",
  outline: "none"
};

const restaurantsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
  gap: 20
};

const restaurantCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid #e9ecef"
};

const restaurantImageContainer = {
  position: "relative",
  height: 150,
  overflow: "hidden"
};

const restaurantImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const restaurantImagePlaceholder = {
  width: "100%",
  height: "100%",
  background: "#e9ecef",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "3rem",
  color: "#6c757d"
};

const statusBadge = {
  position: "absolute",
  top: 10,
  right: 10,
  padding: "4px 8px",
  borderRadius: 12,
  fontSize: "0.75rem",
  fontWeight: 600
};

const restaurantInfo = {
  padding: 20
};

const restaurantName = {
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 4
};

const restaurantCuisine = {
  fontSize: "0.9rem",
  color: ORANGE,
  fontWeight: 600,
  marginBottom: 8
};

const restaurantAddress = {
  fontSize: "0.8rem",
  color: "#666",
  marginBottom: 12
};

const ownerInfo = {
  background: "#fff",
  borderRadius: 8,
  padding: 12,
  marginBottom: 12
};

const ownerLabel = {
  fontSize: "0.75rem",
  color: "#666",
  fontWeight: 600,
  marginBottom: 4
};

const ownerDetails = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 2
};

const ownerEmail = {
  fontSize: "0.8rem",
  color: "#666"
};

const restaurantStats = {
  display: "flex",
  gap: 20,
  marginBottom: 15
};

const statItem = {
  display: "flex",
  flexDirection: "column",
  gap: 2
};

const statLabel = {
  fontSize: "0.75rem",
  color: "#666"
};

const statValue = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#333"
};

const actionButtons = {
  display: "flex",
  gap: 10
};

const actionButton = {
  flex: 1,
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer"
};

const emptyState = {
  textAlign: "center",
  padding: "80px 20px",
  color: "#666"
};