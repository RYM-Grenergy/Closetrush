import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RentalProvider } from "./context/RentalContext";
import LandingPage from "./pages/LandingPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ExplorePage from "./pages/ExplorePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import CheckoutPage from "./pages/CheckoutPage";
import AadhaarVerificationPage from "./pages/AadhaarVerificationPage";
import WishlistPage from "./pages/WishlistPage";
import DeliveryPartnerDashboard from "./pages/DeliveryPartnerDashboard";

const App = () => {
  return (
    <RentalProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/verify-aadhaar" element={<AadhaarVerificationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/delivery-partner" element={<DeliveryPartnerDashboard />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </Router>
    </RentalProvider>
  );
};

export default App;
