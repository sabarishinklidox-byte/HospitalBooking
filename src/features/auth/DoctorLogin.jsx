// src/features/auth/DoctorLogin.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginDoctor, clearError } from './authSlice';

export default function DoctorLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user && user.role === 'DOCTOR') {
      navigate('/doctor/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginDoctor(form));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2 text-center"
          style={{ color: 'var(--color-primary)' }}
        >
          Doctor Login
        </h1>
        <p className="text-xs text-gray-500 mb-6 text-center">
          Sign in to view your appointments and schedule.
        </p>

        {error && (
          <p className="mb-4 text-xs text-red-600 text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="input w-full"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="input w-full"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg text-white font-semibold text-sm disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {loading ? 'Signing in...' : 'Login as Doctor'}
          </button>
        </form>

        <p className="mt-6 text-[11px] text-gray-400 text-center">
          This portal is only for doctors. Clinic admins use super admin login.
        </p>
      </div>
    </div>
  );
}
