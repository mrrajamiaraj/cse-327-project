const ORANGE = "#ff7a00";

const burgers = [
  { id: 1, name: "Burger House", price: 320, rating: 4.6 },
  { id: 2, name: "Standard Burger", price: 280, rating: 4.4 },
  { id: 3, name: "Cheese Burger", price: 300, rating: 4.7 },
];

export default function Burgers() {
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
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 12, color: "#222" }}>
          Popular Burgers
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {burgers.map((b) => (
            <div
              key={b.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 16,
                background: "#f8f8f9",
              }}
            >
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#222" }}>
                  {b.name}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#777" }}>
                  ⭐ {b.rating}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 600, color: "#222" }}>৳ {b.price}</div>
                <button
                  style={{
                    marginTop: 4,
                    padding: "4px 10px",
                    borderRadius: 20,
                    border: "none",
                    background: ORANGE,
                    color: "#fff",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
