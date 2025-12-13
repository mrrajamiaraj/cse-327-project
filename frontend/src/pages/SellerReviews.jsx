import { useNavigate } from "react-router-dom";
const ORANGE = "#ff7a00";

const reviews = [
  { id: 1, date: "20/12/2020", name: "Great Food and Service", stars: 5, text: "This food is tasty & delicious. So good delivered in my place." },
  { id: 2, date: "20/12/2020", name: "Awesome and Nice", stars: 4, text: "Breakfast so fast delivered in my place." },
  { id: 3, date: "20/12/2020", name: "Awesome and Nice", stars: 4, text: "This Food so tasty & delicious." },
];

export default function SellerReviews() {
  const navigate = useNavigate();

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={title}>Review Screen</div>

        <div style={card}>
          <div style={header}>
            <button onClick={() => navigate(-1)} style={backBtn}>←</button>
            <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>Reviews</div>
            <div style={{ width: 30 }} />
          </div>

          <div style={{ padding: "6px 8px 18px" }}>
            {reviews.map((r) => (
              <div key={r.id} style={reviewRow}>
                <div style={avatar} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.65rem", color: "#9a9a9a" }}>{r.date}</div>
                  <div style={{ fontWeight: 800, fontSize: "0.8rem", marginTop: 2 }}>{r.name}</div>
                  <div style={{ marginTop: 4, fontSize: "0.72rem", color: ORANGE }}>
                    {"★".repeat(r.stars)}{" "}
                    <span style={{ color: "#ddd" }}>{"★".repeat(5 - r.stars)}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: "0.72rem", color: "#777", lineHeight: 1.3 }}>
                    {r.text}
                  </div>
                </div>
                <button style={dots}>⋯</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const wrap = {
  width: "100vw", minHeight: "100vh", background: "#f3f3f3",
  display: "flex", justifyContent: "center", padding: "18px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};
const title = { fontSize: "0.8rem", color: "#bbb", marginBottom: 6 };
const card = { background: "#fff", borderRadius: 28, boxShadow: "0 18px 40px rgba(0,0,0,.12)", minHeight: 720, position: "relative" };
const header = { display: "flex", alignItems: "center", gap: 10, padding: "14px 12px 10px" };
const backBtn = { width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f2f3f7", cursor: "pointer", fontSize: "1rem" };
const reviewRow = { display: "flex", gap: 10, background: "#f7f8fc", borderRadius: 14, padding: "12px 12px", marginBottom: 10, alignItems: "flex-start" };
const avatar = { width: 34, height: 34, borderRadius: "50%", background: "#dfe3ee", flexShrink: 0 };
const dots = { border: "none", background: "transparent", cursor: "pointer", color: "#999", fontSize: "1.2rem" };
