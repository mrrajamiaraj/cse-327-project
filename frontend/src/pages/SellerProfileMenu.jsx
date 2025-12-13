import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";

export default function SellerProfileMenu() {
  const navigate = useNavigate();

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={pageTitle}>Menu</div>

        <div style={phoneCard}>
          {/* orange header */}
          <div style={orangeCard}>
            <button onClick={() => navigate(-1)} style={backBtn} type="button">
              ←
            </button>

            <div style={{ textAlign: "center", color: "#fff" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700 }}>My Profile</div>
              <div style={{ fontSize: "0.65rem", opacity: 0.9, marginTop: 10 }}>
                Available Balance
              </div>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, marginTop: 4 }}>
                ৳50000.00
              </div>

              <button style={withdrawBtn} type="button">
                Withdraw
              </button>
            </div>

            <div style={{ width: 28 }} />
          </div>

          {/* menu list */}
          <div style={{ padding: "14px 12px" }}>
            <MenuItem icon="👤" label="Personal Info" onClick={() => navigate("/personal-info")} />
            <MenuItem icon="⚙️" label="Settings" onClick={() => navigate("/settings")} />
            <MenuItem icon="📄" label="Withdrawal History" onClick={() => navigate("/withdraw-history")} />
            <MenuItem icon="🧾" label="Number of Orders" rightText="29K" />
            <MenuItem icon="⭐" label="User Reviews" onClick={() => navigate("/seller-reviews")} />
            <MenuItem icon="⤵️" label="Log Out" />
          </div>

          {/* bottom nav */}
          <SellerBottomNav active="user" />
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, rightText, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        width: "100%",
        border: "none",
        background: "#f7f8fc",
        borderRadius: 14,
        padding: "12px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.95rem",
          }}
        >
          {icon}
        </div>
        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#444" }}>
          {label}
        </div>
      </div>

      {rightText ? (
        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9a9a9a" }}>{rightText}</div>
      ) : (
        <div style={{ color: "#c0c0c0", fontSize: "1rem" }}>›</div>
      )}
    </button>
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
  padding: "12px 12px 70px",
  minHeight: 690,
  position: "relative",
  overflow: "hidden",
};

const orangeCard = {
  background: ORANGE,
  borderRadius: 16,
  padding: "12px 10px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const backBtn = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.25)",
  color: "#fff",
  cursor: "pointer",
  fontSize: "1rem",
};

const withdrawBtn = {
  marginTop: 10,
  border: "1px solid rgba(255,255,255,0.8)",
  background: "transparent",
  color: "#fff",
  padding: "6px 16px",
  borderRadius: 12,
  fontSize: "0.7rem",
  fontWeight: 800,
  cursor: "pointer",
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
