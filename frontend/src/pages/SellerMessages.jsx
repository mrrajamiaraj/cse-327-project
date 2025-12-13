import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function SellerMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      // Fetch restaurant orders to get real chat conversations
      const ordersResponse = await api.get('/restaurant/orders/');
      const orders = ordersResponse.data;
      
      // Get real chat messages for each order
      const conversationsMap = {};
      let totalUnread = 0;
      
      for (const order of orders) {
        try {
          // Fetch chat messages for this order
          const chatResponse = await api.get(`/restaurant/orders/${order.id}/chat/`);
          const chatMessages = chatResponse.data;
          
          if (chatMessages.length > 0) {
            // Get the last message
            const lastMessage = chatMessages[chatMessages.length - 1];
            const customer = order.user;
            const customerKey = customer.id;
            
            // Count unread messages (messages not from restaurant)
            const unreadCount = chatMessages.filter(msg => 
              msg.sender.role !== 'restaurant' && 
              new Date(msg.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            ).length;
            
            if (!conversationsMap[customerKey] || 
                new Date(lastMessage.created_at) > new Date(conversationsMap[customerKey].lastMessageTime)) {
              
              conversationsMap[customerKey] = {
                id: customer.id,
                name: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
                text: lastMessage.message.length > 50 ? 
                      lastMessage.message.substring(0, 50) + "..." : 
                      lastMessage.message,
                time: formatTime(lastMessage.created_at),
                badge: unreadCount,
                avatar: customer.avatar_url || null,
                orderId: order.id,
                lastMessageTime: lastMessage.created_at,
                senderRole: lastMessage.sender.role
              };
            }
            
            totalUnread += unreadCount;
          }
        } catch (chatError) {
          console.log(`No chat messages for order ${order.id}`);
          // If no chat messages, still show the order for potential messaging
          const customer = order.user;
          const customerKey = customer.id;
          
          if (!conversationsMap[customerKey]) {
            conversationsMap[customerKey] = {
              id: customer.id,
              name: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
              text: `Order #${order.id} - ${order.status}`,
              time: formatTime(order.created_at),
              badge: 0,
              avatar: customer.avatar_url || null,
              orderId: order.id,
              lastMessageTime: order.created_at,
              senderRole: 'system'
            };
          }
        }
      }
      
      const messagesList = Object.values(conversationsMap)
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
        .slice(0, 10);
      
      setMessages(messagesList);
      setMessageCount(totalUnread);
      
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages");
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getLastMessageText = (order) => {
    const statusMessages = {
      'pending': 'New order placed!',
      'preparing': 'Order is being prepared',
      'ready_for_pickup': 'Order is ready for pickup',
      'delivered': 'Thank you for the delicious food!',
      'cancelled': 'Order was cancelled'
    };
    return statusMessages[order.status] || 'Order update';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (loading) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={pageTitle}>Messages</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center", color: "#666" }}>
              Loading messages...
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
          <div style={pageTitle}>Messages</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={fetchMessages}
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
        <div style={pageTitle}>Messages</div>

        <div style={phoneCard}>
          {/* header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={circleBtn} type="button">
              ←
            </button>
            <div style={headerTitle}>Messages</div>
            <div style={{ width: 30 }} />
          </div>

          {/* tabs */}
          <div style={tabRow}>
            <button
              style={{ ...tabBtn, color: "#b0b0b0" }}
              onClick={() => navigate("/seller-notifications")}
              type="button"
            >
              Notifications
            </button>

            <button style={{ ...tabBtn, color: ORANGE, fontWeight: 700 }} type="button">
              Messages ({messageCount})
            </button>
          </div>

          <div style={tabUnderlineWrapRight}>
            <div style={tabUnderline} />
          </div>

          {/* list */}
          <div style={{ padding: "0 8px" }}>
            {messages.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
                fontSize: "0.9rem"
              }}>
                No customer messages yet
              </div>
            ) : (
              messages.map((m) => (
                <div 
                  key={m.id} 
                  style={{...msgRow, cursor: "pointer"}}
                  onClick={() => navigate(`/chat/${m.orderId}`)}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={avatarBox}>
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
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
                      <div style={nameText}>{m.name}</div>
                      <div style={msgText}>
                        {m.senderRole === 'restaurant' && "You: "}
                        {m.text}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={timeRight}>{m.time}</div>
                    {m.badge > 0 && <div style={badge}>{m.badge}</div>}
                  </div>
                </div>
              ))
            )}
          </div>

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
const tabUnderline = { width: 78, height: 2, background: ORANGE, borderRadius: 99 };
const tabUnderlineWrapRight = { paddingLeft: 128, marginTop: 6, marginBottom: 8 }; // shifts underline to right

const msgRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
  borderBottom: "1px solid #f1f1f1",
};
const avatarBox = { width: 38, height: 38, borderRadius: "50%", overflow: "hidden", background: "#eee" };
const avatarImg = { width: "100%", height: "100%", objectFit: "cover" };

const nameText = { fontSize: "0.75rem", fontWeight: 700, color: "#333" };
const msgText = { fontSize: "0.68rem", color: "#9a9a9a", marginTop: 2, maxWidth: 180 };
const timeRight = { fontSize: "0.62rem", color: "#b3b3b3" };
const badge = {
  marginTop: 6,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 18,
  height: 18,
  borderRadius: 999,
  background: ORANGE,
  color: "#fff",
  fontSize: "0.65rem",
  fontWeight: 700,
};

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
