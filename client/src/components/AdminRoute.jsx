import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // 1. If not logged in, kick to Login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // 2. If logged in but NOT an Admin, kick to User Dashboard
  if (!user.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  // 3. If Admin, allow access
  return children;
};

export default AdminRoute;