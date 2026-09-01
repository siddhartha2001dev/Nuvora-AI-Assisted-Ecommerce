import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const BuyerRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // If logged in as Seller, redirect away from buyer view directly to Seller Dashboard
  if (isAuthenticated && user && user.role === "Seller") {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

export default BuyerRoute;
