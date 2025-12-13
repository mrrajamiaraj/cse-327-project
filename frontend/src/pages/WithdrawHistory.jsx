import { useNavigate } from "react-router-dom";
const ORANGE = "#ff7a00";

const history = [
  { id: 1, date: "20/12/2020", amount: 1200, method: "Bank" },
  { id: 2, date: "18/12/2020", amount: 800, method: "Card" },
  { id: 3, date: "12/12/2020", amount: 500, method: "Bkash" },
];

export default function WithdrawHistory() {
  const navigate = useNavigate();

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={title}>Withdrawal History</div>

        <div style={card}>
          <div style={header}>
            <button onClick={() => navigate(-1)} style={backBtn}>←</button>
            <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>History</div>
            <div style={{ width: 30 }} />
          </div>

          <div style={{ padding: "6px 8px 72px" }}>
            {history.map((h) => (
              <div key={h.id} style={row}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.8rem" }}>৳{h.amount}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9a9a9a" }}>
                    {h.method} · {h.date}
                  </div>
                </div>
                <div style={pill}>Completed</div>
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
const row = { background: "#f7f8fc", borderRadius: 14, padding: "12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
const pill = { padding: "6px 10px", borderRadius: 999, background: "#ffe9d6", color: ORANGE, fontWeight: 800, fontSize: "0.68rem" };
