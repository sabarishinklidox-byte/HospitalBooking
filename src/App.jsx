// src/App.jsx
import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { store } from './store';
import { restoreAuth } from './features/auth/authSlice';

import SuperAdminLogin from './features/auth/SuperAdminLogin.jsx';
import DoctorLogin from './features/auth/DoctorLogin.jsx';
import UserLogin from './features/auth/UserLogin.jsx';
import UserSignup from './features/auth/UserSignup.jsx';

import SuperAdminDashboard from './features/superAdmin/SuperAdminDashboard.jsx';
import ClinicsPage from './features/superAdmin/ClinicsPage.jsx';
import ClinicEditPage from './features/superAdmin/ClinicEditPage.jsx';
import ClinicAdminsPage from './features/superAdmin/ClinicAdminsPage.jsx';
import EditClinicAdminPage from './features/superAdmin/EditClinicAdminPage.jsx';

import ClinicAdminDashboard from './features/clinicAdmin/ClinicAdminDashboard.jsx';
import BookingsPage from './features/clinicAdmin/BookingsPage.jsx';
import SlotsPage from './features/clinicAdmin/SlotsPage.jsx';
import PatientHistoryPage from './features/clinicAdmin/PatientHistoryPage.jsx';
import ClinicSettingsPage from './features/clinicAdmin/ClinicSettingsPage.jsx';
import DoctorsPage from './features/clinicAdmin/DoctorsPage.jsx';
import PaymentsPage from './features/clinicAdmin/PaymentsPage.jsx';

import DoctorDashboard from './features/doctor/DoctorDashboard.jsx';
import DoctorAppointmentsPage from './features/doctor/DoctorAppointmentsPage.jsx';
import DoctorProfilePage from './features/doctor/DoctorProfilePage.jsx';

import LandingPage from './features/user/LandingPage.jsx';
import UserBookingPage from './features/user/UserBookingPage.jsx';

import Loader from './components/Loader.jsx';
import MyAppointmentsPage from './features/user/MyAppointmentsPage';
import UserProfilePage from './features/user/UserProfilePage.jsx';
import ClinicPublicPage from './features/user/ClinicPublicPage';

// ---------- GUARD ----------
function RequireRole({ allowedRoles, children }) {
  const { token, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!token || !user) {
    const isDoctorRoute = location.pathname.startsWith('/doctor/');
    return (
      <Navigate
        to={isDoctorRoute ? '/doctor/login' : '/super-admin/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/super-admin/login" replace />;
  }

  return children;
}

// ---------- APP CONTENT ----------
function AppContent() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser && !token && !user) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch(restoreAuth({ token: savedToken, user: userData }));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch, token, user]);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC USER ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/doctors/:doctorId/book" element={<UserBookingPage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />

        {/* AUTH ROUTES FOR STAFF */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />

        {/* SUPER ADMIN ROUTES */}
        <Route
          path="/super-admin/dashboard"
          element={
            <RequireRole allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/super-admin/clinics"
          element={
            <RequireRole allowedRoles={['SUPER_ADMIN']}>
              <ClinicsPage />
            </RequireRole>
          }
        />
        <Route
          path="/super-admin/clinics/:id/edit"
          element={
            <RequireRole allowedRoles={['SUPER_ADMIN']}>
              <ClinicEditPage />
            </RequireRole>
          }
        />
        <Route
          path="/super-admin/admins"
          element={
            <RequireRole allowedRoles={['SUPER_ADMIN']}>
              <ClinicAdminsPage />
            </RequireRole>
          }
        />
        <Route
          path="/super-admin/admins/:id/edit"
          element={
            <RequireRole allowedRoles={['SUPER_ADMIN']}>
              <EditClinicAdminPage />
            </RequireRole>
          }
        />

        {/* DOCTOR ROUTES */}
        <Route
          path="/doctor/dashboard"
          element={
            <RequireRole allowedRoles={['DOCTOR']}>
              <DoctorDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <RequireRole allowedRoles={['DOCTOR']}>
              <DoctorAppointmentsPage />
            </RequireRole>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <RequireRole allowedRoles={['DOCTOR']}>
              <DoctorProfilePage />
            </RequireRole>
          }
        />

        {/* CLINIC ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <ClinicAdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <BookingsPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/slots"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <SlotsPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <DoctorsPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <PaymentsPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <ClinicSettingsPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/patients/:userId/history"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <PatientHistoryPage />
            </RequireRole>
          }
        />




{/* Protected User Route */}
<Route 
  path="/my-appointments" 
  element={
    <RequireRole allowedRoles={['USER']}>
      <MyAppointmentsPage />
    </RequireRole>
  } 
/>
<Route 
  path="/profile" // <--- ADD THIS ROUTE
  element={<RequireRole allowedRoles={['USER']}><UserProfilePage /></RequireRole>} 
/>
 <Route path="/visit/:clinicId" element={<ClinicPublicPage />} />
        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

// ---------- ROOT APP ----------
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
