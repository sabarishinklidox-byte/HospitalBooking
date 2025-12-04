import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';


export default function ClinicAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
 
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/dashboard'); // backend: getAdminDashboard
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <ClinicAdminLayout>
      <div className="w-full px-3 sm:px-6">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight text-center sm:text-left"
          style={{ color: 'var(--color-primary)' }}
        >
          Clinic Admin Dashboard
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center sm:text-left">
            {error}
          </p>
        )}

        {loading || !stats ? (
          <Loader />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <div className="p-4 sm:p-5 rounded-xl shadow bg-white border-l-4 border-blue-500">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
                  Today&apos;s Appointments
                </h2>
                <p
                  className="text-3xl sm:text-4xl font-extrabold mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {stats.todayAppointments || 0}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl shadow bg-white border-l-4 border-emerald-500">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
                  Upcoming Appointments
                </h2>
                <p
                  className="text-3xl sm:text-4xl font-extrabold mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {stats.upcomingAppointments || 0}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl shadow bg-white border-l-4 border-indigo-500">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
                  Active Doctors
                </h2>
                <p
                  className="text-3xl sm:text-4xl font-extrabold mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {stats.activeDoctors || 0}
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-xl shadow bg-white border-l-4 border-amber-500">
                <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
                  Today&apos;s Revenue
                </h2>
                <p
                  className="text-2xl sm:text-3xl font-extrabold mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  ₹{stats.todayRevenue || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: ₹{stats.totalRevenue || 0}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </ClinicAdminLayout>
  );
}
