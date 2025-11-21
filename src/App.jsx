import { Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Home page is working ✅</h1>
      <p>If you see this, React Router is OK.</p>
      <nav style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
    </div>
  );
}

function About() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>About page</h1>
      <p>Routing between pages is also working.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
