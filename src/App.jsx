import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import 'react-datepicker/dist/react-datepicker.css';

// --- AUTH ---
import SuperAdminLogin from './features/auth/SuperAdminLogin.jsx';
import DoctorLogin from './features/auth/DoctorLogin.jsx';
import UserLogin from './features/auth/UserLogin.jsx';
import UserSignup from './features/auth/UserSignup.jsx';
import ForgotPassword from './features/auth/ForgotPassword.jsx';
import ResetPassword from './features/auth/ResetPassword.jsx';
import NotFoundPage from './pages/NotFoundPage';

// --- SUPER ADMIN ---
import SuperAdminDashboard from './features/superAdmin/SuperAdminDashboard.jsx';
import ClinicsPage from './features/superAdmin/ClinicsPage.jsx';
import ClinicEditPage from './features/superAdmin/ClinicEditPage.jsx';
import ClinicAdminsPage from './features/superAdmin/ClinicAdminsPage.jsx';
import EditClinicAdminPage from './features/superAdmin/EditClinicAdminPage.jsx';
import SuperAdminAnalyticsPage from './features/superAdmin/SuperAdminAnalyticsPage.jsx';
import PlansPage from './features/superAdmin/PlansPage.jsx';

// --- CLINIC ADMIN ---
import ClinicAdminDashboard from './features/clinicAdmin/ClinicAdminDashboard.jsx';
import BookingsPage from './features/clinicAdmin/BookingsPage.jsx';
import SlotsPage from './features/clinicAdmin/SlotsPage.jsx';
import PatientHistoryPage from './features/clinicAdmin/PatientHistoryPage.jsx';
import ClinicSettingsPage from './features/clinicAdmin/ClinicSettingsPage.jsx';
import DoctorsPage from './features/clinicAdmin/DoctorsPage.jsx';
import PaymentsPage from './features/clinicAdmin/PaymentsPage.jsx';
import ReviewsPage from './features/clinicAdmin/ReviewsPage.jsx';
import AuditLogsPage from './features/clinicAdmin/AuditLogsPage.jsx';
import ClinicAdminBookingsAnalyticsPage from './features/clinicAdmin/ClinicAdminBookingsAnalyticsPage.jsx';
import ClinicAdminSlotsUsagePage from './features/clinicAdmin/ClinicAdminSlotsUsagePage.jsx';
import BillingPage from './features/clinicAdmin/BillingPage.jsx';
import ClinicAppointmentsPage from './features/clinicAdmin/ClinicAppointmentsPage.jsx';
import ClinicSlotManager  from './features/clinicAdmin/ClinicSlotManager.jsx';

// --- DOCTOR ---
import DoctorDashboard from './features/doctor/DoctorDashboard.jsx';
import DoctorAppointmentsPage from './features/doctor/DoctorAppointmentsPage.jsx';
import DoctorProfilePage from './features/doctor/DoctorProfilePage.jsx';
import MyReviewsPage from './features/doctor/MyReviewsPage.jsx';

// --- USER / PUBLIC ---
import LandingPage from './features/user/LandingPage.jsx';
import UserBookingPage from './features/user/UserBookingPage.jsx';
import MyAppointmentsPage from './features/user/MyAppointmentsPage.jsx';
import UserProfilePage from './features/user/UserProfilePage.jsx';
import ClinicPublicPage from './features/user/ClinicPublicPage.jsx';
import ClinicDetailPage from './features/user/ClinicDetailPage.jsx'
// ✅ PAYMENT SUCCESS
import PaymentSuccessPage from './features/payment/PaymentSuccessPage.jsx';

// --- COMPONENTS ---
import Loader from './components/Loader.jsx';
import OrganizationRegisterPage from './features/public/OrganizationRegisterPage.jsx';
import PricingPage from './features/public/PricingPage.jsx';

// ✅ NEW: Admin context
import { AdminProvider } from './context/AdminContext.jsx';

