// pages/admin/PaymentsPage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import Loader from "../../components/Loader.jsx";
import { ENDPOINTS } from "../../lib/endpoints";

const formatDateTime = (createdAt) => {
  if (!createdAt) return "—";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return String(createdAt);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0, 
});

const formatRupees = (val) => {
  let amount = Number(val || 0);
  if (amount >= 10000) {
    amount = amount / 100;
  }
  return inr.format(amount);
};

const formatRupeesFromPaise = (paise) =>
  inr.format(Number(paise || 0) / 100);

const formatINRFromPaise = (paise) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })
    .format((Number(paise || 0)) / 100);

const getPaymentTypeLabel = (p) => {
  if (p?.notes?.type === "PAY_DIFFERENCE") return "Reschedule ↑";
  if (p?.notes?.type === "OFFLINE_TO_ONLINE") return "Offline→Online";
  if (p?.type === "APPOINTMENT") return "New Booking";
  if (p?.type === "RESCHEDULE") return "Reschedule";
  if (p?.type === "RESCHEDULE_CASH") return "Cash Upgrade";
  return p?.type || "Payment";
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [paymentsPagination, setPaymentsPagination] = useState({ 
    currentPage: 1, 
    totalPages: 1, 
    totalCount: 0 
  });
  
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalRefunded: 0,
    netRevenue: 0,
    revenuePerDoctor: [],
  });
  const [summaryPagination, setSummaryPagination] = useState({ 
    currentPage: 1, 
    totalPages: 1 
  });

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [summaryPage, setSummaryPage] = useState(1);

  const [filters, setFilters] = useState({
    start: "",
    end: "",
    doctorId: "",
    status: "",
    paymentMode: "",
    type: "",
  });

  const paymentsParams = useMemo(
    () => ({
      start: filters.start || undefined,
      end: filters.end || undefined,
      doctorId: filters.doctorId || undefined,
      status: filters.status || undefined,
      paymentMode: filters.paymentMode || undefined,
      type: filters.type || undefined,
      page: paymentsPage,
      limit: 20, // Consistent limit for payments table
    }),
    [filters, paymentsPage]
  );

  const summaryParams = useMemo(
    () => ({
      start: filters.start || undefined,
      end: filters.end || undefined,
      page: summaryPage,
      limit: 10,
    }),
    [filters.start, filters.end, summaryPage]
  );

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN.DOCTORS);
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load doctors");
    }
  }, []);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(ENDPOINTS.ADMIN.PAYMENTS, { params: paymentsParams });
      setPayments(Array.isArray(res.data.data) ? res.data.data : res.data || []);
      
      // Handle pagination from backend response
      if (res.data.pagination) {
        setPaymentsPagination({
          currentPage: res.data.pagination.currentPage || paymentsPage,
          totalPages: res.data.pagination.totalPages || 1,
          totalCount: res.data.pagination.totalCount || 0,
        });
      } else {
        setPaymentsPagination({
          currentPage: paymentsPage,
          totalPages: 1,
          totalCount: res.data.length || 0,
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load payments");
      setPayments([]);
      setPaymentsPagination({ currentPage: 1, totalPages: 1, totalCount: 0 });
    } finally {
      setLoading(false);
    }
  }, [paymentsParams, paymentsPage]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN.PAYMENTS_SUMMARY, { 
        params: summaryParams 
      });
      setSummary(res.data);
      
      // Handle summary pagination
      if (res.data.pagination) {
        setSummaryPagination({
          currentPage: res.data.pagination.currentPage || summaryPage,
          totalPages: res.data.pagination.totalPages || 1,
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load payments summary");
      setSummary({ totalPaid: 0, totalRefunded: 0, netRevenue: 0, revenuePerDoctor: [] });
      setSummaryPagination({ currentPage: 1, totalPages: 1 });
    } finally {
      setSummaryLoading(false);
    }
  }, [summaryParams, summaryPage]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Reset to page 1 when filters change
    setPaymentsPage(1);
    setSummaryPage(1);
  };

  const applyFilters = async (e) => {
    e.preventDefault();
    setPaymentsPage(1);
    setSummaryPage(1);
    await fetchPayments();
    await fetchSummary();
  };

  const handlePaymentsPageChange = (newPage) => {
    setPaymentsPage(newPage);
  };

  const handleSummaryPageChange = (newPage) => {
    setSummaryPage(newPage);
  };

  // Generate page numbers for pagination
  const getPageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <ClinicAdminLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">
            Payments Dashboard
          </h1>
          <p className="text-xl text-gray-600">Complete revenue history - Online - Refunds & Reschedules</p>
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
                    {doc.name}{" "}
                    {(doc.speciality?.name || doc.speciality)
                      ? `– ${doc.speciality?.name || doc.speciality}`
                      : ""}
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
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />
              <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">
                Total Collected
              </h3>
            </div>
            <p className="text-3xl lg:text-4xl font-black text-emerald-700">
              {summaryLoading ? "—" : formatRupeesFromPaise(summary.totalPaid)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl shadow-lg border border-orange-200">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
              <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-wide">
                Total Refunded
              </h3>
            </div>
            <p className="text-3xl lg:text-4xl font-black text-orange-700">
              {summaryLoading ? "—" : formatRupeesFromPaise(summary.totalRefunded)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-200 lg:col-span-2">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
                Net Revenue
              </h3>
            </div>
            <p className="text-3xl lg:text-4xl font-black text-blue-700">
              {summaryLoading ? "—" : formatRupeesFromPaise(summary.netRevenue)}
            </p>
          </div>
        </div>

        {/* Revenue Per Doctor - With Pagination */}
        {summary.revenuePerDoctor?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Per Doctor{" "}
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Page {summaryPage} of {summaryPagination.totalPages}
                </span>
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {summary.revenuePerDoctor.map((row) => (
                <div key={row.doctorId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{row.doctorName}</div>
                      <div className="text-sm text-gray-500">{row.speciality || "General"}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-600">
                        {formatRupeesFromPaise(row.amount)}
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

            {/* Summary Pagination */}
            {summaryPagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {summaryPage} of {summaryPagination.totalPages} • Showing {summary.revenuePerDoctor?.length || 0} doctors
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSummaryPageChange(Math.max(1, summaryPage - 1))}
                      disabled={summaryPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {getPageNumbers(summaryPage, summaryPagination.totalPages).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handleSummaryPageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            summaryPage === pageNum
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSummaryPageChange(Math.min(summaryPagination.totalPages, summaryPage + 1))}
                      disabled={summaryPage === summaryPagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments Table - With Pagination */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payments Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Recent Transactions ({paymentsPagination.totalCount} total)
                </h3>
                <span className="text-sm text-gray-500">
                  Page {paymentsPage} of {paymentsPagination.totalPages}
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
                        <div className="text-sm font-medium text-gray-900">
                          {formatDateTime(p.createdAt)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{p.doctor?.name || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {p.doctor?.speciality?.name || p.doctor?.speciality || ""}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-lg font-black text-emerald-600">
                          {formatRupees(p.amount)}
                        </div>
                        {p?.notes?.type === "PAY_DIFFERENCE" && (
                          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Upgrade Payment
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                            p.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : p.status === "REFUNDED"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-gray-100 text-gray-800"
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
                          #{p.appointment?.id?.slice?.(-8) || p.appointment?.id || "—"}
                        </div>
                        <div className="text-xs text-gray-500">({p.appointment?.status || "—"})</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payments Table Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {paymentsPage} of {paymentsPagination.totalPages} • 
                  Showing {payments.length} of {paymentsPagination.totalCount} payments
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePaymentsPageChange(Math.max(1, paymentsPage - 1))}
                    disabled={paymentsPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {getPageNumbers(paymentsPage, paymentsPagination.totalPages).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePaymentsPageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors shadow-sm ${
                          paymentsPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handlePaymentsPageChange(Math.min(paymentsPagination.totalPages, paymentsPage + 1))}
                    disabled={paymentsPage === paymentsPagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClinicAdminLayout>
  );
}
