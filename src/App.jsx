import { Routes, Route, Link, useLocation } from "react-router-dom";

// Screens
import SplashScreen from "./pages/SplashScreen.jsx";
import FrontScreen from "./pages/FrontScreen.jsx"; // onboarding
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import LocationAccess from "./pages/LocationAccess.jsx";

// Main App Screens
import Home from "./pages/Home.jsx";
import Restaurant from "./pages/Restaurant.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";

export default function App() {
  const location = useLocation();

  // Pages where navbar & footer should NOT appear
  const hideNav = [
    "/",             // splash
    "/onboarding",   // onboarding slides
    "/login",
    "/signup",
    "/location"
  ].includes(location.pathname);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Navbar */}
      {!hideNav && (
        <header
          style={{
            background: "#222",
            color: "#fff",
            padding: "1rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            CSE 327 Restaurant
          </div>

          <nav style={{ display: "flex", gap: "1rem" }}>
            <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>
              Home
            </Link>
            <Link
              to="/restaurant"
              style={{ color: "#fff", textDecoration: "none" }}
            >
              Restaurant
            </Link>
            <Link to="/cart" style={{ color: "#fff", textDecoration: "none" }}>
              Cart
            </Link>
            <Link
              to="/checkout"
              style={{ color: "#fff", textDecoration: "none" }}
            >
              Checkout
            </Link>
          </nav>
        </header>
      )}

      {/* ROUTES */}
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Intro Flow Screens */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<FrontScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/location" element={<LocationAccess />} />

          {/* Main App Screens */}
          <Route path="/home" element={<Home />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>

      {/* Footer */}
      {!hideNav && (
        <footer
          style={{
            padding: "1rem 2rem",
            textAlign: "center",
            fontSize: "0.85rem",
            color: "#555",
            borderTop: "1px solid #ddd",
          }}
        >
          Sprint 1 · CSE 327 React Project
        </footer>
      )}
    </div>
  );
}
