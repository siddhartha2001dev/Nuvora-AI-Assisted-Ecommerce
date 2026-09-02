import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({
  children,
  requireSeller = false,
  requireAdmin = false,
  buyerOnly = false,
}) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  const token = localStorage.getItem("nuvora_token");

  // Check login
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user && (user.role === "Admin" || user.role === "Seller");

  // Check admin access
  if ((requireSeller || requireAdmin) && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Check buyer-only access
  if (buyerOnly && isAdmin) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
