import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

// 🔹 Animation presets
const cardAnim = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export default function ClinicAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(ENDPOINTS.ADMIN.DASHBOARD);
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

  const diff = (today, yesterday) => (today || 0) - (yesterday || 0);
  const dirClass = (d) =>
    d > 0 ? 'text-emerald-600' : d < 0 ? 'text-red-600' : 'text-gray-400';
  const arrow = (d) => (d > 0 ? '▲' : d < 0 ? '▼' : '■');

  return (
    <ClinicAdminLayout>
      <div className="w-full px-4 sm:px-8 pb-10">
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-8 tracking-tight"
          style={{ color: 'var(--color-primary)' }}
        >
          Clinic Admin Dashboard
        </h1>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading || !stats ? (
          <Loader />
        ) : (
          <>
            {/* FIRST ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <BigCard
                title="Today's Appointments"
                value={stats.todayAppointments || 0}
                border="border-blue-500"
                footer={
                  typeof stats.yesterdayAppointments === 'number' && (
                    <span
                      className={`text-sm font-semibold ${dirClass(
                        diff(stats.todayAppointments, stats.yesterdayAppointments)
                      )}`}
                    >
                      {arrow(
                        diff(stats.todayAppointments, stats.yesterdayAppointments)
                      )}{' '}
                      {Math.abs(
                        diff(stats.todayAppointments, stats.yesterdayAppointments)
                      )}{' '}
                      vs yesterday
                    </span>
                  )
                }
              />

              <BigCard
                title="Upcoming Appointments"
                value={stats.upcomingAppointments || 0}
                border="border-emerald-500"
              />

              <BigCard
                title="Active Doctors"
                value={stats.activeDoctors || 0}
                border="border-indigo-500"
              />

              <BigCard
                title="Today's Revenue"
                value={`₹${stats.todayRevenue || 0}`}
                border="border-amber-500"
                footer={
                  <div className="space-y-1">
                    {typeof stats.yesterdayRevenue === 'number' && (
                      <p
                        className={`text-sm font-semibold ${dirClass(
                          diff(stats.todayRevenue, stats.yesterdayRevenue)
                        )}`}
                      >
                        {arrow(diff(stats.todayRevenue, stats.yesterdayRevenue))}{' '}
                        ₹{Math.abs(
                          diff(stats.todayRevenue, stats.yesterdayRevenue)
                        )}{' '}
                        vs yesterday
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Total: ₹{stats.totalRevenue || 0}
                    </p>
                  </div>
                }
              />
            </div>

            {/* SECOND ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <StatCard label="Total Bookings" value={stats.totalBookings || 0} border="border-slate-500" />
              <StatCard label="Pending" value={stats.totalPending || 0} border="border-yellow-500" />
              <StatCard label="Confirmed" value={stats.totalConfirmed || 0} border="border-green-500" />
              <StatCard label="Completed" value={stats.totalCompleted || 0} border="border-blue-500" />
              <StatCard label="No‑Show" value={stats.totalNoShow || 0} border="border-orange-500" />
              <StatCard label="Cancelled" value={stats.totalCancelled || 0} border="border-red-500" />
            </div>
          </>
        )}
      </div>
    </ClinicAdminLayout>
  );
}

// 🔹 BIG KPI CARD
function BigCard({ title, value, border, footer }) {
  return (
    <motion.div
      variants={cardAnim}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.04 }}
      className={`relative p-6 sm:p-8 rounded-2xl bg-white shadow-lg border-l-8 ${border}`}
    >
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
        {title}
      </h2>
      <p
        className="mt-4 text-4xl sm:text-5xl font-extrabold"
        style={{ color: 'var(--color-primary)' }}
      >
        {value}
      </p>
      {footer && <div className="mt-4">{footer}</div>}
    </motion.div>
  );
}

// 🔹 SMALL STAT CARD
function StatCard({ label, value, border }) {
  return (
    <motion.div
      variants={cardAnim}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6 }}
      className={`p-5 sm:p-6 rounded-2xl bg-white shadow-md border-l-6 ${border}`}
    >
      <h3 className="text-xs font-semibold text-gray-500 uppercase">
        {label}
      </h3>
      <p
        className="mt-3 text-3xl font-extrabold"
        style={{ color: 'var(--color-primary)' }}
      >
        {value}
      </p>
    </motion.div>
  );
}
