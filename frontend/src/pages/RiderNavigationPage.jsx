import { useParams, useNavigate } from "react-router-dom";
import RiderNavigation from "../components/RiderNavigation";

const ORANGE = "#ff7a00";

export default function RiderNavigationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={pageWrap}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Header */}
        <div style={headerRow}>
          <button onClick={() => navigate(-1)} style={backButton}>
            ←
          </button>
          <div style={headerTitle}>Navigation</div>
          <div style={{ width: 32 }}></div> {/* Spacer */}
        </div>

        {/* Navigation Component */}
        <RiderNavigation orderId={orderId} />
      </div>
    </div>
  );
}

/* Styles */
const pageWrap = {
  width: "100vw",
  minHeight: "100vh",
  background: "#f3f3f3",
  display: "flex",
  justifyContent: "center",
  padding: "18px 0",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
};

const headerRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 16,
  padding: "0 6px"
};

const backButton = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "#fff",
  color: "#333",
  fontSize: "1.2rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const headerTitle = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "#333"
};