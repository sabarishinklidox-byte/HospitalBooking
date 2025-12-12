// src/features/superAdmin/SuperAdminAnalyticsPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import Loader from '../../components/Loader.jsx';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import { ENDPOINTS } from '../../lib/endpoints';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function SuperAdminAnalyticsPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  const [stats, setStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [clinicStats, setClinicStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.SUPER_ADMIN.GLOBAL_BOOKINGS, {
        params: { startDate, endDate },
      });
      setStats(res.data.data || []);
      setSummary(res.data.summary || null);
      setClinicStats(res.data.clinics || []);
    } catch (err) {
      console.error('Failed to load global analytics', err);
      setStats([]);
      setSummary(null);
      setClinicStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    fetchStats();
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📊 Platform Bookings & Patients
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Global daily counts of patients and bookings for the selected date
              range.
            </p>
          </div>
        </div>

        {/* Summary tiles */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Total bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalBookings || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Total patients
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalPatients || 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Avg bookings / day
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.avgBookingsPerDay
                  ? summary.avgBookingsPerDay.toFixed(1)
                  : 0}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Active clinics
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.uniqueClinics || 0}
              </p>
            </div>
          </div>
        )}

        {/* Date filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="py-20">
            <Loader />
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            {stats.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                No data for the selected period.
              </p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalBookings"
                      name="Bookings"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalPatients"
                      name="Patients"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Per-clinic breakdown */}
        {clinicStats.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Bookings by clinic
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                      Clinic
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">
                      Bookings
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">
                      Patients
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clinicStats.map((c) => (
                    <tr key={c.clinicId}>
                      <td className="px-3 py-2 text-gray-800 font-medium">
                        {c.clinicName}
                      </td>
                      <td className="px-3 py-2 text-right">{c.bookings}</td>
                      <td className="px-3 py-2 text-right">{c.patients}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
}
