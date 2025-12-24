// src/pages/AdminUsers.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, filter, searchTerm]);

  const fetchUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'admin') {
        navigate("/login");
        return;
      }

      const response = await api.get('/admin/users/');
      setUsers(response.data.results || response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (filter !== "all") {
      filtered = filtered.filter(user => user.role === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/`, {
        is_active: !currentStatus
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const getRoleIcon = (role) => {
    const icons = {
      customer: '👤',
      restaurant: '🏪',
      rider: '🚴',
      admin: '👑'
    };
    return icons[role] || '👤';
  };

  const getRoleColor = (role) => {
    const colors = {
      customer: '#007bff',
      restaurant: '#28a745',
      rider: ORANGE,
      admin: '#dc3545'
    };
    return colors[role] || '#666';
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
          <div>Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 1200 }}>
        <div style={headerSection}>
          <button onClick={() => navigate("/admin-dashboard")} style={backButton}>
            ← Back to Dashboard
          </button>
          <div style={pageTitle}>User Management</div>
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
                All ({users.length})
              </button>
              <button
                onClick={() => setFilter("customer")}
                style={{
                  ...filterTab,
                  background: filter === "customer" ? ORANGE : "transparent",
                  color: filter === "customer" ? "#fff" : "#666"
                }}
              >
                👤 Customers ({users.filter(u => u.role === 'customer').length})
              </button>
              <button
                onClick={() => setFilter("restaurant")}
                style={{
                  ...filterTab,
                  background: filter === "restaurant" ? ORANGE : "transparent",
                  color: filter === "restaurant" ? "#fff" : "#666"
                }}
              >
                🏪 Restaurants ({users.filter(u => u.role === 'restaurant').length})
              </button>
              <button
                onClick={() => setFilter("rider")}
                style={{
                  ...filterTab,
                  background: filter === "rider" ? ORANGE : "transparent",
                  color: filter === "rider" ? "#fff" : "#666"
                }}
              >
                🚴 Riders ({users.filter(u => u.role === 'rider').length})
              </button>
            </div>

            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchInput}
            />
          </div>

          {/* Users Table */}
          <div style={tableContainer}>
            <table style={table}>
              <thead>
                <tr style={tableHeader}>
                  <th style={tableHeaderCell}>User</th>
                  <th style={tableHeaderCell}>Role</th>
                  <th style={tableHeaderCell}>Status</th>
                  <th style={tableHeaderCell}>Joined</th>
                  <th style={tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={tableRow}>
                    <td style={tableCell}>
                      <div style={userInfo}>
                        <div style={userAvatar}>
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" style={avatarImage} />
                          ) : (
                            <div style={avatarPlaceholder}>
                              {getRoleIcon(user.role)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={userName}>
                            {`${user.first_name} ${user.last_name}`.trim() || "No Name"}
                          </div>
                          <div style={userEmail}>{user.email}</div>
                          {user.phone && (
                            <div style={userPhone}>📞 {user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={tableCell}>
                      <div
                        style={{
                          ...roleBadge,
                          background: getRoleColor(user.role),
                        }}
                      >
                        {getRoleIcon(user.role)} {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </td>
                    <td style={tableCell}>
                      <div
                        style={{
                          ...statusBadge,
                          background: user.is_active ? "#28a745" : "#dc3545",
                        }}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </div>
                      {user.role === 'rider' && (
                        <div style={onlineStatus}>
                          {user.is_online ? "🟢 Online" : "⚫ Offline"}
                        </div>
                      )}
                    </td>
                    <td style={tableCell}>
                      {formatDate(user.date_joined)}
                    </td>
                    <td style={tableCell}>
                      <div style={actionButtons}>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          style={{
                            ...actionButton,
                            background: user.is_active ? "#dc3545" : "#28a745"
                          }}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          style={{ ...actionButton, background: "#007bff" }}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div style={emptyState}>
                <div style={{ fontSize: "2rem", marginBottom: 16 }}>👥</div>
                <div>No users found</div>
                {searchTerm && (
                  <div style={{ fontSize: "0.9rem", color: "#666", marginTop: 8 }}>
                    Try adjusting your search or filters
                  </div>
                )}
              </div>
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

const tableContainer = {
  overflowX: "auto"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const tableHeader = {
  background: "#f8f9fa"
};

const tableHeaderCell = {
  padding: "15px 12px",
  textAlign: "left",
  fontWeight: 600,
  color: "#333",
  borderBottom: "2px solid #dee2e6"
};

const tableRow = {
  borderBottom: "1px solid #dee2e6"
};

const tableCell = {
  padding: "15px 12px",
  verticalAlign: "top"
};

const userInfo = {
  display: "flex",
  alignItems: "center",
  gap: 12
};

const userAvatar = {
  width: 40,
  height: 40,
  borderRadius: "50%",
  overflow: "hidden"
};

const avatarImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover"
};

const avatarPlaceholder = {
  width: "100%",
  height: "100%",
  background: "#e9ecef",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.2rem"
};

const userName = {
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#333",
  marginBottom: 2
};

const userEmail = {
  fontSize: "0.8rem",
  color: "#666",
  marginBottom: 2
};

const userPhone = {
  fontSize: "0.75rem",
  color: "#999"
};

const roleBadge = {
  padding: "4px 8px",
  borderRadius: 12,
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#fff",
  display: "inline-block"
};

const statusBadge = {
  padding: "4px 8px",
  borderRadius: 12,
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#fff",
  display: "inline-block",
  marginBottom: 4
};

const onlineStatus = {
  fontSize: "0.7rem",
  color: "#666"
};

const actionButtons = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap"
};

const actionButton = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "none",
  color: "#fff",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer"
};

const emptyState = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#666"
};