import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { FiPlusSquare } from "react-icons/fi"; // Removed FiArrowLeft

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Still needed for Login 'state'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const isClinicAdmin = user?.role === "ADMIN";
  const safeName = user?.name || "User";
  const safeEmail = user?.email || "";
  const safeRoleLabel = (user?.role ?? "USER").toLowerCase(); 

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* LEFT: LOGO ONLY (Back button removed) */}
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                D
              </div>
              <span className="text-2xl font-bold text-[#003366] tracking-tight hidden sm:block">
                DocBook
              </span>
            </div>
          </div>

          {/* CENTER: DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/my-appointments"
                  className="text-sm font-semibold text-gray-600 hover:text-[#003366] flex items-center gap-2 transition-colors"
                >
                  Appointments
                </Link>

                <Link
                  to="/profile"
                  className="text-sm font-semibold text-gray-600 hover:text-[#003366] flex items-center gap-2 transition-colors"
                >
                  Profile
                </Link>

                {isClinicAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-sm font-semibold text-[#003366] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                  >
                    Clinic Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                 {/* Register Clinic Link (Only for Guests) */}
                 <Link
                  to="/register"
                  className="text-sm font-semibold text-slate-500 hover:text-[#003366] flex items-center gap-2 transition-colors"
                >
                  <FiPlusSquare /> Register Clinic
                </Link>
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <Link
                  to="/"
                  className="text-sm font-semibold text-gray-600 hover:text-[#003366]"
                >
                  Find Doctors
                </Link>
              </>
            )}
          </div>

          {/* RIGHT: USER ACTIONS (DESKTOP) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-200 h-10">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900 leading-none">
                    {safeName}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded mt-1">
                    {safeRoleLabel}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
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
          <div className="flex items-center md:hidden gap-3">
             {/* Mobile Register Clinic Button (Icon only to save space) */}
             {!user && (
                 <Link to="/register" className="text-[#003366] p-2 bg-blue-50 rounded-lg">
                    <FiPlusSquare size={20} />
                 </Link>
             )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full animate-fadeIn">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4 border border-blue-100">
                  <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold">
                    {(safeName?.[0] || "U").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{safeName}</p>
                    <p className="text-xs text-gray-500">{safeEmail}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">
                      {safeRoleLabel}
                    </p>
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
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 w-full justify-center px-4 py-3 rounded-lg font-bold text-[#003366] border border-[#003366] hover:bg-blue-50"
                >
                    <FiPlusSquare /> Register Clinic
                </Link>

                <div className="border-t border-slate-100 my-2"></div>

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
