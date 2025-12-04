// src/features/auth/SuperAdminLogin.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuperAdmin, clearError } from './authSlice';

export default function SuperAdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    dispatch(loginSuperAdmin({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow max-w-sm w-full"
      >
        <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
          Admin Login
        </h1>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="mb-3">
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            type="email"
            className="input w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Password</label>
          <input
            name="password"
            type="password"
            className="input w-full"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
