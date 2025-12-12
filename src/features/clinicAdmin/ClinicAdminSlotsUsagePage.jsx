// src/features/clinicAdmin/ClinicAdminSlotsUsagePage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import Loader from '../../components/Loader.jsx';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import { ENDPOINTS } from '../../lib/endpoints';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function ClinicAdminSlotsUsagePage() {
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
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN.ANALYTICS_SLOTS_USAGE, {
        params: { startDate, endDate },
      });
      setStats(res.data.data || []);
    } catch (err) {
      console.error('Failed to load slots usage stats', err);
      setStats([]);
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
    <ClinicAdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📊 Slots & Capacity Usage
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Daily total slots, booked slots, and free slots for your clinic.
            </p>
          </div>
        </div>

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
                No slots found for the selected period.
              </p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="bookedSlots"
                      name="Booked"
                      stackId="a"
                      fill="#2563eb"
                    />
                    <Bar
                      dataKey="freeSlots"
                      name="Free"
                      stackId="a"
                      fill="#16a34a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </ClinicAdminLayout>
  );
}
