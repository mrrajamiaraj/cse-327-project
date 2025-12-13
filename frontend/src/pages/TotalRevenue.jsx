import { useNavigate } from "react-router-dom";
const ORANGE = "#ff7a00";

export default function TotalRevenue() {
  const navigate = useNavigate();

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 720 }}>
        <div style={title}>Total Revenue</div>

        <div style={card}>
          <div style={header}>
            <button onClick={() => navigate(-1)} style={backBtn}>←</button>
            <div style={{ fontWeight: 800 }}>Total Revenue</div>
            <div style={{ width: 30 }} />
          </div>

          <div style={{ padding: 14 }}>
            {/* Simple SVG chart (can replace with real chart later) */}
            <div style={chartBox}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Total Revenue</div>

              <svg viewBox="0 0 700 240" width="100%" height="240">
                <path
                  d="M20 170 C80 80 140 140 200 110 C260 80 320 160 380 90 C440 40 520 170 680 120"
                  fill="none"
                  stroke="#2d6cdf"
                  strokeWidth="4"
                />
                <path
                  d="M20 110 C80 30 140 200 200 80 C260 10 320 180 380 120 C440 40 520 80 680 50"
                  fill="none"
                  stroke="#ff4d4f"
                  strokeWidth="4"
                />
              </svg>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, fontSize: "0.8rem", color: "#777" }}>
                <span style={{ color: "#2d6cdf" }}>● 2021</span>
                <span style={{ color: "#ff4d4f" }}>● 2022</span>
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
const card = { background: "#fff", borderRadius: 28, boxShadow: "0 18px 40px rgba(0,0,0,.12)", minHeight: 520, width: "100%", maxWidth: 740 };
const header = { display: "flex", alignItems: "center", gap: 10, padding: "14px 12px 10px" };
const backBtn = { width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f2f3f7", cursor: "pointer", fontSize: "1rem" };
const chartBox = { background: "#fafbff", borderRadius: 18, padding: 14, border: "1px solid #eef0f7" };
const orangeBtn = { width: "100%", height: 44, borderRadius: 12, border: "none", background: ORANGE, color: "#fff", fontWeight: 800, cursor: "pointer" };
