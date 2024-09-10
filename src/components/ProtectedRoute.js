import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminRequired }) => {
  const { currentUser, role } = useSelector((state) => state.auth);

  if (!currentUser) {
    return <Navigate to="/mahaguna-historic" />;
  }

  if (adminRequired && role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Allow access to the protected route
  return children;
};

export default ProtectedRoute;
