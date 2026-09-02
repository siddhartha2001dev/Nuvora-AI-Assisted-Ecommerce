import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * BuyerRoute Component
 * --------------------
 * Simple wrapper for buyer views.
 * If the current user is an Admin, redirects them to /seller/dashboard
 * so admins always stay inside their dedicated management interface.
 */
const BuyerRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isAdmin = isAuthenticated && user && (user.role === "Admin" || user.role === "Seller");

  // Redirect Admin away to the Admin Dashboard
  if (isAdmin) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

export default BuyerRoute;
