export default function Search() {
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 32,
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          padding: "20px 18px 24px",
        }}
      >
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 12 }}>
          Search
        </h2>

        {/* Search input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f5f5f7",
            padding: "8px 10px",
            borderRadius: 16,
            marginBottom: 18,
          }}
        >
          <span role="img" aria-label="search">
            🔍
          </span>
          <input
            placeholder="Search burger, pizza, salad..."
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.9rem",
            }}
          />
        </div>

        {/* Recent keywords */}
        <section style={{ marginBottom: 18 }}>
          <h3 style={{ fontSize: "0.9rem", marginBottom: 6 }}>Recent Keywords</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Burger", "Sandwich", "Pizza", "Noodles"].map((tag) => (
              <span
                key={tag}
                style={{
                  padding: "4px 10px",
                  background: "#f5f5f7",
                  borderRadius: 20,
                  fontSize: "0.8rem",
                  color: "#555",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Suggested restaurants */}
        <section>
          <h3 style={{ fontSize: "0.9rem", marginBottom: 6 }}>
            Suggested Restaurants
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#777" }}>
            Later you will fetch suggestions from backend here.
          </p>
        </section>
      </div>
    </div>
  );
}
