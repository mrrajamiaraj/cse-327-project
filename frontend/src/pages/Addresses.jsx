import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";

export default function Addresses() {
  const navigate = useNavigate();

  const addresses = [
    {
      id: 1,
      type: "HOME",
      detail: "Bashundhara, Block-C, House-113,\nRoad-05",
      iconBg: "#e7f3ff",
      icon: "🏠",
    },
    {
      id: 2,
      type: "WORK",
      detail: "North South University",
      iconBg: "#f5e7ff",
      icon: "🏢",
    },
  ];

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
          background: "#ffffff",
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          padding: "16px 16px 20px",
        }}
      >
        {/* Grey top label */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#b0b0b0",
            marginBottom: 10,
          }}
        >
          Address
        </div>

        {/* Header row inside white card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "#f2f3f7",
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
            My Address
          </span>
        </div>

        {/* Address cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{
                background: "#f5f7fb",
                borderRadius: 14,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Left: icon + text */}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 12,
                    background: addr.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                  }}
                >
                  {addr.icon}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "0.8rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      marginBottom: 2,
                      color: "#444",
                    }}
                  >
                    {addr.type}
                  </span>
                  <span
                    style={{
                      whiteSpace: "pre-line",
                      color: "#888",
                      fontSize: "0.75rem",
                    }}
                  >
                    {addr.detail}
                  </span>
                </div>
              </div>

              {/* Right: edit / delete icons */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  fontSize: "0.9rem",
                }}
              >
                <button
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: ORANGE,
                    fontSize: "0.9rem",
                  }}
                >
                  ✎
                </button>
                <button
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#e53935",
                    fontSize: "0.95rem",
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Address button */}
        <button
        onClick={() => navigate("/add-address")}
        style={{
        marginTop: 30,
        width: "100%",
        padding: "11px 0",
        borderRadius: 10,
        border: "none",
        background: ORANGE,
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: "0.9rem",
      }}
>
  ADD NEW ADDRESS
</button>

      </div>
    </div>
  );
}
