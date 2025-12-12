import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginUser, clearError } from './authSlice';
import { toast } from 'react-hot-toast';

export default function UserLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  // Where to go after login (booking page or fallback)
  const origin = location.state?.from?.pathname || location.state?.from || '/';

  // Redirect after successful login
  useEffect(() => {
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate(origin, { replace: true });
    }
  }, [user, origin, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser(form));
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#003366] to-[#004080] items-center justify-center relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]" />
        <div className="relative z-10 text-center px-10">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
          <p className="text-blue-100 text-lg max-w-md mx-auto">
            Access your appointments and manage bookings easily.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Patient Login</h2>
            <p className="text-gray-500 mt-2">Sign in to continue</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            {/* Forgot password row */}
            <div className="flex items-center justify-between">
              <span />
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-medium text-[#003366] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                    />
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              state={{ from: origin }}
              className="font-bold text-[#003366] hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
