// src/features/doctor/DoctorDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({
    todayCount: 0,
    upcomingCount: 0,
    completedToday: 0,
    isGoogleConnected: false // Track sync status
  });
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Stats and Profile in parallel
        const [statsRes, profileRes] = await Promise.all([
          api.get(ENDPOINTS.DOCTOR.DASHBOARD_STATS),
          api.get(ENDPOINTS.DOCTOR.PROFILE)
        ]);

        setStats({
          ...statsRes.data,
          // Check if tokens exist in the profile to determine connection status
          isGoogleConnected: !!(profileRes.data.googleRefreshToken || profileRes.data.googleAccessToken)
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  const handleDisconnect = async () => {
  if (!window.confirm("Are you sure you want to disconnect your Google Calendar?")) return;

  try {
    const doctorRes = await api.get(ENDPOINTS.DOCTOR.PROFILE);
    const doctorId = doctorRes.data.id;

    // Call the backend to clear tokens
    await api.post('/doctor/google-calendar/disconnect', { doctorId });

    // Update the UI state
    setStats(prev => ({ ...prev, isGoogleConnected: false }));
    alert("Disconnected successfully!");
  } catch (error) {
    console.error("Disconnect failed:", error);
    alert("Failed to disconnect. Please try again.");
  }
};
const handleGoogleConnect = async () => {
  setIsConnecting(true);
  try {
    const doctorRes = await api.get(ENDPOINTS.DOCTOR.PROFILE);
    const doctorId = doctorRes.data.id;

    // 1. Get the baseURL from your axios instance (http://localhost:5003/api)
    const baseUrl = api.defaults.baseURL;
    
    // 2. Remove "/api" from the end if it exists to get the clean origin (http://localhost:5003)
    const origin = baseUrl.replace(/\/api$/, "");
    
    // 3. Manually build the path exactly as the backend expects (One /api only)
    const fullRedirectUrl = `${origin}/api/doctor/google-calendar/connect?doctorId=${doctorId}`;
    
    console.log("🔗 Doctor Redirect URL:", fullRedirectUrl);
    window.location.href = fullRedirectUrl;
    
  } catch (error) {
    console.error("Connection failed:", error);
    setIsConnecting(false);
  }
};

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('gcal') === 'success') {
    // Trigger a toast notification or alert here
    alert("Google Calendar connected successfully!");
    
    // Clean up the URL so the message doesn't pop up again on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

  if (loading) return <DoctorLayout><Loader /></DoctorLayout>;

  return (
    <DoctorLayout>
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-[#0b3b5e] mb-2">Welcome Back!</h1>
        <p className="text-gray-600 mb-8">
          Here's what's happening with your appointments today, {new Date().toLocaleDateString()}.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 text-xl">📅</div>
            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Today's Appointments</h3>
            <p className="text-4xl font-bold text-blue-700 mt-2">{stats.todayCount}</p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow-sm border border-green-100">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 text-xl">🕒</div>
            <h3 className="text-sm font-semibold text-green-900 uppercase tracking-wide">Upcoming (7 Days)</h3>
            <p className="text-4xl font-bold text-green-700 mt-2">{stats.upcomingCount}</p>
          </div>

          <div className="bg-purple-50 p-6 rounded-2xl shadow-sm border border-purple-100">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 text-xl">✅</div>
            <h3 className="text-sm font-semibold text-purple-900 uppercase tracking-wide">Completed Today</h3>
            <p className="text-4xl font-bold text-purple-700 mt-2">{stats.completedToday}</p>
          </div>
        </div>

        {/* Google Calendar Sync Section */}


{/* Google Calendar Sync Section */}
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-100 mb-8">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl">
        {stats.isGoogleConnected ? "✅" : "🗓️"}
      </div>
      <div>
        <h4 className="font-bold text-lg text-blue-900">
          Google Calendar Sync {stats.isGoogleConnected && <span className="text-green-600 text-sm ml-2">(Active)</span>}
        </h4>
        <p className="text-sm text-blue-700">
          {stats.isGoogleConnected 
            ? "Your appointments are automatically syncing to your personal calendar." 
            : "Connect your account to see your medical schedule on your phone."}
        </p>
      </div>
    </div>

    <div className="min-w-[220px]">
      {!stats.isGoogleConnected ? (
        <button
          disabled={isConnecting}
          onClick={handleGoogleConnect}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isConnecting ? "Redirecting..." : "🔗 Connect Google Calendar"}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-full text-center py-2 px-4 bg-white border border-green-200 rounded-xl text-green-700 font-medium text-sm shadow-sm">
            Synced Successfully
          </div>
          <button
            onClick={handleDisconnect}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors flex items-center gap-1"
          >
            <span>🚫</span> Disconnect Calendar
          </button>
        </div>
      )}
    </div>
  </div>
</div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Schedule</h3>
            <p className="text-gray-600 mb-6 text-sm">View and edit your patient appointments for the week.</p>
            <Link 
              to="/doctor/appointments"
              className="inline-block bg-[#0b3b5e] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#092c47] transition"
            >
              View Today's Schedule →
            </Link>
          </div>

              
        </div>
      </div>
    </DoctorLayout>
  );
}