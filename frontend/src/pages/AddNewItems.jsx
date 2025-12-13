import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ORANGE = "#ff7a00";

export default function AddNewItems() {
  const navigate = useNavigate();

  const [itemName, setItemName] = useState("Mix Vegetables");
  const [price, setPrice] = useState("110");

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f3f3f3",
        display: "flex",
        justifyContent: "center",
        padding: "18px 0",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div
          style={{
            fontSize: "0.8rem",
            fontWeight: 500,
            color: "#c0c0c0",
            marginBottom: 8,
            paddingLeft: 6,
          }}
        >
          Add new Items
        </div>

        <div
          style={{
            borderRadius: 28,
            background: "#fff",
            boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
            padding: "14px 12px 16px",
            minHeight: 690,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
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

            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#444" }}>
              Add New Items
            </div>

            <button
              onClick={() => {
                setItemName("");
                setPrice("");
              }}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#ff6b6b",
              }}
            >
              RESET
            </button>
          </div>

          {/* form */}
          <div style={{ padding: "0 6px" }}>
            {/* item name */}
            <Label>ITEM NAME</Label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item name"
              style={inputStyle}
            />

            {/* upload */}
            <Label>UPLOAD PHOTO/VIDEO</Label>

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {/* preview */}
              <div style={previewBox}>
                <img
                  src="/src/assets/add-item-preview.png"
                  alt="preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>

              {/* add boxes */}
              <AddBox />
              <AddBox />
            </div>

            {/* price */}
            <Label>PRICE</Label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#777",
                    fontSize: "0.8rem",
                  }}
                >
                  ৳
                </span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: 24 }}
                />
              </div>

              <div style={{ display: "flex", gap: 14, fontSize: "0.7rem" }}>
                <Check label="Pick up" checked />
                <Check label="Delivery" />
              </div>
            </div>

            {/* ingredients */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Label style={{ marginBottom: 0 }}>INGRIDIENTS</Label>
                <button style={seeAllStyle}>See All ›</button>
              </div>

              <SubTitle>Basic</SubTitle>
              <IngredientRow
                items={[
                  { name: "Salt", emoji: "🧂" },
                  { name: "Chicken", emoji: "🍗" },
                  { name: "Onion", emoji: "🧅" },
                  { name: "Garlic", emoji: "🧄" },
                  { name: "Peppers", emoji: "🌶️" },
                  { name: "Ginger", emoji: "🫚" },
                ]}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 12,
                  marginBottom: 8,
                }}
              >
                <SubTitle style={{ marginBottom: 0 }}>Fruit</SubTitle>
                <button style={seeAllStyle}>See All ›</button>
              </div>

              <IngredientRow
                items={[
                  { name: "Avocado", emoji: "🥑" },
                  { name: "Apple", emoji: "🍎" },
                  { name: "Blueberry", emoji: "🫐" },
                  { name: "Broccoli", emoji: "🥦" },
                  { name: "Orange", emoji: "🍊" },
                  { name: "Walnut", emoji: "🌰" },
                ]}
              />
            </div>

            {/* details */}
            <Label>DETAILS</Label>
            <textarea
              defaultValue={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum in vel, mattis et amet dui."
              }
              style={{
                width: "100%",
                minHeight: 84,
                borderRadius: 12,
                border: "none",
                outline: "none",
                padding: "10px 12px",
                background: "#f6f7fb",
                fontSize: "0.75rem",
                color: "#666",
                resize: "none",
              }}
            />

            {/* save button */}
            <button
              onClick={() => alert("Saved (demo)")}
              style={{
                marginTop: 18,
                width: "100%",
                height: 46,
                borderRadius: 12,
                border: "none",
                background: ORANGE,
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, style }) {
  return (
    <div
      style={{
        fontSize: "0.65rem",
        fontWeight: 800,
        color: "#9a9a9a",
        marginBottom: 6,
        marginTop: 10,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SubTitle({ children, style }) {
  return (
    <div
      style={{
        fontSize: "0.7rem",
        fontWeight: 800,
        color: "#444",
        marginBottom: 8,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function AddBox() {
  return (
    <div
      style={{
        width: 86,
        height: 72,
        borderRadius: 16,
        background: "#f6f7fb",
        border: "1px dashed #cfd4e6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "#8b91a6",
        fontSize: "0.7rem",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e5e7f3",
          marginBottom: 6,
          fontSize: "1rem",
        }}
      >
        ☁️
      </div>
      Add
    </div>
  );
}

function Check({ label, checked }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: "#9a9a9a",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <input type="checkbox" defaultChecked={checked} />
      {label}
    </label>
  );
}

function IngredientRow({ items }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
      {items.map((it) => (
        <div
          key={it.name}
          style={{
            width: 46,
            textAlign: "center",
            fontSize: "0.6rem",
            color: "#777",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              margin: "0 auto",
              borderRadius: "50%",
              background: "#f6f7fb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            {it.emoji}
          </div>
          <div style={{ marginTop: 4 }}>{it.name}</div>
        </div>
      ))}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 36,
  borderRadius: 10,
  border: "none",
  outline: "none",
  padding: "0 12px",
  background: "#f6f7fb",
  fontSize: "0.75rem",
  color: "#444",
};

const previewBox = {
  width: 86,
  height: 72,
  borderRadius: 16,
  overflow: "hidden",
  background: "#f6f7fb",
  flexShrink: 0,
};

const seeAllStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#9a9a9a",
  fontSize: "0.7rem",
};
