// src/features/doctor/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import Loader from '../../components/Loader.jsx';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({
    todayCount: 0,
    upcomingCount: 0,
    completedToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Call the new endpoint
        const res = await api.get('/doctor/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <DoctorLayout><Loader /></DoctorLayout>;

  return (
    <DoctorLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0b3b5e] mb-2">Welcome Back!</h1>
        <p className="text-gray-600 mb-8">
          Here's what's happening with your appointments today, {new Date().toLocaleDateString()}.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Today */}
          <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              📅
            </div>
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Today's Appointments</h3>
            <p className="text-4xl font-bold text-blue-700 mt-2">{stats.todayCount}</p>
          </div>

          {/* Card 2: Upcoming */}
          <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
              🕒
            </div>
            <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wide">Upcoming (7 Days)</h3>
            <p className="text-4xl font-bold text-green-700 mt-2">{stats.upcomingCount}</p>
          </div>

          {/* Card 3: Completed */}
          <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              ✅
            </div>
            <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wide">Completed Today</h3>
            <p className="text-4xl font-bold text-purple-700 mt-2">{stats.completedToday}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Today's Appointments</h3>
            <p className="text-gray-600 mb-6 text-sm">Manage your appointments for today. Mark as completed, no-show, or add notes.</p>
            <Link 
              to="/doctor/appointments?date=" // You can pre-fill date if you want
              className="inline-block bg-[#0b3b5e] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#092c47] transition"
            >
              View Today's Schedule →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
             <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Stats</h3>
             <div className="flex justify-around mt-4">
                <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.todayCount}</p>
                    <p className="text-xs text-gray-500 uppercase">Total Today</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-gray-900">{stats.completedToday}</p>
                    <p className="text-xs text-gray-500 uppercase">Completed</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
