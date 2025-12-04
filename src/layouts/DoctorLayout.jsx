// src/layouts/DoctorLayout.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function DoctorLayout({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/doctor/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0b3b5e] to-[#062739] text-white flex flex-col p-6 transform
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:w-64
        `}
      >
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-1">Doctor Portal</h2>
          <p className="text-sm opacity-90 truncate">
            Dr. {user?.name || 'Doctor'}
          </p>
        </div>

        <nav className="space-y-2 flex-1 mb-8">
          <NavLink
            to="/doctor/dashboard"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-white text-[#0b3b5e] shadow-lg'
                  : 'hover:bg-white/20 hover:translate-x-1'
              }`
            }
          >
            📊 Dashboard
          </NavLink>
          <NavLink
            to="/doctor/appointments"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-white text-[#0b3b5e] shadow-lg'
                  : 'hover:bg-white/20 hover:translate-x-1'
              }`
            }
          >
            📅 Appointments
          </NavLink>
          <NavLink
  to="/doctor/profile"
  onClick={() => setOpen(false)}
  className={({ isActive }) =>
    `block px-4 py-3 rounded-xl transition-all text-sm font-medium ${
      isActive
        ? 'bg-white text-[#0b3b5e] shadow-lg'
        : 'hover:bg-white/20 hover:translate-x-1'
    }`
  }
>
  👤 My Profile
</NavLink>

        </nav>

        <button
          onClick={handleLogout}
          className="px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-100 hover:text-white font-medium transition-all text-sm"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-[#0b3b5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Logged in as</p>
                <p className="text-lg font-bold text-[#0b3b5e] truncate max-w-xs">
                  Dr. {user?.name || 'Doctor'}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
