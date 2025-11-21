import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";
const DARK = "#0c1022";

const SCREEN_WRAPPER = {
  width: "100vw",
  height: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};


const CARD_CONTAINER = {
  width: "100%",
  maxWidth: 360,
  minHeight: 600,
  background: "#ffffff",
  borderRadius: 30,
  boxShadow: "0 16px 40px rgba(0,0,0,0.08)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 12,
  border: "none",
  background: "#f5f7fb",
  fontSize: "0.85rem",
  outline: "none",
};

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/location");
  };

  return (
    <div style={SCREEN_WRAPPER}>
      <div style={CARD_CONTAINER}>
        {/* Top dark header */}
        <div
          style={{
            background: DARK,
            color: "#fff",
            padding: "18px 20px 24px",
            position: "relative",
          }}
        >
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              left: 16,
              top: 18,
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            ‹
          </button>

          <h2
            style={{
              textAlign: "center",
              fontSize: "1.3rem",
              marginBottom: 4,
            }}
          >
            Log In
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Please sign in to your existing account
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px 22px", flex: 1 }}>
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#999",
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#999",
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="••••••••••"
                required
                style={inputStyle}
              />
            </div>

            {/* Remember / forgot */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.8rem",
                marginTop: 4,
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" style={{ accentColor: ORANGE }} />
                <span style={{ color: "#777" }}>Remember me</span>
              </label>
              <button
                type="button"
                style={{
                  border: "none",
                  background: "transparent",
                  color: ORANGE,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Forgot Password
              </button>
            </div>

            {/* Log in button */}
            <button
              type="submit"
              style={{
                marginTop: 10,
                width: "100%",
                padding: "12px",
                borderRadius: 999,
                border: "none",
                background: ORANGE,
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              LOG IN
            </button>
          </form>

          {/* Sign up link */}
          <p
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: "0.8rem",
              color: "#777",
            }}
          >
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{
                border: "none",
                background: "transparent",
                color: ORANGE,
                cursor: "pointer",
                padding: 0,
                fontWeight: 600,
              }}
            >
              SIGN UP
            </button>
          </p>

          {/* Social icons row */}
          <div
            style={{
              marginTop: 10,
              textAlign: "center",
              fontSize: "0.8rem",
              color: "#aaa",
            }}
          >
            Or
          </div>
          <div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginBottom: 4,
            }}
          >
            {["f", "t", "★"].map((label) => (
              <div
                key={label}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid #ddd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#555",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
