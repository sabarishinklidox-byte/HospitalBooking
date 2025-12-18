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

  const origin = location.state?.from?.pathname || location.state?.from || '/';

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
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
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
              {loading ? 'Signing In...' : 'Sign In'}
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

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Or Login As
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Role-Based Login Buttons (New Tab) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/super-admin/login"
              target="_blank" // ✅ Opens in new tab
              rel="noopener noreferrer" // ✅ Security best practice
              className="w-full text-center py-3 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </Link>

            <Link
              to="/doctor/login"
              target="_blank" // ✅ Opens in new tab
              rel="noopener noreferrer" // ✅ Security best practice
              className="w-full text-center py-3 rounded-lg border-2 border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
