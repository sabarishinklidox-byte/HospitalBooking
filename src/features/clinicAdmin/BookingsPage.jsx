// src/features/admin/BookingsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    date: '',
    doctorId: '',
    status: '',
  });

  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/appointments', {
        params: {
          date: filters.date || undefined,
          doctorId: filters.doctorId || undefined,
          status: filters.status || undefined,
        },
      });
      setBookings(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const openDetails = async (id) => {
    try {
      setSelectedBookingId(id);
      setDetails(null);
      setDetailsLoading(true);
      const res = await api.get(`/admin/appointments/${id}`);
      setDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load booking details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedBookingId(null);
    setDetails(null);
  };

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/appointments/${id}/status`, { status });
      await fetchBookings();
      if (selectedBookingId === id) {
        const res = await api.get(`/admin/appointments/${id}`);
        setDetails(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/appointments/${id}/cancel`);
      await fetchBookings();
      if (selectedBookingId === id) {
        const res = await api.get(`/admin/appointments/${id}`);
        setDetails(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ClinicAdminLayout>
      <div className="w-full px-3 sm:px-6">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight text-center sm:text-left"
          style={{ color: 'var(--color-primary)' }}
        >
          Bookings
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center sm:text-left">
            {error}
          </p>
        )}

        {/* Filters */}
        <form
          onSubmit={applyFilters}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-4"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
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

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Doctor ID
            </label>
            <input
              name="doctorId"
              className="input w-full"
              value={filters.doctorId}
              onChange={handleFilterChange}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
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
              <option value="NO_SHOW">No-show</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="btn-primary w-full py-2.5 rounded-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Apply
            </button>
          </div>
        </form>

        {/* List */}
        {loading ? (
          <Loader />
        ) : bookings.length === 0 ? (
          <p className="text-sm text-gray-500">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Date &amp; Time
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Patient
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Doctor
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t">
                    {/* Date & Time */}
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900">
                        {b.dateFormatted || b.date}
                      </div>
                      <div className="text-xs text-gray-500">
                        {b.timeFormatted || b.time}
                      </div>
                    </td>

                    {/* Patient Info */}
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900">
                        {b.patientName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {b.patientPhone}
                      </div>
                      {b.userId && (
                        <Link
                          to={`/admin/patients/${b.userId}/history`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View history
                        </Link>
                      )}
                    </td>

                    {/* Doctor Info */}
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900">
                        {b.doctorName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {b.doctorSpecialization}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => openDetails(b.id)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        View
                      </button>
                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          disabled={actionLoading}
                          className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Booking details modal */}
        <Modal
          isOpen={!!selectedBookingId}
          onClose={closeDetails}
          title="Booking Details"
        >
          {detailsLoading ? (
            <Loader />
          ) : !details ? (
            <p className="text-center text-gray-500">No details found.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {details.patient?.name || 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {details.patient?.phone || 'No phone'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {details.doctor?.name || 'Unknown'}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {details.doctor?.speciality ||
                      details.doctor?.specialization ||
                      'General'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date &amp; Time
                    </p>
                    <p className="font-semibold text-gray-900">
                      {details.dateFormatted ||
                        (details.slot?.date &&
                          new Date(details.slot.date).toLocaleDateString())}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {details.timeFormatted || details.slot?.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${
                        details.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : details.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {details.status}
                    </span>
                  </div>
                </div>
              </div>

              {details.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </p>
                  <div className="mt-1 p-3 bg-yellow-50 text-yellow-900 rounded-lg text-xs border border-yellow-100">
                    {details.notes}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                {details.status !== 'COMPLETED' && (
                  <button
                    onClick={() => updateStatus(details.id, 'COMPLETED')}
                    disabled={actionLoading}
                    className="btn-primary px-3 py-2 text-xs rounded disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Mark Completed
                  </button>
                )}
                {details.status !== 'NO_SHOW' && (
                  <button
                    onClick={() => updateStatus(details.id, 'NO_SHOW')}
                    disabled={actionLoading}
                    className="px-3 py-2 text-xs rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
                  >
                    Mark No-show
                  </button>
                )}
                {details.status !== 'CANCELLED' && (
                  <button
                    onClick={() => cancelBooking(details.id)}
                    disabled={actionLoading}
                    className="px-3 py-2 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ClinicAdminLayout>
  );
}
