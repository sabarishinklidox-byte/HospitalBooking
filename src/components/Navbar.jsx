import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { FiPlusSquare, FiMenu, FiX, FiUser, FiCalendar, FiLogOut, FiBarChart2 } from "react-icons/fi";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                D
              </div>
              <span className="text-2xl font-bold text-[#003366] tracking-tight hidden sm:block group-hover:text-[#0055aa] transition-colors">
                DocBook
              </span>
            </Link>
          </div>

          {/* CENTER: DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <>
                <Link to="/my-appointments" className="text-sm font-semibold text-gray-600 hover:text-[#003366] flex items-center gap-2 transition-colors">
                  Appointments
                </Link>
                <Link to="/profile" className="text-sm font-semibold text-gray-600 hover:text-[#003366] flex items-center gap-2 transition-colors">
                  Profile
                </Link>
                {isClinicAdmin && (
                  <Link to="/admin/dashboard" className="text-sm font-semibold text-[#003366] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors">
                    Clinic Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                 <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-[#003366] transition-colors">
                  Find Doctors
                </Link>
                <div className="h-5 w-px bg-gray-300"></div>
              </>
            )}
          </div>

          {/* RIGHT: ACTIONS (DESKTOP) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 pl-6 border-l border-gray-200 h-10">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900 leading-none">{safeName}</span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded mt-1">{safeRoleLabel}</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Logout">
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* 1. Login Link */}
                <Link 
                  to="/login" 
                  state={{ from: location.pathname }} 
                  className="px-3 py-2 -sm font-bold text-gray-600 hover:text-[#003366] transition-colors"
                >
                  Login
                </Link>
                
                {/* 2. Sign Up (Patient) Link - RESTORED ✅ */}
                <Link 
                  to="/signup" 
                  className="px-3 py-2 text-sm font-bold text-[#003366] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                >
                  Sign Up
                </Link>

                {/* 3. Register Clinic (Distinct Button) */}
                <Link
                  to="/register"
                  className="group relative flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#003366] to-[#004d99] rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ml-2"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <FiPlusSquare className="relative z-10" size={18} />
                  <span className="relative z-10">For Clinics</span>
                </Link>
              </div>   
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="flex items-center md:hidden gap-3">
             {!user && (
                 <Link to="/register" className="text-white bg-[#003366] p-2.5 rounded-lg shadow-sm active:scale-95 transition-transform">
                    <FiPlusSquare size={20} />
                 </Link>
             )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none">
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full animate-fadeIn z-40">
          <div className="px-4 pt-4 pb-6 space-y-3">
            {user ? (
              <>
                {/* ... (User Menu same as before) ... */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4 border border-blue-100">
                  <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-bold text-lg">{(safeName?.[0] || "U").toUpperCase()}</div>
                  <div>
                    <p className="font-bold text-gray-900">{safeName}</p>
                    <p className="text-xs text-gray-500">{safeEmail}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-1">{safeRoleLabel}</p>
                  </div>
                </div>
                <Link to="/my-appointments" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"><FiCalendar className="text-gray-400" /> My Appointments</Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"><FiUser className="text-gray-400" /> Profile</Link>
                {isClinicAdmin && <Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-blue-700 bg-blue-50/50 hover:bg-blue-100"><FiBarChart2 /> Clinic Admin</Link>}
                <div className="border-t border-gray-100 my-2"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"><FiLogOut /> Logout</button>
              </>
            ) : (
              <div className="space-y-3 mt-2">
                {/* Mobile Links */}
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 w-full justify-center px-4 py-3.5 rounded-lg font-bold text-white bg-gradient-to-r from-[#003366] to-[#0055aa] shadow-md active:scale-[0.98] transition-all">
                    <FiPlusSquare size={18} /> Register Your Clinic
                </Link>

                <div className="flex items-center justify-between text-sm text-gray-400 px-2">
                   <span className="h-px bg-gray-200 flex-grow"></span><span className="px-2">OR</span><span className="h-px bg-gray-200 flex-grow"></span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 rounded-lg font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">Login</Link>
                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 rounded-lg font-bold text-[#003366] bg-blue-50 hover:bg-blue-100">Sign Up</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
