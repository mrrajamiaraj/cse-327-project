import { Routes, Route, Link, useLocation } from "react-router-dom";

// Intro / auth
import SplashScreen from "./pages/SplashScreen.jsx";
import FrontScreen from "./pages/FrontScreen.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import LocationAccess from "./pages/LocationAccess.jsx";
import MenuScreen from "./pages/MenuScreen.jsx";
import PersonalInfo from "./pages/PersonalInfo.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Addresses from "./pages/Addresses.jsx";
import EditCart from "./pages/EditCart.jsx";
import Payment from "./pages/Payment.jsx";
import AddCard from "./pages/AddCard.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";








// Main app pages
import HomeScreen from "./pages/HomeScreen.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";

// Feature pages
import Offer from "./pages/Offer.jsx";
import Search from "./pages/Search.jsx";
import Burgers from "./pages/Burgers.jsx";
import FoodDetails from "./pages/FoodDetails.jsx";
import RestaurantView from "./pages/RestaurantView.jsx";  // ✅ correct file
import AddAddress from "./pages/AddAddress.jsx";



export default function App() {
  const location = useLocation();

  const hideNav = [
    "/",             // splash
    "/onboarding",   // onboarding
    "/login",
    "/signup",
    "/location",
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
            padding: "0.8rem 1.6rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "1.05rem" }}>
            CSE 327 Restaurant
          </div>

          <nav style={{ display: "flex", gap: "1rem", fontSize: "0.9rem" }}>
            <Link to="/home" style={{ color: "#fff", textDecoration: "none" }}>
              Home
            </Link>
            <Link to="/restaurant-view" style={{ color: "#fff", textDecoration: "none" }}>
              Restaurants
            </Link>
            <Link to="/cart" style={{ color: "#fff", textDecoration: "none" }}>
              Cart
            </Link>
            <Link to="/checkout" style={{ color: "#fff", textDecoration: "none" }}>
              Checkout
            </Link>
          </nav>
        </header>
      )}

      {/* ROUTES */}
      <main style={{ flex: 1 }}>
        <Routes>

          {/* Intro screens */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/onboarding" element={<FrontScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/location" element={<LocationAccess />} />
          <Route path="/payment" element={<Payment />} />
          



          {/* Main App Screens */}
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/restaurant-view" element={<RestaurantView />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/menu" element={<MenuScreen />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/edit-cart" element={<EditCart />} />
          <Route path="/add-card" element={<AddCard />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />





          


          {/* Other features */}
          <Route path="/offer" element={<Offer />} />
          <Route path="/search" element={<Search />} />
          <Route path="/burgers" element={<Burgers />} />
          <Route path="/food-details" element={<FoodDetails />} />
          
        </Routes>
      </main>

      {/* Footer */}
      {!hideNav && (
        <footer
          style={{
            padding: "0.8rem 1.6rem",
            textAlign: "center",
            fontSize: "0.8rem",
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
