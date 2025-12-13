import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function SellerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      // Fetch restaurant orders and reviews for notifications
      const [ordersResponse, reviewsResponse] = await Promise.all([
        api.get('/restaurant/orders/'),
        api.get('/restaurant/reviews/')
      ]);
      
      const orders = ordersResponse.data;
      const reviews = reviewsResponse.data;
      
      const notificationsList = [];
      
      // Add order notifications
      orders.slice(0, 5).forEach(order => {
        const customer = order.user;
        notificationsList.push({
          id: `order-${order.id}`,
          name: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
          text: getOrderNotificationText(order.status),
          time: getTimeAgo(order.created_at),
          avatar: customer.avatar_url,
          thumb: null, // Could add food image here
          type: 'order',
          orderId: order.id
        });
      });
      
      // Add review notifications
      reviews.slice(0, 3).forEach(review => {
        const customer = review.order.user;
        notificationsList.push({
          id: `review-${review.id}`,
          name: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
          text: `left a ${review.rating} star review`,
          time: getTimeAgo(review.created_at),
          avatar: customer.avatar_url,
          thumb: null,
          type: 'review',
          reviewId: review.id
        });
      });
      
      // Sort by most recent
      notificationsList.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      setNotifications(notificationsList.slice(0, 10)); // Limit to 10 notifications
      
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications");
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getOrderNotificationText = (status) => {
    const statusTexts = {
      'pending': 'placed a new order',
      'preparing': 'order is being prepared',
      'ready_for_pickup': 'order is ready',
      'delivered': 'order was delivered',
      'cancelled': 'cancelled their order'
    };
    return statusTexts[status] || 'updated their order';
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={pageTitle}>Notification</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center", color: "#666" }}>
              Loading notifications...
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
          <div style={pageTitle}>Notification</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={fetchNotifications}
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
        <div style={pageTitle}>Notification</div>

        <div style={phoneCard}>
          {/* header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={circleBtn} type="button">
              ←
            </button>
            <div style={headerTitle}>Notifications</div>
            <div style={{ width: 30 }} />
          </div>

          {/* tabs */}
          <div style={tabRow}>
            <button style={{ ...tabBtn, color: ORANGE, fontWeight: 700 }} type="button">
              Notifications
            </button>

            <button
              style={{ ...tabBtn, color: "#b0b0b0" }}
              onClick={() => navigate("/seller-messages")}
              type="button"
            >
              Messages
            </button>
          </div>

          <div style={tabUnderlineWrap}>
            <div style={tabUnderline} />
          </div>

          {/* list */}
          <div style={{ padding: "0 8px" }}>
            {notifications.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
                fontSize: "0.9rem"
              }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={rowItem}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={avatarBox}>
                      {n.avatar ? (
                        <img
                          src={n.avatar}
                          alt={n.name}
                          style={avatarImg}
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      ) : (
                        <div style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#e0e0e0",
                          color: "#666",
                          fontSize: "1rem"
                        }}>
                          👤
                        </div>
                      )}
                    </div>

                    <div>
                      <div style={nameText}>
                        {n.name} <span style={{ fontWeight: 500, color: "#888" }}>{n.text}</span>
                      </div>
                      <div style={timeText}>{n.time}</div>
                    </div>
                  </div>

                  <div style={thumbBox}>
                    {n.thumb ? (
                      <img
                        src={n.thumb}
                        alt="food"
                        style={thumbImg}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f0f0f0",
                        color: "#999",
                        fontSize: "1.2rem"
                      }}>
                        {n.type === 'order' ? '🍽️' : '⭐'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* bottom nav */}
          <SellerBottomNav active="bell" />
        </div>
      </div>
    </div>
  );
}

function SellerBottomNav({ active }) {
  const navigate = useNavigate();

  return (
    <div style={bottomNav}>
      <button style={navBtn(active === "grid")} onClick={() => navigate("/my-food")} type="button">
        ▦
      </button>
      <button style={navBtn(active === "list")} onClick={() => navigate("/running-orders")} type="button">
        ≡
      </button>

      <button style={plusBtn} onClick={() => navigate("/add-new-items")} type="button">
        +
      </button>

      <button style={navBtn(active === "bell")} onClick={() => navigate("/seller-notifications")} type="button">
        🔔
      </button>
      <button style={navBtn(active === "user")} onClick={() => navigate("/seller-profile")} type="button">
        👤
      </button>
    </div>
  );
}

/* styles */
const pageWrap = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  padding: "18px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const pageTitle = { fontSize: "0.8rem", color: "#c0c0c0", marginBottom: 8, paddingLeft: 6 };

const phoneCard = {
  borderRadius: 28,
  background: "#fff",
  boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
  padding: "14px 12px 70px",
  minHeight: 690,
  position: "relative",
  overflow: "hidden",
};

const headerRow = { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 };
const circleBtn = { width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f2f3f7", cursor: "pointer" };
const headerTitle = { fontSize: "0.85rem", fontWeight: 700, color: "#444" };

const tabRow = { display: "flex", gap: 26, paddingLeft: 6, fontSize: "0.72rem" };
const tabBtn = { border: "none", background: "transparent", cursor: "pointer", padding: 0 };

const tabUnderlineWrap = { paddingLeft: 6, marginTop: 6, marginBottom: 8 };
const tabUnderline = { width: 78, height: 2, background: ORANGE, borderRadius: 99 };

const rowItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #f1f1f1",
};

const avatarBox = { width: 38, height: 38, borderRadius: "50%", overflow: "hidden", background: "#eee" };
const avatarImg = { width: "100%", height: "100%", objectFit: "cover" };
const nameText = { fontSize: "0.75rem", fontWeight: 700, color: "#333" };
const timeText = { fontSize: "0.62rem", color: "#b3b3b3", marginTop: 2 };

const thumbBox = { width: 44, height: 44, borderRadius: 12, overflow: "hidden", background: "#eee" };
const thumbImg = { width: "100%", height: "100%", objectFit: "cover" };

const bottomNav = {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 10,
  height: 50,
  borderRadius: 24,
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-around",
  zIndex: 999,
};

const navBtn = (isActive) => ({
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
  color: isActive ? ORANGE : "#9a9a9a",
});

const plusBtn = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: `2px solid ${ORANGE}`,
  background: "#fffaf6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: ORANGE,
  fontSize: "1.3rem",
  marginTop: -22,
  boxShadow: "0 4px 12px rgba(255,122,0,0.55)",
  cursor: "pointer",
};
