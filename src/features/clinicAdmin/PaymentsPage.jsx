import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, revenuePerDoctor: [] });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState('');

  const [doctors, setDoctors] = useState([]);

  const [filters, setFilters] = useState({
    start: '',
    end: '',
    doctorId: '',
    status: '',
  });

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/admin/doctors');
      setDoctors(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load doctors');
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/payments', {
        params: {
          start: filters.start || undefined,
          end: filters.end || undefined,
          doctorId: filters.doctorId || undefined,
          status: filters.status || undefined,
        },
      });
      setPayments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await api.get('/admin/payments/summary', {
        params: {
          start: filters.start || undefined,
          end: filters.end || undefined,
        },
      });
      setSummary(res.data || { totalRevenue: 0, revenuePerDoctor: [] });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payments summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchPayments();
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    fetchPayments();
    fetchSummary();
  };

  const formatDateTime = (createdAt) => {
    if (!createdAt) return '-';
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return createdAt;
    return d.toLocaleString();
  };

  return (
    <ClinicAdminLayout>
      <div className="w-full px-3 sm:px-6">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight text-center sm:text-left"
          style={{ color: 'var(--color-primary)' }}
        >
          Payments
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center sm:text-left">
            {error}
          </p>
        )}

        {/* Filters */}
        <form
          onSubmit={applyFilters}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 mb-4 bg-white p-4 rounded-xl shadow"
        >
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Start date
            </label>
            <input
              type="date"
              name="start"
              className="input w-full"
              value={filters.start}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              End date
            </label>
            <input
              type="date"
              name="end"
              className="input w-full"
              value={filters.end}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Doctor
            </label>
            <select
              name="doctorId"
              className="input w-full"
              value={filters.doctorId}
              onChange={handleFilterChange}
            >
              <option value="">All doctors</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                  {doc.speciality ? ` – ${doc.speciality}` : ''}
                </option>
              ))}
            </select>
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
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
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

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-emerald-500">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Total Revenue
            </p>
            <p
              className="text-2xl sm:text-3xl font-extrabold mt-2"
              style={{ color: 'var(--color-primary)' }}
            >
              {summaryLoading ? '...' : `₹${summary.totalRevenue || 0}`}
            </p>
          </div>
          <div className="sm:col-span-2 bg-white rounded-xl shadow p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Revenue per doctor
            </p>
            {summaryLoading ? (
              <Loader />
            ) : summary.revenuePerDoctor?.length === 0 ? (
              <p className="text-xs text-gray-500">No revenue data.</p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-auto">
                {summary.revenuePerDoctor.map((row) => (
                  <div
                    key={row.doctorId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span>
                      {row.doctorName || 'Unknown doctor'}
                      {row.speciality ? ` – ${row.speciality}` : ''}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      ₹{row.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payments list */}
        {loading ? (
          <Loader />
        ) : payments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments found.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Date & Time
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Doctor
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600">
                    Appointment
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900">
                        {formatDateTime(p.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900">
                        {p.doctor?.name || '—'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.doctor?.speciality || ''}
                      </div>
                    </td>
                    <td className="px-4 py-2 font-semibold text-emerald-700">
                      ₹{p.amount}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-700'
                            : p.status === 'FAILED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-xs text-gray-700">
                        #{p.appointment?.id || '—'} ({p.appointment?.status || '—'})
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ClinicAdminLayout>
  );
}