// ---------- GUARD COMPONENT ----------
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

  // 1. CHECK LOGIN STATUS
  if (!token || !user) {
    let redirectPath = '/login'; // Default for Users

    // Smart Redirect based on intended path
    if (location.pathname.startsWith('/super-admin')) {
      redirectPath = '/super-admin/login';
    } else if (location.pathname.startsWith('/doctor')) {
      redirectPath = '/doctor/login';
    } else if (location.pathname.startsWith('/admin')) {
      redirectPath = '/admin/login';
    }

    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // 2. CHECK ROLE PERMISSIONS
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

// ---------- APP CONTENT ----------
function AppContent() {
  return (
    <BrowserRouter>
      {/* Global Notification Toaster */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '14px',
            borderRadius: '10px',
            padding: '10px 14px',
            background: '#ffffff',
            color: '#1f2933',
            boxShadow:
              '0 10px 15px -3px rgba(15, 23, 42, 0.15), 0 4px 6px -4px rgba(15, 23, 42, 0.12)',
          },
          success: {
            duration: 2500,
            style: { borderLeft: '4px solid #16a34a' },
            iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
          },
          error: {
            duration: 4000,
            style: { borderLeft: '4px solid #dc2626' },
            iconTheme: { primary: '#dc2626', secondary: '#ffffff' },
          },
        }}
      />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/doctors/:doctorId/book" element={<UserBookingPage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/visit/:clinicId" element={<ClinicPublicPage />} />
        <Route path="/register" element={<OrganizationRegisterPage />} />
<Route path="/clinics/:clinicId" element={<ClinicDetailPage />} />
        {/* LOGIN ROUTES */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/admin/login" element={<SuperAdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* PAYMENT SUCCESS */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />

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
        <Route
          path="/super-admin/audit-logs"
          element={
            <RequireRole allowedRoles={['SUPER_ADMIN']}>
              <AuditLogsPage apiUrl="/super-admin/audit-logs" />
            </RequireRole>
          }
        />
        <Route
          path="/super-admin/analytics"
          element={
            <RequireRole allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminAnalyticsPage />
            </RequireRole>
          }
        />
        <Route
          path="/super-admin/plans"
          element={
            <RequireRole allowedRoles={['SUPER_ADMIN']}>
              <PlansPage />
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
        <Route
          path="/doctor/reviews"
          element={
            <RequireRole allowedRoles={['DOCTOR']}>
              <MyReviewsPage />
            </RequireRole>
          }
        />

        {/* ✅ CLINIC ADMIN ROUTES WRAPPED WITH ADMIN PROVIDER */}
        <Route
          path="/admin/*"
          element={
            <RequireRole allowedRoles={['ADMIN']}>
              <AdminProvider>
                <Routes>
                  <Route path="dashboard" element={<ClinicAdminDashboard />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="slots" element={<SlotsPage />} />
                       <Route path="manage" element={<ClinicSlotManager />} /> 
                  <Route path="doctors" element={<DoctorsPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                  <Route path="settings" element={<ClinicSettingsPage />} />
                  <Route
                    path="patients/:userId/history"
                    element={<PatientHistoryPage />}
                  />
                   <Route path="appointments" element={<ClinicAppointmentsPage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route
                    path="audit-logs"
                    element={<AuditLogsPage apiUrl="/admin/audit-logs" />}
                  />
                  <Route
                    path="analytics/slots-usage"
                    element={<ClinicAdminSlotsUsagePage />}
                  />
                  <Route
                    path="analytics/bookings"
                    element={<ClinicAdminBookingsAnalyticsPage />}
                  />
                  <Route path="billing" element={<BillingPage />} />
                </Routes>
              </AdminProvider>
            </RequireRole>
          }
        />

        {/* PROTECTED USER ROUTES */}
        <Route
          path="/my-appointments"
          element={
            <RequireRole allowedRoles={['USER']}>
              <MyAppointmentsPage />
            </RequireRole>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireRole allowedRoles={['USER']}>
              <UserProfilePage />
            </RequireRole>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
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
