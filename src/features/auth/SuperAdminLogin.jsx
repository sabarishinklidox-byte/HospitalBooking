import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuperAdmin, clearError } from './authSlice';

export default function SuperAdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: localStorage.getItem('rememberAdminEmail') || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem('rememberAdminEmail')
  );

  useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // ✅ Password Strength (Text Only)
  const getPasswordStrength = () => {
    if (!form.password) return '';
    if (form.password.length < 6) return 'Weak';
    if (/[A-Z]/.test(form.password) && /\d/.test(form.password)) return 'Strong';
    return 'Medium';
  };

  const strength = getPasswordStrength();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCapsCheck = (e) => {
    setCapsLock(e.getModifierState('CapsLock'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (rememberMe) {
      localStorage.setItem('rememberAdminEmail', form.email);
    } else {
      localStorage.removeItem('rememberAdminEmail');
    }

    dispatch(loginSuperAdmin(form));
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 to-slate-800 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 text-white px-12 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Administration</h1>
          <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed">
            Secure access for Super Admins and Clinic Managers to oversee operations.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
            <p className="text-sm text-gray-500 mt-2">Sign in to your dashboard</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition-all"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition-all"
                  value={form.password}
                  onChange={handleChange}
                  onKeyUp={handleCapsCheck}
                  required
                />

                {/* ✅ PROFESSIONAL EYE ICON */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-3.582-10-8
                        0-1.657.632-3.193 1.707-4.485M6.343 6.343A9.969 9.969
                        0 0112 5c5.523 0 10 3.582 10 8 0 1.657-.632 3.193-1.707
                        4.485M3 3l18 18"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5
                        c4.478 0 8.268 2.943 9.542 7
                        -1.274 4.057-5.064 7-9.542 7
                        -4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* ✅ CAPS LOCK WARNING */}
              {capsLock && (
                <p className="text-xs text-orange-500 mt-1">
                  Caps Lock is ON
                </p>
              )}

              {/* ✅ PASSWORD STRENGTH */}
              {form.password && (
                <p
                  className={`text-xs mt-1 ${
                    strength === 'Weak'
                      ? 'text-red-500'
                      : strength === 'Medium'
                      ? 'text-orange-500'
                      : 'text-green-600'
                  }`}
                >
                  Strength: {strength}
                </p>
              )}
            </div>

            {/* ✅ REMEMBER ME */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span>Remember me</span>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-400">
              Protected System. Unauthorized access is prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
