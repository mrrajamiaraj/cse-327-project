import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const DARK_TEXT = "#222";

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    try {
      const response = await api.get(`/customer/search/?q=${searchTerm}`);
      setResults(response.data.restaurants);

      // Add to recent searches if results found
      if (response.data.restaurants.length > 0) {
        addToRecent(searchTerm);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToRecent = (term) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleRestaurantClick = (restaurant) => {
    navigate(`/restaurant/${restaurant.id}`, { state: { restaurant } });
  };

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
          padding: "20px 18px 24px",
          display: "flex",
          flexDirection: "column",
          minHeight: "80vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ border: "none", background: "transparent", fontSize: "1.2rem", marginRight: 10, cursor: "pointer" }}
          >
            ←
          </button>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
            Search
          </h2>
        </div>

        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f5f5f7",
            padding: "8px 10px",
            borderRadius: 16,
            marginBottom: 18,
          }}
        >
          <span role="img" aria-label="search">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search burger, pizza, salad..."
            autoFocus
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.9rem",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ border: "none", background: "transparent", color: "#999", cursor: "pointer" }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Recent keywords */}
        {!query && recentSearches.length > 0 && (
          <section style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: "0.9rem", marginBottom: 6 }}>Recent Keywords</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {recentSearches.map((tag) => (
                <span
                  key={tag}
                  onClick={() => setQuery(tag)}
                  style={{
                    padding: "4px 10px",
                    background: "#f5f5f7",
                    borderRadius: 20,
                    fontSize: "0.8rem",
                    color: "#555",
                    cursor: "pointer",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        <section style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: "#999" }}>Searching...</div>
          ) : (
            <>
              {query && (
                <h3 style={{ fontSize: "0.9rem", marginBottom: 12 }}>
                  {results.length > 0 ? `Results for "${query}"` : `No results for "${query}"`}
                </h3>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {results.map((r) => (
                  <div key={r.id} onClick={() => handleRestaurantClick(r)} style={{ cursor: "pointer" }}>
                    <RestaurantCard restaurant={r} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
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
        border: "1px solid #eee",
      }}
    >
      {/* image */}
      <div style={{ height: 160, overflow: "hidden" }}>
        <img
          src={restaurant.banner || "https://placehold.co/400x300?text=Restaurant"}
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
          {restaurant.cuisine || "Fast Food • Burgers"}
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
            ⭐ <strong>{restaurant.rating || "4.5"}</strong>
          </span>
          <span>{restaurant.delivery_fee === 0 ? "Free" : "৳ 40 delivery"}</span>
          <span>⏱ {restaurant.delivery_time || "20 min"}</span>
        </div>
      </div>
    </div>
  );
}
