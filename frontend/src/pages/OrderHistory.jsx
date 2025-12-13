import { useNavigate } from "react-router-dom";
const ORANGE = "#ff7a00";

const orders = [
  { id: 1201, name: "Chicken Biryani", price: 240, date: "20/12/2020", status: "Delivered" },
  { id: 1202, name: "Chicken Bhuna", price: 120, date: "20/12/2020", status: "Delivered" },
  { id: 1203, name: "Kacchi Biryani", price: 300, date: "19/12/2020", status: "Cancelled" },
];

export default function OrderHistory() {
  const navigate = useNavigate();

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={title}>Number of Orders</div>

        <div style={card}>
          <div style={header}>
            <button onClick={() => navigate(-1)} style={backBtn}>←</button>
            <div style={{ fontWeight: 800, fontSize: "0.85rem" }}>Previous Orders</div>
            <div style={{ width: 30 }} />
          </div>

          <div style={{ padding: "6px 8px 72px" }}>
            {orders.map((o) => (
              <div key={o.id} style={orderRow}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#9a9a9a" }}>ID: {o.id}</div>
                  <div style={{ fontWeight: 800, fontSize: "0.8rem" }}>{o.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#9a9a9a" }}>{o.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800 }}>৳{o.price}</div>
                  <div style={o.status === "Delivered" ? ok : cancel}>{o.status}</div>
                </div>
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

const orderRow = { background: "#f7f8fc", borderRadius: 14, padding: "12px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
const ok = { marginTop: 6, fontSize: "0.68rem", fontWeight: 800, color: ORANGE };
const cancel = { marginTop: 6, fontSize: "0.68rem", fontWeight: 800, color: "#ff4d4f" };
