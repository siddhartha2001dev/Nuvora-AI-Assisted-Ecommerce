import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Common Layout
import Navbar from "./Components/Common/Navbar";
import Footer from "./Components/Common/Footer";
import ProtectedRoute from "./Components/Common/ProtectedRoute";
import BuyerRoute from "./Components/Common/BuyerRoute";
import ThemeToggleSwitch from "./Components/Common/ThemeToggleSwitch";

// Public Pages
import Home from "./Pages/Public/Home";
import Shop from "./Pages/Public/Shop";
import ProductDetails from "./Pages/Public/ProductDetails";
import VerifyMail from "./Pages/Public/VerifyMail";

// Auth Pages
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/ResetPassword";

// Customer Pages
import Cart from "./Pages/Customer/Cart";
import WishList from "./Pages/Customer/WishList";
import CheckOut from "./Pages/Customer/CheckOut";
import MyOrders from "./Pages/Customer/MyOrders";
import Profile from "./Pages/Customer/Profile";

// Seller Pages
import SellerDashboard from "./Pages/Seller/SellerDashboard";
import AddProduct from "./Pages/Seller/AddProduct";
import SellerOrders from "./Pages/Seller/SellerOrders";

// Error Pages
import NotFound from "./Pages/Error/NotFound";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#09090b] text-neutral-100 font-['Plus_Jakarta_Sans',sans-serif] w-full overflow-x-hidden relative">
        {/* Fixed Top Navigation */}
        <Navbar />

        {/* Dynamic Main Page Content with top padding to offset fixed navbar */}
        <main className="flex-1 w-full max-w-full overflow-x-hidden pt-[76px] sm:pt-[84px]">
          <Routes>
            {/* 1. Public Storefront Routes (Only for Buyers/Guests; Sellers redirect to Dashboard) */}
            <Route
              path="/"
              element={
                <BuyerRoute>
                  <Home />
                </BuyerRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <BuyerRoute>
                  <Shop />
                </BuyerRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <BuyerRoute>
                  <ProductDetails />
                </BuyerRoute>
              }
            />
            <Route path="/verify-email" element={<VerifyMail />} />

            {/* 2. Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* 3. Customer Protected Routes (Buyer Only; Sellers redirect to Dashboard) */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute buyerOnly={true}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute buyerOnly={true}>
                  <WishList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute buyerOnly={true}>
                  <CheckOut />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute buyerOnly={true}>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 4. Seller Protected Routes (Login + Seller Role Required) */}
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute requireSeller={true}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/add-product"
              element={
                <ProtectedRoute requireSeller={true}>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/orders"
              element={
                <ProtectedRoute requireSeller={true}>
                  <SellerOrders />
                </ProtectedRoute>
              }
            />

            {/* 5. 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Persistent Bottom Footer */}
        <Footer />

        {/* Floating Fixed Theme Toggle Switch at Bottom-Right Corner */}
        <ThemeToggleSwitch />
      </div>
    </BrowserRouter>
  );
}

export default App;