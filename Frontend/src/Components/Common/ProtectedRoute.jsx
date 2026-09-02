import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute Component
 * ------------------------
 * Guards routes based on user authentication status and role.
 *
 * Rules:
 * 1. If not logged in -> Redirect to /login (preserving intended destination in state)
 * 2. If route requires Admin and user is not Admin -> Redirect to /
 * 3. If route is buyerOnly and user is Admin -> Redirect to /seller/dashboard
 */
const ProtectedRoute = ({
  children,
  requireSeller = false,
  requireAdmin = false,
  buyerOnly = false,
}) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  const token = localStorage.getItem("nuvora_token");

  // Step 1: Check if user is authenticated
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user && (user.role === "Admin" || user.role === "Seller");

  // Step 2: Check Admin permission
  if ((requireSeller || requireAdmin) && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Step 3: Check Buyer-only constraint
  if (buyerOnly && isAdmin) {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
