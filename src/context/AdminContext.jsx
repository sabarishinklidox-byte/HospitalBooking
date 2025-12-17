// src/context/AdminContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { ENDPOINTS } from '../lib/endpoints';

const AdminContext = createContext(null);

export const useAdminContext = () => useContext(AdminContext);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ shared unread notifications count
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const refreshUnread = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN.NOTIFICATIONS_UNREAD_COUNT);
      setUnreadNotifs(res.data?.count || 0);
    } catch (e) {
      // silent
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN.PROFILE);
      setAdmin(res.data.admin);
      setClinic(res.data.clinic);
      setPlan(res.data.plan || res.data.clinic?.plan || null);
    } catch (e) {
      console.error('Admin context error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ load unread once after login/profile is available
  useEffect(() => {
    refreshUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      admin,
      clinic,
      plan,
      loading,
      reloadAdmin: load,

      // ✅ expose unread + refresher
      unreadNotifs,
      refreshUnread,
    }),
    [admin, clinic, plan, loading, unreadNotifs]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
