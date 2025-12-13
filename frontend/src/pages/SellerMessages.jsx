import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";

const messages = [
  { id: 1, name: "Royal Parvej", text: "Sounds awesome!", time: "19:37", badge: 1, avatar: "/src/assets/user-3.png" },
  { id: 2, name: "Salim Khan", text: "Ok, just hurry up little bit..", time: "19:37", badge: 2, avatar: "/src/assets/user-2.png" },
  { id: 3, name: "Md. Moyhuddin", text: "Thanks dude.", time: "19:37", badge: 0, avatar: "/src/assets/user-1.png" },
  { id: 4, name: "Pabel Bhuiyan", text: "How is going...?", time: "19:37", badge: 0, avatar: "/src/assets/user-4.png" },
  { id: 5, name: "Tanbir Ahmed", text: "Thanks for the awesome food man...", time: "19:37", badge: 0, avatar: "/src/assets/user-1.png" },
];

export default function SellerMessages() {
  const navigate = useNavigate();

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
              Messages (3)
            </button>
          </div>

          <div style={tabUnderlineWrapRight}>
            <div style={tabUnderline} />
          </div>

          {/* list */}
          <div style={{ padding: "0 8px" }}>
            {messages.map((m) => (
              <div key={m.id} style={msgRow}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={avatarBox}>
                    <img
                      src={m.avatar}
                      alt={m.name}
                      style={avatarImg}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>

                  <div>
                    <div style={nameText}>{m.name}</div>
                    <div style={msgText}>{m.text}</div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={timeRight}>{m.time}</div>
                  {m.badge > 0 && <div style={badge}>{m.badge}</div>}
                </div>
              </div>
            ))}
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
