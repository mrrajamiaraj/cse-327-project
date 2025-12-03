import { useNavigate } from "react-router-dom";

const CARD_BG = "#f7f8fb";
const ORANGE = "#ff7a00";

export default function MenuScreen() {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
  if (item.label === "Personal Info") {
    navigate("/personal-info");
  } else if (item.label === "Addresses") {
    navigate("/addresses");          // 👈 new connection
  }
  // you can add more later, e.g.:
  // else if (item.label === "Cart") navigate("/cart");
};

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f2f2f2",
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 32,
          background: "#f5f5f7",
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          padding: "14px 14px 20px",
        }}
      >
        {/* Top "Menu" label */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#999",
            marginBottom: 10,
          }}
        >
          Menu
        </div>

        {/* Profile Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            padding: "12px 12px 16px",
            marginBottom: 14,
          }}
        >
          {/* Back + title + dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: CARD_BG,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ←
            </button>

            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#555",
              }}
            >
              Profile
            </span>

            <button
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: CARD_BG,
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              ⋯
            </button>
          </div>

          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                overflow: "hidden",
                background:
                  "url(https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400) center/cover",
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  marginBottom: 2,
                }}
              >
                Md. Raja Mia Raj
              </div>
              <div style={{ fontSize: "0.75rem", color: "#999" }}>
                I love fast food
              </div>
            </div>
          </div>
        </div>

        {/* First group: personal info, addresses, cart, etc. */}
        <MenuGroup
          items={[
            { icon: "👤", label: "Personal Info" },
            { icon: "📍", label: "Addresses" },
            { icon: "🛒", label: "Cart" },
            { icon: "💜", label: "Favourite" },
            { icon: "🔔", label: "Notifications" },
            { icon: "💳", label: "Payment Method" },
          ]}
          onItemClick={handleItemClick}
        />

        {/* Second group: faq, reviews, settings */}
        <MenuGroup
          items={[
            { icon: "❓", label: "FAQs" },
            { icon: "⭐", label: "User Reviews" },
            { icon: "⚙️", label: "Settings" },
          ]}
        />

        {/* Logout group */}
        <MenuGroup
          items={[{ icon: "🚪", label: "Log Out", isDestructive: true }]}
        />
      </div>
    </div>
  );
}

function MenuGroup({ items, onItemClick }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 22,
        padding: "6px 10px",
        marginBottom: 12,
      }}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          onClick={() => onItemClick && onItemClick(item)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 4px",
            borderBottom:
              idx === items.length - 1 ? "none" : "1px solid #f0f0f0",
            cursor: onItemClick ? "pointer" : "default",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 12,
                background: "#f3f5ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
              }}
            >
              {item.icon}
            </div>
            <span
              style={{
                fontSize: "0.85rem",
                color: item.isDestructive ? "#e53935" : "#444",
                fontWeight: item.isDestructive ? 600 : 500,
              }}
            >
              {item.label}
            </span>
          </div>

          <span
            style={{
              fontSize: "0.9rem",
              color: "#bbb",
            }}
          >
            &gt;
          </span>
        </div>
      ))}
    </div>
  );
}
