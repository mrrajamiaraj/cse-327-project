import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ORANGE = "#ff7a00";

export default function SellerProfile() {
  const navigate = useNavigate();
  const [showWithdrawSuccess, setShowWithdrawSuccess] = useState(false);

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={pageTitle}>Menu</div>

        <div style={phoneCard}>
          {/* Top orange card */}
          <div style={topCard}>
            <button style={backCircle} onClick={() => navigate(-1)}>
              ←
            </button>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>
                My Profile
              </div>
              <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.7rem", marginTop: 6 }}>
                Available Balance
              </div>
              <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, marginTop: 6 }}>
                ৳50000.00
              </div>

              <button
                style={withdrawBtn}
                onClick={() => setShowWithdrawSuccess(true)}
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Menu list */}
          <div style={{ padding: "12px 10px 74px" }}>
            <MenuItem icon="👤" label="Personal Info" onClick={() => navigate("/personal-info")} />
            {/* Settings replaced by Total Revenue */}
            <MenuItem icon="📈" label="Total Revenue" onClick={() => navigate("/total-revenue")} />
            <MenuItem icon="🧾" label="Withdrawal History" onClick={() => navigate("/withdraw-history")} />
            <MenuItem icon="📦" label="Number of Orders" right="29K" onClick={() => navigate("/order-history")} />
            <MenuItem icon="⭐" label="User Reviews" onClick={() => navigate("/seller-reviews")} />
            <MenuItem icon="🗺️" label="Customer Map" onClick={() => navigate("/customer-map")} />
            <MenuItem icon="🚪" label="Log Out" onClick={() => navigate("/login")} />
          </div>

          {/* Bottom nav (same style) */}
          <BottomNav
            onBox={() => navigate("/my-food")}
            onList={() => navigate("/running-orders")}
            onPlus={() => navigate("/add-new-items")}
            onBell={() => navigate("/seller-notifications")}
            onProfile={() => navigate("/seller-profile")}
          />

          {/* Withdraw success popup */}
          {showWithdrawSuccess && (
            <div style={overlay}>
              <div style={modalCard}>
                <div style={modalTitle}>Payment Withdraw Successful</div>
                <div style={checkWrap}>
                  <div style={checkCircle}>✓</div>
                  <div style={{ marginTop: 14, fontWeight: 800, color: "#444" }}>
                    Withdraw Successful
                  </div>
                </div>

                <button
                  style={okBtn}
                  onClick={() => setShowWithdrawSuccess(false)}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function MenuItem({ icon, label, right, onClick }) {
  return (
    <button onClick={onClick} style={menuItem}>
      <div style={menuLeft}>
        <div style={menuIcon}>{icon}</div>
        <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#333" }}>
          {label}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {right && (
          <div style={{ fontSize: "0.75rem", color: "#999", fontWeight: 700 }}>
            {right}
          </div>
        )}
        <div style={{ color: "#bdbdbd", fontSize: "1rem" }}>›</div>
      </div>
    </button>
  );
}

function BottomNav({ onBox, onList, onPlus, onBell, onProfile }) {
  return (
    <div style={bottomNav}>
      <button style={navBtn} onClick={onBox} type="button">▦</button>
      <button style={navBtn} onClick={onList} type="button">≡</button>

      <button style={plusBtn} onClick={onPlus} type="button">+</button>

      <button style={navBtn} onClick={onBell} type="button">🔔</button>
      <button style={{ ...navBtn, color: ORANGE }} onClick={onProfile} type="button">👤</button>
    </div>
  );
}

/* ---------- Styles ---------- */

const pageWrap = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  padding: "18px 0",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const pageTitle = { fontSize: "0.8rem", color: "#bbb", marginBottom: 6 };

const phoneCard = {
  background: "#fff",
  borderRadius: 30,
  boxShadow: "0 18px 40px rgba(0,0,0,.12)",
  position: "relative",
  overflow: "hidden",
  minHeight: 740,
};

const topCard = {
  margin: 14,
  borderRadius: 20,
  background: ORANGE,
  padding: "16px 14px 18px",
  position: "relative",
};

const backCircle = {
  position: "absolute",
  left: 12,
  top: 12,
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.25)",
  color: "#fff",
  cursor: "pointer",
  fontSize: "1rem",
};

const withdrawBtn = {
  marginTop: 12,
  padding: "8px 22px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.9)",
  background: "transparent",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "0.75rem",
};

const menuItem = {
  width: "100%",
  border: "none",
  background: "#f7f8fc",
  borderRadius: 14,
  padding: "12px 12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  marginBottom: 10,
};

const menuLeft = { display: "flex", alignItems: "center", gap: 10 };
const menuIcon = {
  width: 34,
  height: 34,
  borderRadius: 12,
  background: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1rem",
};

const bottomNav = {
  position: "absolute",
  left: 18,
  right: 18,
  bottom: 12,
  height: 54,
  borderRadius: 26,
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,.14)",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
};

const navBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1.1rem",
  color: "#9a9a9a",
};

const plusBtn = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  border: `2px solid ${ORANGE}`,
  background: "#fff",
  fontSize: "1.4rem",
  color: ORANGE,
  cursor: "pointer",
  marginTop: -22,
  boxShadow: "0 6px 14px rgba(255,122,0,0.35)",
};

/* Popup styles */
const overlay = {
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modalCard = {
  width: "100%",
  maxWidth: 300,
  borderRadius: 20,
  background: "#fff",
  boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  padding: "16px 16px 18px",
  textAlign: "center",
};

const modalTitle = { fontSize: "0.75rem", color: "#bbb", marginBottom: 10 };

const checkWrap = { padding: "10px 0 14px" };

const checkCircle = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: ORANGE,
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.6rem",
  fontWeight: 900,
};

const okBtn = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "none",
  background: ORANGE,
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};
