import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ORANGE = "#ff7a00";

export default function WithdrawHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWithdrawHistory();
  }, []);

  const fetchWithdrawHistory = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in and is a restaurant owner
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id || user.role !== 'restaurant') {
        navigate("/login");
        return;
      }

      const response = await api.get('/restaurant/withdrawals/');
      setHistory(response.data);
      
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      setError("Failed to load withdrawal history");
      
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

  const getMethodDisplay = (method) => {
    const methods = {
      'bank_transfer': 'Bank',
      'mobile_banking': 'Mobile',
      'check': 'Check'
    };
    return methods[method] || method;
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': ORANGE,
      'pending': '#ffa500',
      'processing': '#007bff',
      'rejected': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div style={wrap}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div style={title}>Withdrawal History</div>
          <div style={{...card, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center", color: "#666" }}>
              Loading withdrawal history...
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
          <div style={title}>Withdrawal History</div>
          <div style={{...card, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#ff4444", marginBottom: "10px" }}>{error}</div>
              <button
                onClick={fetchWithdrawHistory}
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
        <div style={title}>Withdrawal History</div>

        <div style={card}>
          <div style={header}>
            <button onClick={() => navigate(-1)} style={backBtn}>←</button>
            <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>History</div>
            <div style={{ width: 30 }} />
          </div>

          <div style={{ padding: "6px 8px 72px" }}>
            {history.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
                fontSize: "0.9rem"
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "10px" }}>💳</div>
                No withdrawal history yet
              </div>
            ) : (
              history.map((h) => (
                <div key={h.id} style={row}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.8rem" }}>৳{h.amount}</div>
                    <div style={{ fontSize: "0.7rem", color: "#9a9a9a" }}>
                      {getMethodDisplay(h.payment_method)} · {formatDate(h.requested_at)}
                    </div>
                  </div>
                  <div style={{
                    ...pill,
                    background: h.status === 'completed' ? '#ffe9d6' : '#f0f0f0',
                    color: getStatusColor(h.status)
                  }}>
                    {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                  </div>
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
const row = { background: "#f7f8fc", borderRadius: 14, padding: "12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
const pill = { padding: "6px 10px", borderRadius: 999, background: "#ffe9d6", color: ORANGE, fontWeight: 800, fontSize: "0.68rem" };
