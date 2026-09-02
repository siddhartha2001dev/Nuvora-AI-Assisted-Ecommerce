import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const BuyerRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const isAdmin = isAuthenticated && user && (user.role === "Admin" || user.role === "Seller");

  // Redirect admin to dashboard
  if (isAdmin) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

export default BuyerRoute;
