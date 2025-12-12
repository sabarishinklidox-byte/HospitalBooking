import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isClinicAdmin = user && user.role === 'ADMIN';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              D
            </div>
            <span className="text-2xl font-bold text-[#003366] tracking-tight">
              DocBook
            </span>
          </div>

          {/* CENTER: DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <Link
                  to="/my-appointments"
                  className="text-sm font-semibold text-gray-600 hover:text-[#003366] flex items-center gap-2 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  Appointments
                </Link>
                <Link
                  to="/profile"
                  className="text-sm font-semibold text-gray-600 hover:text-[#003366] flex items-center gap-2 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  Profile
                </Link>
                {isClinicAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-semibold text-[#003366] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"
                      />
                    </svg>
                    Clinic Admin
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/"
                className="text-sm font-semibold text-gray-600 hover:text-[#003366]"
              >
                Find Doctors
              </Link>
            )}
          </div>

          {/* RIGHT: USER ACTIONS */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-200 h-10">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900 leading-none">
                    {user.name}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded mt-1">
                    {user.role.toLowerCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-[#003366] hover:bg-gray-50 rounded-lg transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4 border border-blue-100">
                  <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <Link
                  to="/my-appointments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>📅</span> My Appointments
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>👤</span> Profile
                </Link>
                {isClinicAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-blue-700 hover:bg-blue-50"
                  >
                    <span>📊</span> Clinic Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <span>🚪</span> Logout
                </button>
              </>
            ) : (
              <div className="space-y-3 mt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-lg font-bold text-gray-700 border border-gray-200 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-lg font-bold text-white bg-[#003366]"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
