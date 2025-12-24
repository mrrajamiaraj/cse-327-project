// src/pages/ReviewOrder.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function ReviewOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/customer/orders/${orderId}/`);
      setOrder(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  const submitReview = async () => {
    try {
      setSubmitting(true);
      await api.post(`/customer/orders/${orderId}/rate/`, {
        rating,
        review
      });
      navigate("/my-orders");
    } catch (error) {
      console.error("Error submitting review:", error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>⏳</div>
          <div>Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order || order.status !== 'delivered') {
    return (
      <div style={pageWrap}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>❌</div>
          <div>Order not found or not eligible for review</div>
          <button
            onClick={() => navigate("/my-orders")}
            style={{ ...actionButton, background: ORANGE, marginTop: 20 }}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Review Order</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={backButton}>
              ←
            </button>
            <div style={headerTitle}>Rate Your Experience</div>
            <div style={{ width: 30 }} />
          </div>

          {/* Order Info */}
          <div style={orderCard}>
            <div style={restaurantName}>{order.restaurant?.name}</div>
            <div style={orderInfo}>Order #{order.id} • ৳{order.total}</div>
            <div style={orderDate}>
              Delivered on {new Date(order.updated_at).toLocaleDateString()}
            </div>
          </div>

          {/* Rating Section */}
          <div style={ratingSection}>
            <div style={sectionTitle}>How was your food?</div>
            <div style={starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    ...starButton,
                    color: star <= rating ? "#ffb400" : "#ddd"
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={ratingText}>
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </div>
          </div>

          {/* Review Section */}
          <div style={reviewSection}>
            <div style={sectionTitle}>Tell us more (optional)</div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with the food, delivery, or service..."
              style={reviewTextarea}
              maxLength={500}
            />
            <div style={charCount}>{review.length}/500</div>
          </div>

          {/* Order Items */}
          <div style={itemsSection}>
            <div style={sectionTitle}>Order Items</div>
            <div style={itemsList}>
              {order.items?.map((item, index) => (
                <div key={index} style={orderItem}>
                  <div style={itemName}>
                    {item.quantity}x {item.food_name || `Item ${index + 1}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={submitReview}
            disabled={submitting}
            style={{
              ...submitButton,
              background: submitting ? "#ccc" : ORANGE,
              cursor: submitting ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>

          {/* Skip Button */}
          <button
            onClick={() => navigate("/my-orders")}
            style={skipButton}
          >
            Skip for now
          </button>
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
};

const headerRow = { 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "space-between",
  marginBottom: 20 
};

const backButton = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "#f2f3f7",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const headerTitle = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#444"
};

const orderCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
  textAlign: "center"
};

const restaurantName = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 4
};

const orderInfo = {
  fontSize: "0.9rem",
  color: "#666",
  marginBottom: 4
};

const orderDate = {
  fontSize: "0.8rem",
  color: "#999"
};

const ratingSection = {
  textAlign: "center",
  marginBottom: 25
};

const sectionTitle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 15
};

const starsContainer = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  marginBottom: 10
};

const starButton = {
  border: "none",
  background: "transparent",
  fontSize: "2rem",
  cursor: "pointer",
  transition: "color 0.2s ease"
};

const ratingText = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: ORANGE
};

const reviewSection = {
  marginBottom: 25
};

const reviewTextarea = {
  width: "100%",
  minHeight: 100,
  padding: "12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "0.9rem",
  fontFamily: "inherit",
  resize: "vertical",
  outline: "none"
};

const charCount = {
  fontSize: "0.75rem",
  color: "#999",
  textAlign: "right",
  marginTop: 5
};

const itemsSection = {
  marginBottom: 25
};

const itemsList = {
  background: "#f8f9fa",
  borderRadius: 8,
  padding: 12
};

const orderItem = {
  padding: "8px 0",
  borderBottom: "1px solid #eee"
};

const itemName = {
  fontSize: "0.8rem",
  color: "#333"
};

const submitButton = {
  width: "100%",
  padding: "14px",
  borderRadius: 12,
  border: "none",
  color: "#fff",
  fontSize: "0.9rem",
  fontWeight: 600,
  marginBottom: 10
};

const skipButton = {
  width: "100%",
  padding: "12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#666",
  fontSize: "0.8rem",
  cursor: "pointer"
};

const actionButton = {
  padding: "12px 24px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};