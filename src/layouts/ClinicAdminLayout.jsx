import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { useAdminContext } from '../context/AdminContext.jsx';

export default function ClinicAdminLayout({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- HELPER: Get group from URL (for deep linking) ---
  const getGroupFromPath = (path) => {
    if (path.includes('/appointments') || path.includes('/slots') || path.includes('/bookings')) return 'Scheduling';
    if (path.includes('/doctors') || path.includes('/reviews')) return 'Team';
    if (path.includes('/billing') || path.includes('/payments')) return 'Finance';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/settings') || path.includes('/audit-logs')) return 'Platform';
    return null;
  };

  // --- STATE: Initialize from LocalStorage OR URL ---
  const [openGroup, setOpenGroup] = useState(() => {
    // 1. Priority: Does URL require a specific group?
    const urlGroup = getGroupFromPath(location.pathname);
    if (urlGroup) return urlGroup;

    // 2. Fallback: Check LocalStorage (persists across re-renders)
    const storedGroup = localStorage.getItem('clinic_admin_menu_group');
    return storedGroup || 'Main';
  });

  // --- EFFECT: Save to LocalStorage whenever state changes ---
  useEffect(() => {
    if (openGroup) {
      localStorage.setItem('clinic_admin_menu_group', openGroup);
    }
  }, [openGroup]);

  // --- EFFECT: Sync state if URL changes externally ---
  useEffect(() => {
    const targetGroup = getGroupFromPath(location.pathname);
    if (targetGroup && targetGroup !== openGroup) {
      setOpenGroup(targetGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Context data
  const { plan, unreadNotifs, refreshUnread } = useAdminContext() || {};

  // Refresh notifications
  useEffect(() => {
    refreshUnread?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('clinic_admin_menu_group'); // Clear state on logout
    navigate('/admin/login', { replace: true });
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // Link Styles
  const mainLinkClasses = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${
      isActive
        ? 'bg-white text-[var(--color-primary)] shadow-md font-bold'
        : 'text-blue-50 hover:bg-white/10 hover:text-white'
    }`;

  const subNavLinkClasses = ({ isActive }) =>
    `flex items-center gap-4 pl-8 pr-4 py-3 rounded-xl transition-all text-base font-medium ${
      isActive
        ? 'bg-white text-[var(--color-primary)] shadow-lg font-bold'
        : 'text-blue-50 hover:bg-white/10 hover:text-white'
    }`;

  // --- NavGroup Component ---
  const NavGroup = ({ title, groupName, children: groupChildren }) => {
    const isOpen = openGroup === groupName;

    const toggleGroup = (e) => {
      e.preventDefault();
      setOpenGroup(isOpen ? null : groupName);
    };

    // Highlight parent if child is active
    const isChildActive = React.Children.toArray(groupChildren).some((child) => {
      if (child.props?.to) return location.pathname.startsWith(child.props.to);
      return false;
    });

    return (
      <div className="space-y-2">
        <button
          onClick={toggleGroup}
          className={`w-full flex justify-between items-center px-4 py-2.5 rounded-xl transition-colors font-semibold ${
            isOpen || isChildActive
              ? 'text-white bg-white/20'
              : 'text-blue-200/80 hover:bg-white/10'
          }`}
        >
          <span className="text-sm uppercase tracking-wider">{title}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? 'transform rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="space-y-2 overflow-hidden transition-all duration-300">
            {groupChildren}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-2xl ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Clinic Admin
              </h2>
              <p className="text-xs text-blue-200 mt-1">Clinic Dashboard</p>
              {plan && (
                <p className="text-[11px] text-blue-100 mt-1">
                  Plan:{' '}
                  <span className="font-semibold">
                    {plan.name || plan.slug || 'Unknown'}
                  </span>
                  {plan.version && ` · v${plan.version}`}
                </p>
              )}
            </div>
            <button
              onClick={closeSidebar}
              className="md:hidden text-white hover:bg-white/10 p-1 rounded"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {plan && (
            <div className="mb-4 inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px]">
              <span className="font-semibold">
                {plan.name || plan.slug || 'Current Plan'}
              </span>
              {plan.allowOnlinePayments && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-100">
                  Online payments
                </span>
              )}
              {plan.enableAuditLogs && (
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-100">
                  Analytics & history
                </span>
              )}
            </div>
          )}

          {/* Nav links */}
          <nav className="flex-1 space-y-4 overflow-y-auto">
            <NavLink
              to="/admin/dashboard"
              onClick={closeSidebar}
              className={mainLinkClasses}
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Dashboard
            </NavLink>

            {/* Scheduling */}
            <NavGroup title="Scheduling" groupName="Scheduling">
              <NavLink
                to="/admin/bookings"
                onClick={closeSidebar}
                className={subNavLinkClasses}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M8 11h8M8 15h5M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                </svg>
                <span className="flex items-center gap-2">
                  Bookings
                  {(unreadNotifs || 0) > 0 && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                    </span>
                  )}
                </span>
              </NavLink>
              <NavLink
                to="/admin/appointments"
                onClick={closeSidebar}
                className={subNavLinkClasses}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M5 11h14M5 19h14M5 7h14M5 15h14" />
                </svg>
                Appointments
              </NavLink>

              <NavLink
                to="/admin/slots"
                onClick={closeSidebar}
                className={subNavLinkClasses}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Slots
              </NavLink>
              <NavLink
    to="/admin/manage"  // ← NEW PATH for Block/Unblock
    onClick={closeSidebar}
    className={subNavLinkClasses}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    Slot Manager
  </NavLink>

              
            </NavGroup>

            {/* Team Management */}
            <NavGroup title="Team Management" groupName="Team">
              <NavLink
                to="/admin/doctors"
                onClick={closeSidebar}
                className={subNavLinkClasses}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-3.31 0-6 1.34-6 3v1h12v-1c0-1.66-2.69-3-6-3z" />
                </svg>
                Doctors
              </NavLink>

              <NavLink
                to="/admin/reviews"
                onClick={closeSidebar}
                className={subNavLinkClasses}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5h14v10H7l-2 2V5z" />
                </svg>
                Reviews
              </NavLink>
            </NavGroup>

            {/* Finance */}
            <NavGroup title="Finance & Billing" groupName="Finance">
              <NavLink
                to="/admin/billing"
                onClick={closeSidebar}
                className={subNavLinkClasses}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M7 17h10" />
                </svg>
                Subscription & Billing
              </NavLink>

              {plan?.allowOnlinePayments && (
                <NavLink
                  to="/admin/payments"
                  onClick={closeSidebar}
                  className={subNavLinkClasses}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V4m0 12v2m8-8a8 8 0 11-16 0 8 8 0 0116 0z" />
                  </svg>
                  Payments
                </NavLink>
              )}
            </NavGroup>

            {/* Analytics */}
            {plan?.enableAuditLogs && (
              <NavGroup title="Analytics" groupName="Analytics">
                <NavLink
                  to="/admin/analytics/bookings"
                  onClick={closeSidebar}
                  className={subNavLinkClasses}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18M7 15l3-3 3 3 4-6" />
                  </svg>
                  Bookings Analytics
                </NavLink>

                <NavLink
                  to="/admin/analytics/slots-usage"
                  onClick={closeSidebar}
                  className={subNavLinkClasses}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3v18h18M7 17h4M7 13h8M7 9h6" />
                  </svg>
                  Slots Analytics
                </NavLink>
              </NavGroup>
            )}

            {/* Platform */}
            <NavGroup title="Platform" groupName="Platform">
              <NavLink
                to="/admin/settings"
                onClick={closeSidebar}
                className={subNavLinkClasses}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317a1 1 0 011.35-.447l.39.195a1 1 0 01.518.874V7.34a5.001 5.001 0 013.09 3.09h1.401a1 1 0 01.874.518l.195.39a1 1 0 01-.447 1.35l-1.184.592a5.002 5.002 0 01-1.664 2.878l.002 1.402a1 1 0 01-.518.874l-.39.195a1 1 0 01-1.35-.447l-.592-1.184a5.001 5.001 0 01-3.09-3.09L6.66 14.66a1 1 0 01-.874-.518l-.195-.39a1 1 0 01.447-1.35l1.184-.592a5.001 5.001 0 012.878-1.664L10.325 4.317z" />
                </svg>
                Settings
              </NavLink>

              <NavLink
                to="/admin/audit-logs"
                onClick={closeSidebar}
                className={subNavLinkClasses}
              >
                <span className="w-5 h-5 inline-flex items-center justify-center rounded-full border border-white/60 text-sm font-semibold">
                  Ⓛ
                </span>
                Audit Logs
              </NavLink>
            </NavGroup>
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 pt-6 mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-medium shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Clinic Admin
          </span>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8">
          {/* ✅ RENDER CHILDREN FOR COMPATIBILITY WITH YOUR APP.JSX */}
          {children}
        </main>
      </div>
    </div>
  );
}
  