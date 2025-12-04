import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { useDispatch } from 'react-redux';

export default function SuperAdminLayout({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   const handleLogout = () => {
    dispatch(logout());                   // ← clear Redux + localStorage
    navigate('/super-admin/login', { replace: true });
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // --- Start of Return Block ---
  return (
  <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">

    {/* 1. Sidebar Overlay for Mobile */}
    {isSidebarOpen && (
      <div
        className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
        onClick={closeSidebar}
      ></div>
    )}

    {/* 2. Sidebar */}
    <aside
      className={`fixed inset-y-0 left-0 max-w-[100vw] overflow-x-hidden transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out w-64 flex-shrink-0 p-6 flex flex-col z-30 md:relative md:translate-x-0`}
      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }}
    >
      {/* Close Button for Mobile */}
      <button
        onClick={closeSidebar}
        className="absolute top-4 right-4 text-white hover:text-gray-200 md:hidden p-1 focus:outline-none"
        aria-label="Close menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Sidebar Header */}
      <div className="mb-8 mt-6">
        <h2 className="text-2xl font-bold mb-1">Super Admin</h2>
        <p className="text-xs opacity-80">Clinic Management</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 text-sm flex-1">
        <NavLink
          to="/super-admin/dashboard"
          onClick={closeSidebar}
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-white hover:bg-[#002244] hover:shadow-inner'
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/super-admin/clinics"
          onClick={closeSidebar}
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-white hover:bg-[#002244] hover:shadow-inner'
            }`
          }
        >
          Clinics
        </NavLink>

        <NavLink
          to="/super-admin/admins"
          onClick={closeSidebar}
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-white hover:bg-[#002244] hover:shadow-inner'
            }`
          }
        >
          Clinic Admins
        </NavLink>
      </nav>

      {/* Logout Button */}
      <button
        onClick={() => {
          handleLogout();
          closeSidebar();
        }}
        className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition"
      >
        Logout
      </button>
    </aside>

    {/* 3. Main Content Area */}
    <div className="flex-1 flex flex-col overflow-x-hidden">

      {/* 4. Top Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white shadow-sm border-b">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 text-gray-800 hover:bg-gray-100 rounded focus:outline-none"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* User Info */}
        <div>
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            {user?.name || 'Super Admin'}
          </p>
        </div>

        <div className="w-6 h-6 md:hidden"></div>
      </header>

      {/* 5. Page Content */}
      <main className="p-4 sm:p-6 flex-1 overflow-auto">
        {children}
      </main>

    </div>
  </div>
);
}