import { useNavigate } from "react-router-dom";

export default function PersonalInfo() {
  const navigate = useNavigate();

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
        {/* Top blue title */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#1e88e5",
            marginBottom: 10,
          }}
        >
          Personal Profiles
        </div>

        {/* Main white card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 22,
            padding: "14px 14px 20px",
          }}
        >
          {/* Header row: back + title + EDIT */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
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
              Personal Info
            </span>

            <button
              style={{
                border: "none",
                background: "transparent",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#ff7a00",
                cursor: "pointer",
              }}
            >
              EDIT
            </button>
          </div>

          {/* Avatar + name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
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
                  fontSize: "0.95rem",
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

          {/* Info box */}
          <div
            style={{
              background: "#f7f8fb",
              borderRadius: 18,
              padding: "10px 12px",
            }}
          >
            {/* Full name */}
            <InfoRow
              icon="👤"
              label="FULL NAME"
              value="Md. Raja Mia Raj"
            />
            {/* Email */}
            <InfoRow
              icon="✉️"
              label="EMAIL"
              value="raja.raj@northsouth.edu"
            />
            {/* Phone */}
            <InfoRow
              icon="📞"
              label="PHONE NUMBER"
              value="+8801642215402"
              noBorder
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, noBorder }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 4px",
        borderBottom: noBorder ? "none" : "1px solid #e5e7f3",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 12,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
          fontSize: "0.9rem",
        }}
      >
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#999",
            marginBottom: 2,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "0.8rem",
            color: "#444",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
