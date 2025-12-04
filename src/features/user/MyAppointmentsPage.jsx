// src/features/user/MyAppointmentsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // Track which ID is cancelling

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/appointments');
      setAppointments(res.data || []);
    } catch (err) {
      setError('Failed to load your appointments.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Function to cancel appointment
  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setActionLoading(appointmentId);
      // Ensure you have this endpoint in your backend (we will check next)
      await api.patch(`/user/appointments/${appointmentId}/cancel`);
      
      // Refresh list locally to reflect change
      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointmentId ? { ...app, status: 'CANCELLED' } : app
        )
      );
      alert('Appointment cancelled successfully.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

        {loading ? (
          <div className="flex justify-center py-12"><Loader /></div>
        ) : error ? (
          <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 mb-3 text-5xl">📅</div>
            <h3 className="text-lg font-medium text-gray-900">No appointments yet</h3>
            <p className="text-gray-500 mb-6">Book your first consultation with a top doctor.</p>
            <Link to="/" className="px-4 py-2 bg-[#0b3b5e] text-white rounded-lg hover:opacity-90">
              Find a Doctor
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <div 
                key={app.id} 
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-xl">
                    👨‍⚕️
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {app.doctor?.name || 'Unknown Doctor'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {app.clinic?.name} • {app.section || 'General'}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-sm font-medium text-gray-700">
                      <span className="flex items-center gap-1">
                        📅 {app.dateFormatted || (app.slot?.date && new Date(app.slot.date).toLocaleDateString())}
                      </span>
                      <span className="flex items-center gap-1">
                        ⏰ {app.timeFormatted || app.slot?.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status, Price & Actions */}
                <div className="flex flex-row md:flex-col justify-between items-end text-right">
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    {app.slot?.price > 0 && (
                      <p className="font-bold text-gray-900">₹{app.slot.price}</p>
                    )}
                  </div>

                  {/* CANCEL BUTTON */}
                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(app.id)}
                      disabled={actionLoading === app.id}
                      className="mt-3 text-xs font-semibold text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                    >
                      {actionLoading === app.id ? 'Cancelling...' : 'Cancel Appointment'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
