import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function ChatInterface() {
  const { orderId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    fetchChatData(user);
  }, [orderId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatData = async (user = currentUser) => {
    try {
      
      // Determine API path based on user role
      const apiPath = user?.role === 'restaurant' ? 'restaurant' : 'customer';
      
      // Fetch order info
      const orderResponse = await api.get(`/${apiPath}/orders/${orderId}/`);
      setOrderInfo(orderResponse.data);
      
      // Fetch chat messages
      const chatResponse = await api.get(`/${apiPath}/orders/${orderId}/chat/`);
      setMessages(chatResponse.data);
      
    } catch (error) {
      console.error("Error fetching chat data:", error);
      setError("Failed to load chat");
      
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else if (error.response?.status === 404) {
        setError("Order not found");
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !currentUser) return;
    
    try {
      setSending(true);
      
      // Determine API path based on user role
      const apiPath = currentUser.role === 'restaurant' ? 'restaurant' : 'customer';
      
      const response = await api.post(`/${apiPath}/orders/${orderId}/chat/`, {
        message: newMessage.trim()
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage("");
      
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getParticipantName = (user) => {
    if (user.role === 'customer') {
      return `${user.first_name} ${user.last_name}`.trim() || user.email;
    } else if (user.role === 'restaurant') {
      return orderInfo?.restaurant?.name || "Restaurant";
    } else if (user.role === 'rider') {
      return `${user.first_name} ${user.last_name}`.trim() || "Rider";
    }
    return user.email;
  };

  if (error) {
    return (
      <div style={pageWrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={pageTitle}>Chat</div>
          <div style={{...phoneCard, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: "8px 16px",
                  background: ORANGE,
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Go Back
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
        <div style={pageTitle}>Chat</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={circleBtn} type="button">
              ←
            </button>
            <div style={{ flex: 1 }}>
              <div style={headerTitle}>
                Order #{orderId}
              </div>
              <div style={headerSubtitle}>
                {orderInfo && (
                  <>
                    {currentUser?.role === 'restaurant' 
                      ? getParticipantName(orderInfo.user)
                      : getParticipantName(orderInfo.restaurant.owner)
                    }
                  </>
                )}
              </div>
            </div>
            <div style={{ width: 30 }} />
          </div>

          {/* Messages */}
          <div style={messagesContainer}>
            {messages.length === 0 ? (
              <div style={emptyState}>
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>💬</div>
                <div style={{ color: "#999", fontSize: "0.9rem" }}>
                  No messages yet. Start the conversation!
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender.id === currentUser?.id;
                  const showDate = index === 0 || 
                    formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div style={dateHeader}>
                          {formatDate(message.created_at)}
                        </div>
                      )}
                      
                      <div style={messageRow(isCurrentUser)}>
                        {!isCurrentUser && (
                          <div style={senderName}>
                            {getParticipantName(message.sender)}
                          </div>
                        )}
                        
                        <div style={messageBubble(isCurrentUser)}>
                          <div style={messageText}>
                            {message.message}
                          </div>
                          {message.image && (
                            <img 
                              src={message.image} 
                              alt="Attachment" 
                              style={messageImage}
                            />
                          )}
                          <div style={messageTime(isCurrentUser)}>
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div style={inputContainer}>
            <div style={inputRow}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                style={messageInput}
                rows={1}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                style={sendButton(!newMessage.trim() || sending)}
                type="button"
              >
                {sending ? "..." : "→"}
              </button>
            </div>
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
  padding: "14px 12px 0",
  minHeight: 690,
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const headerRow = { 
  display: "flex", 
  alignItems: "center", 
  gap: 10, 
  marginBottom: 14,
  paddingBottom: 10,
  borderBottom: "1px solid #f1f1f1"
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

const headerSubtitle = { 
  fontSize: "0.7rem", 
  color: "#999", 
  marginTop: 2 
};

const messagesContainer = {
  flex: 1,
  overflowY: "auto",
  padding: "10px 0",
  maxHeight: "500px",
};

const emptyState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "300px",
  textAlign: "center",
};

const dateHeader = {
  textAlign: "center",
  fontSize: "0.7rem",
  color: "#999",
  margin: "15px 0 10px",
  padding: "5px 10px",
  background: "#f8f8f8",
  borderRadius: "12px",
  display: "inline-block",
  width: "100%",
};

const messageRow = (isCurrentUser) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: isCurrentUser ? "flex-end" : "flex-start",
  marginBottom: "12px",
  paddingLeft: isCurrentUser ? "40px" : "0",
  paddingRight: isCurrentUser ? "0" : "40px",
});

const senderName = {
  fontSize: "0.65rem",
  color: "#666",
  marginBottom: "4px",
  paddingLeft: "12px",
};

const messageBubble = (isCurrentUser) => ({
  background: isCurrentUser ? ORANGE : "#f1f1f1",
  color: isCurrentUser ? "white" : "#333",
  borderRadius: "18px",
  padding: "10px 14px",
  maxWidth: "80%",
  wordWrap: "break-word",
});

const messageText = {
  fontSize: "0.8rem",
  lineHeight: "1.4",
};

const messageImage = {
  width: "100%",
  maxWidth: "200px",
  borderRadius: "8px",
  marginTop: "8px",
};

const messageTime = (isCurrentUser) => ({
  fontSize: "0.65rem",
  color: isCurrentUser ? "rgba(255,255,255,0.7)" : "#999",
  marginTop: "4px",
  textAlign: "right",
});

const inputContainer = {
  padding: "10px 0 20px",
  borderTop: "1px solid #f1f1f1",
  background: "white",
};

const inputRow = {
  display: "flex",
  gap: "8px",
  alignItems: "flex-end",
};

const messageInput = {
  flex: 1,
  border: "1px solid #e0e0e0",
  borderRadius: "20px",
  padding: "10px 15px",
  fontSize: "0.8rem",
  resize: "none",
  outline: "none",
  fontFamily: "inherit",
  maxHeight: "80px",
};

const sendButton = (disabled) => ({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  border: "none",
  background: disabled ? "#ccc" : ORANGE,
  color: "white",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: "1.2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});