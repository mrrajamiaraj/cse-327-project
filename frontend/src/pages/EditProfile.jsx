import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ORANGE = "#ff7a00";

export default function EditProfile() {
  const navigate = useNavigate();

  // demo values – later you can load from backend/context
  const [fullName, setFullName] = useState("Vishal Khadok");
  const [email, setEmail] = useState("hello@halallab.co");
  const [phone, setPhone] = useState("408-841-0926");
  const [bio, setBio] = useState("I love fast food");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send to backend here
    console.log({ fullName, email, phone, bio });
    navigate(-1); // go back to PersonalInfo after saving
  };

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
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "#f2f3f7",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ←
          </button>
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#555",
            }}
          >
            Edit Profile
          </span>
        </div>

        {/* Avatar circle + pencil */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "#ffcfb3", // peach circle like Figma
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: 2,
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: ORANGE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "0.9rem",
                border: "2px solid #ffffff",
              }}
            >
              ✎
            </div>
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit}>
          <FieldLabel label="FULL NAME" />
          <InputBox
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <FieldLabel label="EMAIL" />
          <InputBox
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FieldLabel label="PHONE NUMBER" />
          <InputBox
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <FieldLabel label="BIO" />
          <TextAreaBox
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          {/* SAVE button (full width, orange) */}
          <button
            type="submit"
            style={{
              marginTop: 20,
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
            SAVE
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
        marginBottom: 4,
        outline: "none",
      }}
    />
  );
}

function TextAreaBox(props) {
  return (
    <textarea
      {...props}
      rows={3}
      style={{
        width: "100%",
        padding: "9px 11px",
        borderRadius: 8,
        border: "none",
        background: "#f4f6fb",
        fontSize: "0.8rem",
        resize: "none",
        outline: "none",
      }}
    />
  );
}
