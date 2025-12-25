import { Routes, Route, Link, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

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
import SellerDashboard from "./pages/SellerDashboard.jsx";
import RunningOrders from "./pages/RunningOrders.jsx";
import AddNewItems from "./pages/AddNewItems.jsx";
import MyFoodList from "./pages/MyFoodList.jsx";
import SellerNotifications from "./pages/SellerNotifications.jsx";
import SellerMessages from "./pages/SellerMessages.jsx";
import SellerProfileMenu from "./pages/SellerProfileMenu.jsx";
import SellerProfile from "./pages/SellerProfile.jsx";
import TotalRevenue from "./pages/TotalRevenue.jsx";
import WithdrawHistory from "./pages/WithdrawHistory.jsx";
import SellerReviews from "./pages/SellerReviews.jsx";
import RestaurantSettings from "./pages/RestaurantSettings.jsx";
import ChatInterface from "./pages/ChatInterface.jsx";
import MyOrders from "./pages/MyOrders.jsx";

// Rider pages
import RiderDashboard from "./pages/RiderDashboard.jsx";
import RiderEarnings from "./pages/RiderEarnings.jsx";
import RiderOrders from "./pages/RiderOrders.jsx";
import RiderProfile from "./pages/RiderProfile.jsx";

// Rider order preview
import RiderOrderPreview from "./pages/RiderOrderPreview.jsx";

// Rider customer chat
import RiderCustomerChat from "./pages/RiderCustomerChat.jsx";

// Rider navigation
import RiderNavigationPage from "./pages/RiderNavigationPage.jsx";

// Order tracking
import OrderTracking from "./pages/OrderTracking.jsx";

// Review order
import ReviewOrder from "./pages/ReviewOrder.jsx";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminRestaurants from "./pages/AdminRestaurants.jsx";

// Main app pages
import HomeScreen from "./pages/HomeScreen.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Favorites from "./pages/Favorites.jsx";

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
    <ErrorBoundary>
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
            <Link to="/seller-dashboard" style={{ color: "#fff", textDecoration: "none" }}>
              Seller
            </Link>
            <Link to="/rider-dashboard" style={{ color: "#fff", textDecoration: "none" }}>
              Rider
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
          <Route path="/seller-dashboard" element={<SellerDashboard />} />
          <Route path="/running-orders" element={<RunningOrders />} />
          <Route path="/my-food" element={<MyFoodList />} />
          <Route path="/add-new-items" element={<AddNewItems />} />
          <Route path="/seller-notifications" element={<SellerNotifications />} />
          <Route path="/seller-messages" element={<SellerMessages />} />
          <Route path="/seller-profile" element={<SellerProfile />} />
          <Route path="/seller-profile-menu" element={<SellerProfileMenu />} />
          <Route path="/restaurant-settings" element={<RestaurantSettings />} />
          <Route path="/total-revenue" element={<TotalRevenue />} />
          <Route path="/withdraw-history" element={<WithdrawHistory />} />
          <Route path="/seller-reviews" element={<SellerReviews />} />
          <Route path="/chat/:orderId" element={<ChatInterface />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/favorites" element={<Favorites />} />

          {/* Rider Routes */}
          <Route path="/rider-dashboard" element={<RiderDashboard />} />
          <Route path="/rider-earnings" element={<RiderEarnings />} />
          <Route path="/rider-orders" element={<RiderOrders />} />
          <Route path="/rider-profile" element={<RiderProfile />} />
          <Route path="/rider/order-preview/:orderId" element={<RiderOrderPreview />} />
          <Route path="/rider/chat/:orderId" element={<RiderCustomerChat />} />
          <Route path="/rider-navigation/:orderId" element={<RiderNavigationPage />} />

          {/* Order Tracking */}
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          
          {/* Review Order */}
          <Route path="/review/:orderId" element={<ReviewOrder />} />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/restaurants" element={<AdminRestaurants />} />


          


          





          


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
    </ErrorBoundary>
  );
}
