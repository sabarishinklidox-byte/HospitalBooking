// pages/admin/PaymentsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

const formatDateTime = (createdAt) => {
  if (!createdAt) return '—';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return String(createdAt);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// If your backend stores paise (common with Razorpay), keep this.
// If your backend stores rupees, set `AMOUNT_IN_PAISE = false`.
const AMOUNT_IN_PAISE = true;

const formatRupees = (amount) => {
  const n = Number(amount || 0);
  const rupees = AMOUNT_IN_PAISE ? n / 100 : n;
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const getPaymentTypeLabel = (p) => {
  if (p?.notes?.type === 'PAY_DIFFERENCE') return 'Reschedule ↑';
  if (p?.notes?.type === 'OFFLINE_TO_ONLINE') return 'Offline→Online';
  if (p?.type === 'APPOINTMENT') return 'New Booking';
  if (p?.type === 'RESCHEDULE') return 'Reschedule';
  if (p?.type === 'RESCHEDULE_CASH') return 'Cash Upgrade';
  return p?.type || 'Payment';
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalRefunded: 0,
    netRevenue: 0,
    revenuePerDoctor: [],
  });

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState('');

  const [doctors, setDoctors] = useState([]);

  const [filters, setFilters] = useState({
    start: '',
    end: '',
    doctorId: '',
    status: '',
    paymentMode: '',
    type: '',
  });

  const paymentsParams = useMemo(
    () => ({
      start: filters.start || undefined,
      end: filters.end || undefined,
      doctorId: filters.doctorId || undefined,
      status: filters.status || undefined,
      paymentMode: filters.paymentMode || undefined,
      type: filters.type || undefined,
    }),
    [filters]
  );

  const summaryParams = useMemo(
    () => ({
      start: filters.start || undefined,
      end: filters.end || undefined,
    }),
    [filters.start, filters.end]
  );

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN.DOCTORS);
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load doctors');
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(ENDPOINTS.ADMIN.PAYMENTS, { params: paymentsParams });
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [paymentsParams]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN.PAYMENTS_SUMMARY, { params: summaryParams });
      setSummary(
        res.data || { totalPaid: 0, totalRefunded: 0, netRevenue: 0, revenuePerDoctor: [] }
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payments summary');
      setSummary({ totalPaid: 0, totalRefunded: 0, netRevenue: 0, revenuePerDoctor: [] });
    } finally {
      setSummaryLoading(false);
    }
  }, [summaryParams]);

  useEffect(() => {
    // Load doctors once
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    // Initial load (and later reloads when filters are applied manually)
    fetchPayments();
    fetchSummary();
  }, [fetchPayments, fetchSummary]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = async (e) => {
    e.preventDefault();
    await fetchPayments();
    await fetchSummary();
  };

  return (
    <ClinicAdminLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Payments Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Complete revenue history - Online - Refunds & Reschedules
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <form onSubmit={applyFilters} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="start"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.start}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="end"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.end}
                onChange={handleFilterChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor</label>
              <select
                name="doctorId"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.doctorId}
                onChange={handleFilterChange}
              >
                <option value="">All Doctors</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}{' '}
                    {(doc.speciality?.name || doc.speciality)
                      ? `– ${doc.speciality?.name || doc.speciality}`
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

          
        
          </div>

          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Apply Filters
          </button>
        </form>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl shadow-lg border border-emerald-200">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">
                Total Collected
              </h3>
            </div>
            <p className="text-3xl lg:text-4xl font-black text-emerald-700">
              {summaryLoading ? '—' : formatRupees(summary.totalPaid)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl shadow-lg border border-orange-200">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                Total Refunded
              </h3>
            </div>
            <p className="text-3xl lg:text-4xl font-black text-orange-700">
              {summaryLoading ? '—' : formatRupees(summary.totalRefunded)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-200 lg:col-span-2">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                Net Revenue
              </h3>
            </div>
            <p className="text-3xl lg:text-4xl font-black text-blue-700">
              {summaryLoading ? '—' : formatRupees(summary.netRevenue)}
            </p>
          </div>
        </div>

        {/* Revenue Per Doctor */}
        {summary.revenuePerDoctor?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Per Doctor{' '}
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {summary.revenuePerDoctor.length} Doctors
                </span>
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {summary.revenuePerDoctor.map((row) => (
                <div key={row.doctorId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{row.doctorName}</div>
                      <div className="text-sm text-gray-500">{row.speciality || 'General'}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-600">
                        {formatRupees(row.amount)}
                      </div>
                      {row.isDeleted && (
                        <div className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded mt-1 inline-block">
                          Deleted Doctor
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4">💸</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Recent Transactions ({payments.length})
                </h3>
                <span className="text-sm text-gray-500">
                  {formatDateTime(payments[0]?.createdAt)} -{' '}
                  {formatDateTime(payments[payments.length - 1]?.createdAt)}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Appointment
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{formatDateTime(p.createdAt)}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{p.doctor?.name || '—'}</div>
                        <div className="text-xs text-gray-500">
                          {p.doctor?.speciality?.name || p.doctor?.speciality || ''}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-lg font-black text-emerald-600">{formatRupees(p.amount)}</div>
                        {p?.notes?.type === 'PAY_DIFFERENCE' && (
                          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Upgrade Payment
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                            p.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : p.status === 'REFUNDED'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{getPaymentTypeLabel(p)}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-mono">
                          #{p.appointment?.id?.slice?.(-8) || p.appointment?.id || '—'}
                        </div>
                        <div className="text-xs text-gray-500">({p.appointment?.status || '—'})</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ClinicAdminLayout>
  );
}
