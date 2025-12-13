import { useNavigate } from "react-router-dom";
const ORANGE = "#ff7a00";

export default function CustomerMap() {
  const navigate = useNavigate();

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={title}>Customer Map</div>

        <div style={card}>
          <div style={header}>
            <button onClick={() => navigate(-1)} style={backBtn}>←</button>
            <div style={{ fontWeight: 800 }}>Customer Map</div>
            <div style={{ width: 30 }} />
          </div>

          <div style={{ padding: 14 }}>
            <div style={box}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800 }}>Customer Map</div>
                <select style={select}>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              {/* bars */}
              <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 16, paddingTop: 12 }}>
                {[
                  { v: 60, c: "#ff4d4f" },
                  { v: 85, c: "#f2b800" },
                  { v: 40, c: "#ff4d4f" },
                  { v: 70, c: "#f2b800" },
                  { v: 60, c: "#ff4d4f" },
                  { v: 25, c: "#f2b800" },
                  { v: 60, c: "#ff4d4f" },
                ].map((b, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ height: b.v * 2, background: b.c, borderRadius: 8 }} />
                    <div style={{ fontSize: "0.7rem", color: "#9a9a9a", marginTop: 8 }}>Sun</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: "0 14px 14px" }}>
            <button style={orangeBtn} onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const wrap = { width: "100vw", minHeight: "100vh", background: "#f3f3f3", display: "flex", justifyContent: "center", padding: "18px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' };
const title = { fontSize: "0.8rem", color: "#bbb", marginBottom: 6 };
const card = { background: "#fff", borderRadius: 28, boxShadow: "0 18px 40px rgba(0,0,0,.12)", minHeight: 520, width: "100%", maxWidth: 540 };
const header = { display: "flex", alignItems: "center", gap: 10, padding: "14px 12px 10px" };
const backBtn = { width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f2f3f7", cursor: "pointer", fontSize: "1rem" };
const box = { background: "#fafbff", borderRadius: 18, padding: 14, border: "1px solid #eef0f7" };
const select = { borderRadius: 10, padding: "6px 10px", border: "1px solid #e6e9f4", background: "#fff" };
const orangeBtn = { width: "100%", height: 44, borderRadius: 12, border: "none", background: ORANGE, color: "#fff", fontWeight: 800, cursor: "pointer" };
