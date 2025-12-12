import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginDoctor, clearError } from './authSlice';

export default function DoctorLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: localStorage.getItem('rememberEmail') || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem('rememberEmail')
  );

  useEffect(() => {
    if (user && user.role === 'DOCTOR') {
      navigate('/doctor/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // ✅ Password Strength Logic (Text Only)
  const getPasswordStrength = () => {
    if (!form.password) return '';
    if (form.password.length < 6) return 'Weak';
    if (/[A-Z]/.test(form.password) && /\d/.test(form.password)) return 'Strong';
    return 'Medium';
  };

  const strength = getPasswordStrength();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCapsCheck = (e) => {
    setCapsLock(e.getModifierState('CapsLock'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (rememberMe) {
      localStorage.setItem('rememberEmail', form.email);
    } else {
      localStorage.removeItem('rememberEmail');
    }

    dispatch(loginDoctor(form));
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* LEFT BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#003366] to-[#004080] items-center justify-center overflow-hidden">
        <div className="relative z-10 text-white px-12 max-w-xl">
          <div className="mb-6 inline-block p-3 bg-white/10 rounded-2xl">
            <span className="text-3xl">👨‍⚕️</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome Back, Doctor.</h1>
          <p className="text-blue-100 text-lg">
            Access your appointments, patient records, and daily schedule seamlessly.
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Doctor Portal</h2>
            <p className="text-sm text-gray-500 mt-2">Please sign in to continue</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] outline-none transition-all"
                  value={form.password}
                  onChange={handleChange}
                  onKeyUp={handleCapsCheck}
                  required
                />

                {/* ✅ PROFESSIONAL SVG EYE ICON (NO COLOR CHANGE) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    // Eye Off
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-3.582-10-8
                        0-1.657.632-3.193 1.707-4.485M6.343 6.343A9.969 9.969
                        0 0112 5c5.523 0 10 3.582 10 8 0 1.657-.632 3.193-1.707
                        4.485M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    // Eye On
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5
                        c4.478 0 8.268 2.943 9.542 7
                        -1.274 4.057-5.064 7-9.542 7
                        -4.477 0-8.268-2.943-9.542-7z"
                      />
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

              {/* ✅ PASSWORD STRENGTH TEXT */}
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
              className="w-full py-3.5 rounded-lg font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-lg transition-all disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            Protected Area. Authorized Personnel Only.
          </p>
        </div>
      </div>
    </div>
  );
}
