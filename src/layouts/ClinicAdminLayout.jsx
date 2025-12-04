// src/layouts/ClinicAdminLayout.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { useDispatch } from "react-redux";

export default function ClinicAdminLayout({ children }) {
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false); // MOBILE SIDEBAR CONTROL

  const handleLogout = () => {
    dispatch(logout());
    navigate("/super-admin/login", { replace: true });
  };

  // Helper for consistent link styling
  const getLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive ? "bg-white text-[#003366] font-semibold" : "text-white hover:bg-[#004080]"
    }`;

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* ---------------- Sidebar (Desktop + Mobile Drawer) --------------- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#003366] text-white flex flex-col p-4 transform 
          transition-transform duration-300 shadow-xl
          ${open ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static
        `}
      >
        {/* Header */}
        <div className="mb-8 px-2">
          <h2 className="text-xl font-extrabold tracking-tight">Clinic Admin</h2>
          <p className="text-xs opacity-70 mt-1">{user?.clinic?.name || "Clinic Panel"}</p>
        </div>

        {/* NAV LINKS */}
        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavLink
            to="/admin/dashboard"
            onClick={() => setOpen(false)}
            className={getLinkClass}
          >
            <span>📊</span> Dashboard
          </NavLink>

          <NavLink
            to="/admin/bookings"
            onClick={() => setOpen(false)}
            className={getLinkClass}
          >
            <span>📅</span> Bookings
          </NavLink>

          <NavLink
            to="/admin/slots"
            onClick={() => setOpen(false)}
            className={getLinkClass}
          >
            <span>⏰</span> Slots
          </NavLink>

          <NavLink
            to="/admin/doctors"
            onClick={() => setOpen(false)}
            className={getLinkClass}
          >
            <span>👨‍⚕️</span> Doctors
          </NavLink>

          <NavLink
            to="/admin/payments"
            onClick={() => setOpen(false)}
            className={getLinkClass}
          >
            <span>💳</span> Payments
          </NavLink>

          <div className="pt-4 mt-4 border-t border-[#ffffff20]">
            <NavLink
              to="/admin/settings" // Assuming this is the Profile/Settings page
              onClick={() => setOpen(false)}
              className={getLinkClass}
            >
              <span>👤</span> My Profile
            </NavLink>
          </div>
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-100 hover:bg-red-600 hover:text-white transition-colors w-full"
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* ----------- MOBILE BACKDROP -------------- */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ---------------- Main Content ---------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger for Mobile */}
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            <div>
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-bold text-[#003366]">
                {user?.name || "Admin"}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
