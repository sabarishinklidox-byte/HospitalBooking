// src/features/admin/ClinicAdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';
import toast from 'react-hot-toast';

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
      setError(err?.response?.data?.error || 'Failed to load dashboard');
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

  // 🔥 NEW: Calculate utilization
  const totalSlotsToday = (stats?.totalUnbookedSlotsToday || 0) + (stats?.todayAppointments || 0);
  const utilizationRate = totalSlotsToday > 0 
    ? Math.round(((stats?.todayAppointments || 0) / totalSlotsToday) * 100) 
    : 0;

  return (
    <ClinicAdminLayout>
      <div className="w-full px-4 sm:px-8 pb-10">
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight"
          style={{ color: 'var(--color-primary)' }}
        >
          Clinic Admin Dashboard
        </h1>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {loading || !stats ? (
          <Loader />
        ) : (
          <>
            {/* SaaS booking link with copy button */}
            {stats.publicBookingUrl && (
              <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-600">Patient booking link:</span>
                <code className="px-2 py-1 bg-gray-100 rounded text-xs break-all">
                  {stats.publicBookingUrl}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(stats.publicBookingUrl);
                    toast.success('Booking link copied to clipboard');
                  }}
                  className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                >
                  <span>Copy URL</span>
                </button>
              </div>
            )}

            {/* 🔥 FIRST ROW - CORE METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <BigCard
                title="Today's Appointments"
                value={stats.todayAppointments || 0}
                border="border-blue-500"
                footer={
                  typeof stats.yesterdayAppointments === 'number' && (
                    <span
                      className={`text-sm font-semibold ${dirClass(
                        diff(
                          stats.todayAppointments,
                          stats.yesterdayAppointments
                        )
                      )}`}
                    >
                      {arrow(
                        diff(
                          stats.todayAppointments,
                          stats.yesterdayAppointments
                        )
                      )}{' '}
                      {Math.abs(
                        diff(
                          stats.todayAppointments,
                          stats.yesterdayAppointments
                        )
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
                        {arrow(
                          diff(stats.todayRevenue, stats.yesterdayRevenue)
                        )}{' '}
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

            {/* 🔥 SECOND ROW - STATUS BREAKDOWN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
              <StatCard
                label="Total Bookings"
                value={stats.totalBookings || 0}
                border="border-slate-500"
              />
              <StatCard
                label="Pending"
                value={stats.totalPending || 0}
                border="border-yellow-500"
              />
              <StatCard
                label="Confirmed"
                value={stats.totalConfirmed || 0}
                border="border-green-500"
              />
              <StatCard
                label="Completed"
                value={stats.totalCompleted || 0}
                border="border-blue-500"
              />
              <StatCard
                label="No‑Show"
                value={stats.totalNoShow || 0}
                border="border-orange-500"
              />
              <StatCard
                label="Cancelled"
                value={stats.totalCancelled || 0}
                border="border-red-500"
              />
            </div>

            {/* 🔥 THIRD ROW - SLOT UTILIZATION (NEW TOTAL CARD) */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Slot Utilization Today ({utilizationRate}%)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* 🔥 TOTAL UNBOOKED - BIGGEST PRIORITY */}
                <BigCard
                  title="Total Unbooked Slots"
                  value={stats.totalUnbookedSlotsToday || 0}
                  border="border-red-500"
                  footer={
                    <p className="text-sm text-red-200">
                      {stats.openSlotsToday || 0} open + {stats.expiredUnbookedSlotsToday || 0} expired
                    </p>
                  }
                />
                
                <StatCard
                  label="Open Slots Today"
                  value={stats.openSlotsToday || 0}
                  border="border-emerald-500"
                />
                
                <StatCard
                  label="Expired Unbooked"
                  value={stats.expiredUnbookedSlotsToday || 0}
                  border="border-rose-500"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </ClinicAdminLayout>
  );
}

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
