// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice'; // Adjust path if needed

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0b3b5e] rounded-lg flex items-center justify-center text-white font-bold">
                D
              </div>
              <span className="text-xl font-bold text-[#0b3b5e]">DocBook</span>
            </Link>
          </div>

          {/* Right Side Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/my-appointments"
                  className="text-sm font-medium text-gray-600 hover:text-[#0b3b5e] transition-colors"
                >
                  My Appointments
                </Link>
                
  <Link
    to="/profile" // <--- ADD THIS LINK
    className="text-sm font-medium text-gray-600 hover:text-[#0b3b5e]"
  >
    Profile
  </Link>
                <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-[#0b3b5e] px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0b3b5e] hover:opacity-90 rounded-lg shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
