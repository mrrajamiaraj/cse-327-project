import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";

export default function AddAddress() {
  const navigate = useNavigate();

  // simple form state
  const [address, setAddress] = useState("North South University");
  const [street, setStreet] = useState("Aftab Uddin Road");
  const [postCode, setPostCode] = useState("1229");
  const [apartment, setApartment] = useState("N/A");
  const [label, setLabel] = useState("Home");

  // map center (default: NSU)
  const [coords, setCoords] = useState({
    lat: 23.8151,
    lng: 90.4277,
  });

  // ask for location permission once, update map center
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
          // if denied, we just keep the default NSU center
        }
      );
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { address, street, postCode, apartment, label, coords };
    // 👉 later: send `data` to your backend API
    console.log("Saved address:", data);
    navigate("/addresses"); // go back to list
  };

  const mapSrc = `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=17&output=embed`;

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f2f2f2",
        display: "flex",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 32,
          background: "#ffffff",
          boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
          padding: "16px 16px 20px",
        }}
      >
        {/* Grey top label */}
        <div
          style={{
            fontSize: "0.9rem",
            color: "#b0b0b0",
            marginBottom: 10,
          }}
        >
          Add New Address
        </div>

        {/* Map area with back button */}
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 14,
            position: "relative",
            height: 180,
          }}
        >
          {/* Embedded Google Map */}
          <iframe
            title="select-location"
            src={mapSrc}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Back button over map */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              background: "#20252f",
              color: "#fff",
              cursor: "pointer",
              fontSize: "1rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
            }}
          >
            ←
          </button>
        </div>

        {/* Form card (white) */}
        <form onSubmit={handleSave}>
          {/* ADDRESS */}
          <FieldLabel label="ADDRESS" />
          <InputBox value={address} onChange={(e) => setAddress(e.target.value)} />

          {/* STREET + POST CODE in same row */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 6,
            }}
          >
            <div style={{ flex: 2 }}>
              <FieldLabel label="STREET" />
              <InputBox
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel label="POST CODE" />
              <InputBox
                value={postCode}
                onChange={(e) => setPostCode(e.target.value)}
              />
            </div>
          </div>

          {/* APARTMENT */}
          <FieldLabel label="APARTMENT" />
          <InputBox
            value={apartment}
            onChange={(e) => setApartment(e.target.value)}
          />

          {/* LABEL AS buttons */}
          <FieldLabel label="LABEL AS" />
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 4,
              marginBottom: 10,
            }}
          >
            {["Home", "Work", "Other"].map((item) => {
              const active = label === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLabel(item)}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    borderRadius: 18,
                    border: "none",
                    background: active ? ORANGE : "#f4f5fa",
                    color: active ? "#fff" : "#555",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* SAVE LOCATION button */}
          <button
            type="submit"
            style={{
              marginTop: 6,
              width: "100%",
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: ORANGE,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            SAVE LOCATION
          </button>
        </form>
      </div>
    </div>
  );
}

function FieldLabel({ label }) {
  return (
    <div
      style={{
        fontSize: "0.7rem",
        color: "#a0a0a0",
        marginBottom: 4,
        marginTop: 6,
      }}
    >
      {label}
    </div>
  );
}

function InputBox(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "9px 11px",
        borderRadius: 8,
        border: "none",
        background: "#f4f6fb",
        fontSize: "0.8rem",
        outline: "none",
      }}
    />
  );
}
