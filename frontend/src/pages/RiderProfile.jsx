// src/pages/RiderProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function RiderProfile() {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: null,
    is_online: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    totalTrips: 0,
    averageRating: 0,
    totalEarnings: 0,
    completionRate: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'rider') {
        navigate("/login");
        return;
      }

      const response = await api.get('/rider/profile/');
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/rider/earnings/');
      setStats({
        totalTrips: response.data.total_trips || 0,
        averageRating: response.data.average_rating || 0,
        totalEarnings: response.data.total_earnings || 0,
        completionRate: 98.5 // Mock completion rate
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('first_name', profile.first_name);
      formData.append('last_name', profile.last_name);
      formData.append('phone', profile.phone);
      formData.append('bio', profile.bio);
      
      if (profile.avatar && typeof profile.avatar !== 'string') {
        formData.append('avatar', profile.avatar);
      }

      await api.put('/rider/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({ ...prev, avatar: file }));
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !profile.is_online;
      await api.post('/rider/availability/', { is_online: newStatus });
      setProfile(prev => ({ ...prev, is_online: newStatus }));
    } catch (error) {
      console.error("Error toggling online status:", error);
    }
  };

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Rider Profile</div>

        <div style={phoneCard}>
          {/* Header */}
          <div style={headerRow}>
            <button onClick={() => navigate(-1)} style={backButton}>
              ←
            </button>
            <div style={headerTitle}>My Profile</div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{ ...backButton, background: isEditing ? ORANGE : "#f2f3f7", color: isEditing ? "#fff" : "#333" }}
            >
              {isEditing ? "✓" : "✏️"}
            </button>
          </div>

          {/* Profile Header */}
          <div style={profileHeader}>
            <div style={avatarSection}>
              <div style={avatarContainer}>
                {profile.avatar ? (
                  <img
                    src={typeof profile.avatar === 'string' ? profile.avatar : URL.createObjectURL(profile.avatar)}
                    alt="Avatar"
                    style={avatarImage}
                  />
                ) : (
                  <div style={avatarPlaceholder}>🚴</div>
                )}
                {isEditing && (
                  <label style={avatarEditButton}>
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                    />
                  </label>
                )}
              </div>
              
              {/* Online Status Toggle */}
              <button
                onClick={toggleOnlineStatus}
                style={{
                  ...onlineToggle,
                  background: profile.is_online ? ORANGE : "#e0e0e0",
                  color: profile.is_online ? "#fff" : "#666"
                }}
              >
                {profile.is_online ? "🟢 ONLINE" : "⚫ OFFLINE"}
              </button>
            </div>

            <div style={profileInfo}>
              {isEditing ? (
                <div style={editForm}>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={profile.first_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                    style={inputField}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={profile.last_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                    style={inputField}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    style={inputField}
                  />
                  <textarea
                    placeholder="Bio (optional)"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    style={{ ...inputField, height: 60, resize: "none" }}
                  />
                  <button onClick={handleSave} style={saveButton}>
                    Save Changes
                  </button>
                </div>
              ) : (
                <div>
                  <div style={profileName}>
                    {`${profile.first_name} ${profile.last_name}`.trim() || "Rider"}
                  </div>
                  <div style={profileEmail}>{profile.email}</div>
                  {profile.phone && (
                    <div style={profilePhone}>📞 {profile.phone}</div>
                  )}
                  {profile.bio && (
                    <div style={profileBio}>{profile.bio}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div style={statsGrid}>
            <div style={statCard}>
              <div style={statValue}>{stats.totalTrips}</div>
              <div style={statLabel}>Total Trips</div>
            </div>
            <div style={statCard}>
              <div style={statValue}>⭐ {stats.averageRating.toFixed(1)}</div>
              <div style={statLabel}>Rating</div>
            </div>
            <div style={statCard}>
              <div style={statValue}>৳{stats.totalEarnings}</div>
              <div style={statLabel}>Total Earned</div>
            </div>
            <div style={statCard}>
              <div style={statValue}>{stats.completionRate}%</div>
              <div style={statLabel}>Completion</div>
            </div>
          </div>

          {/* Menu Options */}
          <div style={menuSection}>
            <div style={sectionTitle}>Account Settings</div>
            
            <button style={menuItem} onClick={() => navigate("/rider-earnings")}>
              <span style={menuIcon}>💰</span>
              <span style={menuText}>Earnings & Payments</span>
              <span style={menuArrow}>→</span>
            </button>
            
            <button style={menuItem} onClick={() => navigate("/rider-orders")}>
              <span style={menuIcon}>📦</span>
              <span style={menuText}>Order History</span>
              <span style={menuArrow}>→</span>
            </button>
            
            <button style={menuItem}>
              <span style={menuIcon}>🔔</span>
              <span style={menuText}>Notification Settings</span>
              <span style={menuArrow}>→</span>
            </button>
            
            <button style={menuItem}>
              <span style={menuIcon}>❓</span>
              <span style={menuText}>Help & Support</span>
              <span style={menuArrow}>→</span>
            </button>
            
            <button style={menuItem}>
              <span style={menuIcon}>📋</span>
              <span style={menuText}>Terms & Conditions</span>
              <span style={menuArrow}>→</span>
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            style={logoutButton}
          >
            🚪 Logout
          </button>

          <RiderBottomNav active="profile" />
        </div>
      </div>
    </div>
  );
}

function RiderBottomNav({ active }) {
  const navigate = useNavigate();
  return (
    <div style={bottomNav}>
      <button style={navBtn(active === "home")} onClick={() => navigate("/rider-dashboard")}>
        🏠
      </button>
      <button style={navBtn(active === "orders")} onClick={() => navigate("/rider-orders")}>
        📦
      </button>
      <button style={navBtn(active === "earnings")} onClick={() => navigate("/rider-earnings")}>
        💰
      </button>
      <button style={navBtn(active === "profile")} onClick={() => navigate("/rider-profile")}>
        👤
      </button>
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
  padding: "14px 12px 70px",
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

const profileHeader = {
  background: "#f8f9fa",
  borderRadius: 16,
  padding: 20,
  marginBottom: 20,
  textAlign: "center"
};

const avatarSection = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  marginBottom: 16
};

const avatarContainer = {
  position: "relative",
  width: 80,
  height: 80
};

const avatarImage = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover"
};

const avatarPlaceholder = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  background: "#e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "2rem"
};

const avatarEditButton = {
  position: "absolute",
  bottom: 0,
  right: 0,
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: ORANGE,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
  cursor: "pointer"
};

const onlineToggle = {
  padding: "6px 16px",
  borderRadius: 20,
  border: "none",
  fontSize: "0.7rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease"
};

const profileInfo = {
  textAlign: "center"
};

const profileName = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 4
};

const profileEmail = {
  fontSize: "0.8rem",
  color: "#666",
  marginBottom: 4
};

const profilePhone = {
  fontSize: "0.75rem",
  color: "#666",
  marginBottom: 8
};

const profileBio = {
  fontSize: "0.75rem",
  color: "#888",
  fontStyle: "italic",
  lineHeight: 1.4
};

const editForm = {
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const inputField = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: "0.8rem",
  outline: "none"
};

const saveButton = {
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: ORANGE,
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 20
};

const statCard = {
  background: "#f8f9fa",
  borderRadius: 12,
  padding: 16,
  textAlign: "center"
};

const statValue = {
  fontSize: "1rem",
  fontWeight: 700,
  color: "#333",
  marginBottom: 4
};

const statLabel = {
  fontSize: "0.7rem",
  color: "#666"
};

const menuSection = {
  marginBottom: 20
};

const sectionTitle = {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 12
};

const menuItem = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  padding: "12px 16px",
  background: "#f8f9fa",
  border: "none",
  borderRadius: 12,
  marginBottom: 8,
  cursor: "pointer",
  transition: "background 0.2s ease"
};

const menuIcon = {
  fontSize: "1rem",
  marginRight: 12
};

const menuText = {
  flex: 1,
  textAlign: "left",
  fontSize: "0.8rem",
  color: "#333"
};

const menuArrow = {
  fontSize: "0.8rem",
  color: "#999"
};

const logoutButton = {
  width: "100%",
  padding: "12px",
  borderRadius: 12,
  border: "none",
  background: "#dc3545",
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
  marginBottom: 20
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
};

const navBtn = (isActive) => ({
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
  color: isActive ? ORANGE : "#9a9a9a",
});