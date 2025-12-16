// src/context/AdminContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { ENDPOINTS } from "../lib/endpoints";

const AdminContext = createContext(null);

export const useAdminContext = () => useContext(AdminContext);

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      // ✅ use existing route: /api/admin/profile
      const res = await api.get(ENDPOINTS.ADMIN.PROFILE); // proxy adds /api
      // backend getAdminProfile must return { admin, clinic, plan }
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

  return (
    <AdminContext.Provider
      value={{
        admin,
        clinic,
        plan,
        loading,
        reloadAdmin: load, // call this after plan/clinic changes
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
