// src/components/RequireRole.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireRole({ allowedRoles, children }) {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If logged in but wrong role → send to appropriate dashboard
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/super-admin/login" replace />;
  }

  return children;
}
