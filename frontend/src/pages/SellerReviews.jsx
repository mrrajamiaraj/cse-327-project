import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function SellerReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      const response = await api.get('/restaurant/reviews/');
      setReviews(response.data);
      
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Failed to load reviews");
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const getCustomerName = (review) => {
    const user = review.order?.user;
    if (!user) return "Anonymous Customer";
    
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email || "Customer";
  };

  if (loading) {
    return (
      <div style={wrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={title}>Review Screen</div>
          <div style={{...card, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center", color: "#666" }}>
              Loading reviews...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={wrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={title}>Review Screen</div>
          <div style={{...card, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={fetchReviews}
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
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={title}>Review Screen</div>

        <div style={card}>
          <div style={header}>
            <button onClick={() => navigate(-1)} style={backBtn}>←</button>
            <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>Reviews</div>
            <div style={{ width: 30 }} />
          </div>

          <div style={{ padding: "6px 8px 18px" }}>
            {reviews.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
                fontSize: "0.9rem"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⭐</div>
                No reviews yet
              </div>
            ) : (
              reviews.map((r) => (
                <div key={r.id} style={reviewRow}>
                  <div style={avatar} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.65rem", color: "#9a9a9a" }}>{formatDate(r.created_at)}</div>
                    <div style={{ fontWeight: 800, fontSize: "0.8rem", marginTop: 2 }}>{getCustomerName(r)}</div>
                    <div style={{ marginTop: 4, fontSize: "0.72rem", color: ORANGE }}>
                      {"★".repeat(r.rating)}{" "}
                      <span style={{ color: "#ddd" }}>{"★".repeat(5 - r.rating)}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: "0.72rem", color: "#777", lineHeight: 1.3 }}>
                      {r.review || "No review text provided"}
                    </div>
                  </div>
                  <button style={dots}>⋯</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const wrap = {
  width: "100vw", minHeight: "100vh", background: "#f3f3f3",
  display: "flex", justifyContent: "center", padding: "18px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};
const title = { fontSize: "0.8rem", color: "#bbb", marginBottom: 6 };
const card = { background: "#fff", borderRadius: 28, boxShadow: "0 18px 40px rgba(0,0,0,.12)", minHeight: 720, position: "relative" };
const header = { display: "flex", alignItems: "center", gap: 10, padding: "14px 12px 10px" };
const backBtn = { width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f2f3f7", cursor: "pointer", fontSize: "1rem" };
const reviewRow = { display: "flex", gap: 10, background: "#f7f8fc", borderRadius: 14, padding: "12px 12px", marginBottom: 10, alignItems: "flex-start" };
const avatar = { width: 34, height: 34, borderRadius: "50%", background: "#dfe3ee", flexShrink: 0 };
const dots = { border: "none", background: "transparent", cursor: "pointer", color: "#999", fontSize: "1.2rem" };
