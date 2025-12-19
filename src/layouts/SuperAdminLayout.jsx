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
      dispatch(logout());
      navigate('/super-admin/login', { replace: true });
    };

    const closeSidebar = () => setIsSidebarOpen(false);

    // Helper for Nav Link styling
    // Active: White Background, Primary Text (Navy)
    // Inactive: Light Text, Hover: Secondary Color (Sky Blue) bg
    const navLinkClasses = ({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
        isActive
          ? 'bg-white text-[var(--color-primary)] shadow-md font-bold'
          : 'text-blue-50 hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]'
      }`;

    return (
      <div className="min-h-screen flex bg-gray-50 overflow-hidden">
        
        {/* 1. Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
            onClick={closeSidebar}
          />
        )}

        {/* 2. Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ backgroundColor: 'var(--color-primary)' }} // ✅ USES #003366
        >
          <div className="flex flex-col h-full p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Super Admin</h2>
                <p className="text-xs text-blue-200 mt-1">Clinic Management</p>
              </div>
              <button onClick={closeSidebar} className="md:hidden text-white hover:bg-white/10 p-1 rounded">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2">
              <NavLink to="/super-admin/dashboard" onClick={closeSidebar} className={navLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Dashboard
              </NavLink>

              <NavLink to="/super-admin/clinics" onClick={closeSidebar} className={navLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Clinics
              </NavLink>
               <NavLink to="/super-admin/admins" onClick={closeSidebar} className={navLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Clinic Admins
              </NavLink>
             

             
  <NavLink
                to="/super-admin/analytics"
                onClick={closeSidebar}
                className={navLinkClasses}
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
                    d="M3 3v18h18M7 15l4-4 3 3 5-7"
                  />
                </svg>
                Analytics
              </NavLink>
               <NavLink to="/super-admin/audit-logs" onClick={closeSidebar} className={navLinkClasses}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                Audit Logs
              </NavLink>
               <NavLink
    to="/super-admin/plans"
    onClick={closeSidebar}
    className={navLinkClasses}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 7h18M3 12h18M3 17h18"
      />
    </svg>
    Plans
  </NavLink>
             
            </nav>

            {/* Logout */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* 3. Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          
          {/* Topbar (Mobile Only) */}
          <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-20">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>Super Admin</span>
            <div className="w-8" />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }
