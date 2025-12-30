import React from "react";
import { Navigate } from "react-router-dom";
import { useBookContext } from "../context/BookContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useBookContext();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
