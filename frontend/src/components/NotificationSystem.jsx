// src/components/NotificationSystem.jsx
import { useState, useEffect } from "react";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Set up periodic notification checking
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) return;

      const response = await api.get('/customer/notifications/');
      const unreadNotifications = (response.data.results || response.data).filter(n => !n.is_read);
      setNotifications(unreadNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/customer/notifications/${notificationId}/`, { is_read: true });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={notificationBell}
      >
        🔔
        {notifications.length > 0 && (
          <span style={notificationBadge}>{notifications.length}</span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div style={notificationDropdown}>
          <div style={dropdownHeader}>
            <span style={dropdownTitle}>Notifications</span>
            <button
              onClick={() => setShowNotifications(false)}
              style={closeButton}
            >
              ✕
            </button>
          </div>
          
          <div style={notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={notificationItem}
                onClick={() => markAsRead(notification.id)}
              >
                <div style={notificationMessage}>
                  {notification.message}
                </div>
                <div style={notificationTime}>
                  {formatTime(notification.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay */}
      {showNotifications && (
        <div
          style={overlay}
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
}

/* Styles */
const notificationBell = {
  position: "fixed",
  top: 20,
  right: 20,
  width: 50,
  height: 50,
  borderRadius: "50%",
  border: "none",
  background: ORANGE,
  color: "#fff",
  fontSize: "1.2rem",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(255, 122, 0, 0.3)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative"
};

const notificationBadge = {
  position: "absolute",
  top: -5,
  right: -5,
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#ff3b30",
  color: "#fff",
  fontSize: "0.7rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600
};

const notificationDropdown = {
  position: "fixed",
  top: 80,
  right: 20,
  width: 300,
  maxHeight: 400,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  zIndex: 1001,
  overflow: "hidden"
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.3)",
  zIndex: 999
};

const dropdownHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 20px",
  borderBottom: "1px solid #eee",
  background: "#f8f9fa"
};

const dropdownTitle = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333"
};

const closeButton = {
  border: "none",
  background: "transparent",
  fontSize: "1rem",
  color: "#666",
  cursor: "pointer"
};

const notificationList = {
  maxHeight: 320,
  overflowY: "auto"
};

const notificationItem = {
  padding: "16px 20px",
  borderBottom: "1px solid #f0f0f0",
  cursor: "pointer",
  transition: "background 0.2s ease"
};

const notificationMessage = {
  fontSize: "0.8rem",
  color: "#333",
  marginBottom: 4,
  lineHeight: 1.4
};

const notificationTime = {
  fontSize: "0.7rem",
  color: "#999"
};