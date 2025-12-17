// src/lib/endpoints.js
export const ENDPOINTS = {
   PAYMENT: {
    CREATE_CHECKOUT_SESSION: '/payment/create-checkout-session',
    VERIFY_SESSION: '/payment/verify-session',
  },

  PUBLIC: {
    CLINICS: '/public/clinics',
    CLINIC_BY_ID: (id) => `/public/clinics/${id}`,
    CLINIC_DOCTORS: (clinicId) => `/public/clinics/${clinicId}/doctors`,
    DOCTOR_BY_ID: (id) => `/public/doctors/${id}`,
    DOCTOR_SLOTS: (doctorId) => `/public/doctors/${doctorId}/slots`,
    FORGOT_PASSWORD: '/public/forgot-password',
    RESET_PASSWORD: '/public/reset-password',
    PLANS: '/public/plans',
     GOOGLE_PLACE_ID: "/public/google/place-id",
     ORGANIZATION_REGISTER: "/public/organizations/register",
  },

  USER: {
    SIGNUP: '/user/signup',
    LOGIN: '/user/login',
    APPOINTMENTS: '/user/appointments',
    APPOINTMENT_BY_ID: (id) => `/user/appointments/${id}`,
    PROFILE: '/user/profile',
    HISTORY: '/user/history',
    CANCEL_APPOINTMENT: (id) => `/user/appointments/${id}/cancel`,
    RESCHEDULE_APPOINTMENT: (id) => `/user/appointments/${id}/reschedule`,
    REVIEWS: '/user/reviews',
    DOCTOR_REVIEWS: (doctorId) => `/user/doctors/${doctorId}/reviews`,
  },

  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',

    DOCTORS: '/admin/doctors',
    DOCTOR_BY_ID: (id) => `/admin/doctors/${id}`,
    DOCTOR_TOGGLE_ACTIVE: (id) => `/admin/doctors/${id}/toggle`,

    SLOTS: '/admin/slots',
    SLOTS_BULK: '/admin/slots/bulk',
    SLOT_BY_ID: (id) => `/admin/slots/${id}`,

    APPOINTMENTS: '/admin/appointments',
    APPOINTMENT_BY_ID: (id) => `/admin/appointments/${id}`,
    APPOINTMENT_CANCEL: (id) => `/admin/appointments/${id}/cancel`,
    APPOINTMENT_STATUS: (id) => `/admin/appointments/${id}/status`,
    APPOINTMENTS_EXPORT_EXCEL: '/admin/appointments/export/excel',
    APPOINTMENTS_EXPORT_PDF: '/admin/appointments/export/pdf',

    PAYMENTS: '/admin/payments',
    PAYMENTS_SUMMARY: '/admin/payments/summary',

    PATIENT_HISTORY: (userId) => `/admin/patients/${userId}/history`,
// ENDPOINTS.ADMIN
 NOTIFICATIONS: '/admin/notifications',
NOTIFICATIONS_UNREAD_COUNT: '/admin/notifications/unread-count',
    NOTIFICATIONS_MARK_ALL_READ: '/admin/notifications/mark-all-read',
    NOTIFICATIONS_MARK_READ: '/admin/notifications/mark-read',
NOTIFICATIONS_MARK_READ_BY_ENTITY: '/admin/notifications/mark-read-by-entity',
    PROFILE: '/admin/profile',
    CLINIC_SETTINGS: '/admin/clinic',
    CLINIC_GATEWAY: '/admin/clinic/gateway',

    REVIEWS: '/admin/reviews',
    AUDIT_LOGS: '/admin/audit-logs',
    SUBSCRIPTION_UPGRADE: "/admin/subscription/upgrade",

    ANALYTICS_BOOKINGS: '/admin/analytics/bookings',
    ANALYTICS_SLOTS_USAGE: '/admin/analytics/slots-usage',
    GATEWAY_STRIPE: "/admin/gateway/stripe",
     CLINIC_GOOGLE_RATING_REFRESH: "/admin/clinic/google-rating/refresh",
      DOCTOR_SLOTS: (doctorId) => `/admin/doctors/${doctorId}/slots`,
     // in ENDPOINTS.ADMIN


    

  },

  // 🔹 Add this block
  CLINIC_ADMIN: {
    AUDIT_LOGS: '/clinic-admin/audit-logs',
  },

  DOCTOR: {
    LOGIN: '/doctor/login',
    PROFILE: '/doctor/profile',
    SLOTS: '/doctor/slots',
    APPOINTMENTS: '/doctor/appointments',
    APPOINTMENT_STATUS: (id) => `/doctor/appointments/${id}/status`,
    APPOINTMENT_DETAILS: (id) => `/doctor/appointments/${id}`,
    DASHBOARD_STATS: '/doctor/dashboard-stats',
    REVIEWS: '/doctor/reviews',
    UPDATE_PRESCRIPTION: (id) => `/doctor/appointments/${id}/prescription`,
  },
SUPER_ADMIN: {
  SETUP: '/super-admin/setup',
  LOGIN: '/super-admin/login',

  CLINICS: '/super-admin/clinics',
  CLINIC_BY_ID: (id) => `/super-admin/clinics/${id}`,
  CLINIC_STATUS: (clinicId) => `/super-admin/clinics/${clinicId}/status`,
  CLINIC_AUDIT_PERMISSION: (clinicId) =>
    `/super-admin/clinics/${clinicId}/audit-permission`,
  CLINIC_LINK_CLICK: (clinicId) =>
    `/super-admin/clinics/${clinicId}/link-click`,

  ADMINS: '/super-admin/admins',
  ADMIN_BY_ID: (id) => `/super-admin/admins/${id}`,

  ANALYTICS: '/super-admin/analytics',
  GLOBAL_BOOKINGS: '/super-admin/analytics/global-bookings',
     CLINIC_UPLOAD: '/super-admin/clinics/upload',
         PLANS: '/super-admin/plans',
          PLAN_BY_ID: (id) => `/super-admin/plans/${id}`,
            AUDIT_LOGS: '/super-admin/audit-logs',
          
}

};
