// pages/admin/PatientHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

export default function PatientHistoryPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(
        `${ENDPOINTS.ADMIN.PATIENT_HISTORY(userId)}?page=${pageToLoad}&limit=10`
      );

      setPatient(res.data.user);
      setAppointments(res.data.appointments || []);
      setPagination(res.data.pagination || null);
      setPage(pageToLoad);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load patient history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, [userId]);

  const formatDateTime = (isoString, type = 'full') => {
    if (!isoString) return '—';
    const date = new Date(isoString);

    if (type === 'date') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    if (type === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 🔥 FIXED: Convert paise to rupees
  const formatRupees = (amount) => {
    if (!amount) return '₹0';
    const rupees = Number(amount) / 100;
    return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  return (
    <ClinicAdminLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        ) : (
          <>
            {/* Patient header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {patient?.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-gray-50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {patient?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{patient?.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {patient?.email}
                  </div>

                  {patient?.phone && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${patient.phone}`} className="text-blue-600 hover:underline font-medium">
                        {patient.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* History table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Appointment History</h2>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {pagination?.totalCount ?? appointments.length} Total
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No appointments found for this patient.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                          <th className="px-6 py-3 font-semibold text-gray-600">Date & Time</th>
                          <th className="px-6 py-3 font-semibold text-gray-600">Doctor</th>
                          <th className="px-6 py-3 font-semibold text-gray-600">Clinic</th>
                          <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                          <th className="px-6 py-3 font-semibold text-gray-600">Payment History</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {appointments.map((a) => {
                          const dateString = a.slot?.date || a.date;
                          const timeString = a.slot?.time || a.time;
                          const isIso = dateString?.includes('T');

                          return (
                            <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                              {/* Date */}
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                  {isIso ? formatDateTime(dateString, 'date') : dateString}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {isIso ? formatDateTime(dateString, 'time') : timeString}
                                </div>
                              </td>

                              {/* Doctor */}
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                  {a.doctor?.name || 'Unknown Doctor'}
                                </div>
                                <div className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">
                                  {a.doctor?.speciality?.name || a.doctor?.speciality || 'Unknown'}
                                </div>
                              </td>

                              {/* Clinic */}
                              <td className="px-6 py-4 text-gray-600">
                                {a.clinic?.name || '—'}
                              </td>

                              {/* Status */}
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${
                                    a.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-700'
                                      : a.status === 'CANCELLED'
                                      ? 'bg-red-50 text-red-600 border border-red-100'
                                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                                  }`}
                                >
                                  {a.status}
                                </span>
                              </td>

                              {/* 🔥 PERFECT Payment History */}
                              <td className="px-6 py-4 text-xs max-w-[200px]">
                                {(() => {
                                  // 🔥 1. Reschedule actions (MOST IMPORTANT)
                                  if (a.financialStatus && a.financialStatus !== 'NO_CHANGE') {
                                    return (
                                      <div className="space-y-1">
                                        <div className="font-semibold text-sm">
                                          {a.financialStatus === 'PAY_AT_CLINIC' && (
                                            <span className="text-blue-600">💰 Collect {formatRupees(a.diffAmount || a.amount)}</span>
                                          )}
                                          {a.financialStatus === 'PAY_DIFFERENCE_OFFLINE' && (
                                            <span className="text-blue-600">💰 Pay {formatRupees(a.diffAmount)} more</span>
                                          )}
                                          {a.financialStatus === 'PAY_DIFFERENCE' && (
                                            <span className="text-blue-600">💳 Pay {formatRupees(a.diffAmount)} online</span>
                                          )}
                                          {a.financialStatus === 'FULL_REFUND' && (
                                            <span className="text-orange-600">💸 Refund FULL {formatRupees(a.diffAmount)}</span>
                                          )}
                                          {a.financialStatus === 'REFUND_AT_CLINIC' && (
                                            <span className="text-orange-600">💸 Refund {formatRupees(a.diffAmount)}</span>
                                          )}
                                          {a.financialStatus === 'FREE_SLOT' && (
                                            <span className="text-green-600">🎁 Free slot</span>
                                          )}
                                        </div>
                                        {a.adminNote && (
                                          <div className="text-[10px] text-gray-500 italic line-clamp-2">
                                            {a.adminNote}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }

                                  // 🔥 2. Regular booking summary
                                  const amount = Number(a.amount || a.slot?.price || 0);
                                  const paidAmount = Number(a.paidAmount || 0);
                                  const refundedAmount = Number(a.refundedAmount || 0);
                                  const paymentStatus = a.paymentStatus || 'PENDING';
                                  const mode = a.slot?.paymentMode || 'OFFLINE';

                                  if (amount === 0) {
                                    return <span className="text-green-600 font-semibold">Free</span>;
                                  }

                                  // 🔥 3. COMPLETE PAYMENT BREAKDOWN
                                  return (
                                    <div className="space-y-1">
                                      {/* Headline */}
                                      <div className={`font-semibold text-sm ${
                                        paymentStatus === 'PAID' ? 'text-green-600' :
                                        paymentStatus === 'REFUNDED' ? 'text-orange-600' :
                                        'text-gray-600'
                                      }`}>
                                        {paymentStatus === 'PAID' && `Paid ${formatRupees(paidAmount || amount)}`}
                                        {paymentStatus === 'REFUNDED' && `Refunded ${formatRupees(refundedAmount || paidAmount)}`}
                                        {paymentStatus === 'PENDING' && `Pending ${formatRupees(amount)}`}
                                        {paymentStatus === 'PAID' && paidAmount < amount && (
                                          <span className="text-amber-600 ml-1">
                                            (+{formatRupees(amount - paidAmount)} pending)
                                          </span>
                                        )}
                                        <span className="text-gray-500 ml-1">({mode})</span>
                                      </div>

                                      {/* Breakdown */}
                                      {paidAmount > 0 && (
                                        <div className="text-[10px] text-gray-500">
                                          Paid: <span className="font-semibold text-green-700">{formatRupees(paidAmount)}</span>
                                        </div>
                                      )}
                                      {refundedAmount > 0 && (
                                        <div className="text-[10px] text-gray-500">
                                          Refunded: <span className="font-semibold text-orange-700">{formatRupees(refundedAmount)}</span>
                                        </div>
                                      )}
                                      {a.paymentUpdatedAt && (
                                        <div className="text-[10px] text-gray-400">
                                          {formatDateTime(a.paymentUpdatedAt, 'date')}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination && (
                    <div className="px-6 py-3 flex items-center justify-between border-t border-gray-100 text-xs text-gray-600">
                      <span>
                        Page {pagination.page} of {pagination.totalPages} · {pagination.totalCount} records
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => fetchHistory(page - 1)}
                          disabled={page <= 1}
                          className="px-3 py-1 rounded border text-xs disabled:opacity-40"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => fetchHistory(page + 1)}
                          disabled={page >= pagination.totalPages}
                          className="px-3 py-1 rounded border text-xs disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ClinicAdminLayout>
  );
}
