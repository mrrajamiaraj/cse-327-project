import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Sprint-1: pretend account created → go to location
    navigate("/location");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "8px" }}>Sign Up</h2>
        <p style={{ fontSize: "0.9rem", marginBottom: "16px", color: "#555" }}>
          Create a new account to start ordering.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <div>
            <label style={{ fontSize: "0.85rem" }}>Full Name</label>
            <input
              type="text"
              required
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem" }}>Email</label>
            <input
              type="email"
              required
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem" }}>Password</label>
            <input
              type="password"
              required
              style={{
                width: "100%",
                padding: "8px 10px",
                marginTop: "4px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "8px",
              padding: "10px",
              borderRadius: "999px",
              border: "none",
              background: "#222",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Create Account
          </button>
        </form>

        <p style={{ marginTop: "12px", fontSize: "0.85rem" }}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            style={{
              border: "none",
              background: "none",
              color: "#0077ff",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
