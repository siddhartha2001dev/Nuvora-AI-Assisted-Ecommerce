import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, requireSeller = false, buyerOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  const token = localStorage.getItem("nuvora_token");

  // If not logged in, redirect to Login page
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If seller route but user is not a Seller, redirect to home
  if (requireSeller && user && user.role !== "Seller") {
    return <Navigate to="/" replace />;
  }

  // If seller tries to access buyer-only routes, redirect to seller dashboard
  if (buyerOnly && user && user.role === "Seller") {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
