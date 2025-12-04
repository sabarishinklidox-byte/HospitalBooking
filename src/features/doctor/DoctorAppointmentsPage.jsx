// src/features/doctor/DoctorAppointmentsPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    date: '',
    status: '',
  });

  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/doctor/appointments', {
        params: {
          date: filters.date || undefined,
          status: filters.status || undefined,
        },
      });
      setAppointments(res.data || []);
    } catch (err) {
      setError('Failed to load appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const openDetails = async (id) => {
    try {
      setSelectedId(id);
      setDetails(null);
      setDetailsLoading(true);
      const res = await api.get(`/doctor/appointments/${id}`);
      setDetails(res.data);
    } catch (err) {
      console.error(err);
      // Optionally set a small error state for the modal
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedId(null);
    setDetails(null);
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(true);
      await api.patch(`/doctor/appointments/${id}/status`, { status });
      // Refresh list
      await fetchAppointments();
      // Also refresh details if open
      if (selectedId === id) {
        const res = await api.get(`/doctor/appointments/${id}`);
        setDetails(res.data);
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DoctorLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-[#0b3b5e] mb-6">
          My Appointments
        </h1>

        {/* Filters */}
        <form
          onSubmit={applyFilters}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              className="input w-full"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Status
            </label>
            <select
              name="status"
              className="input w-full"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary h-[42px] px-6">
              Apply
            </button>
          </div>
        </form>

        {/* Table */}
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">No appointments found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Date &amp; Time</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Slot</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition">
                      {/* DATE & TIME COLUMN - FIXED */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">
                          {app.dateFormatted ||
                            (app.slot?.date &&
                              new Date(app.slot.date).toLocaleDateString()) ||
                            '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {app.timeFormatted || app.slot?.time || ''}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {app.patientName || app.user?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {app.patientPhone || app.user?.phone || ''}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-gray-700">
                          {app.slot?.time} ({app.slot?.duration}min)
                        </div>
                        {app.slot?.price > 0 ? (
                          <div className="text-xs font-bold text-green-600">
                            ₹{app.slot.price}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">Free</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${
                            app.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : app.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : app.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {app.slot?.price > 0 ? 'Paid' : 'Free'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openDetails(app.id)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={!!selectedId}
          onClose={closeDetails}
          title="Appointment Details"
        >
          {detailsLoading || !details ? (
            <Loader />
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Patient
                  </p>
                  <p className="font-semibold text-gray-900">
                    {details.patient?.name || details.user?.name}
                  </p>
                  <p className="text-gray-600">
                    {details.patient?.phone || details.user?.phone}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {details.patient?.email || details.user?.email}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Slot Info
                  </p>
                  <p className="font-semibold text-gray-900">
                    {details.dateFormatted ||
                      (details.slot?.date &&
                        new Date(details.slot.date).toLocaleDateString())}
                  </p>
                  <p className="text-gray-600">{details.slot?.time}</p>
                  <p className="text-xs text-gray-500">
                    {details.slot?.type === 'PAID'
                      ? `₹${details.slot.price}`
                      : 'Free'}
                  </p>
                </div>
              </div>

              {details.notes && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <p className="text-xs font-bold text-yellow-800 mb-1">
                    Notes from Patient
                  </p>
                  <p className="text-yellow-900">{details.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-gray-500 text-xs">Status: </span>
                  <span className="font-bold text-gray-900">
                    {details.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {details.status !== 'COMPLETED' &&
                    details.status !== 'CANCELLED' && (
                      <button
                        onClick={() => updateStatus(details.id, 'COMPLETED')}
                        disabled={actionLoading}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        Mark Completed
                      </button>
                    )}
                  {details.status !== 'NO_SHOW' &&
                    details.status !== 'CANCELLED' &&
                    details.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateStatus(details.id, 'NO_SHOW')}
                        disabled={actionLoading}
                        className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Mark No Show
                      </button>
                    )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DoctorLayout>
  );
}
