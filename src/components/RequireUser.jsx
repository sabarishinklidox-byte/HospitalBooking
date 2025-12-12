// src/components/RequireUser.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireUser({ children }) {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user || user.role !== 'USER') {
    // Redirect to signup and remember where user wanted to go
    return (
      <Navigate
        to="/signup"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
