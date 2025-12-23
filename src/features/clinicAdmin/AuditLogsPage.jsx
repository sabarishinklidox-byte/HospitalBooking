// src/features/shared/AuditLogsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../lib/api.js";
import Loader from "../../components/Loader.jsx";
import SuperAdminLayout from "../../layouts/SuperAdminLayout.jsx";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import { ENDPOINTS } from "../../lib/endpoints";
import { useAdminContext } from "../../context/AdminContext.jsx";
import UpgradeNotice from "../../components/UpgradeNotice.jsx";

// ---------------- helpers ----------------
const formatDetails = (details) => {
  if (!details || Object.keys(details).length === 0) {
    return <span className="text-gray-400 italic text-xs">No additional details</span>;
  }

  if (details.previousStatus && details.newStatus) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-semibold border border-red-100 text-xs whitespace-nowrap">
          {details.previousStatus}
        </span>
        <span className="text-gray-400">➝</span>
        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-semibold border border-green-100 text-xs whitespace-nowrap">
          {details.newStatus}
        </span>
      </div>
    );
  }

  if (details.oldDate && details.newDate) {
    return (
      <div className="flex flex-col gap-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100 max-w-full">
        <div className="flex items-center justify-between text-gray-600 line-through text-xs bg-white p-2 rounded-md border border-blue-200">
          <span>📅 Old</span>
          <span className="font-mono text-xs truncate max-w-[120px]">
            {details.oldDate} {details.oldTime || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between text-blue-700 font-semibold text-xs bg-white p-2 rounded-md border border-blue-200">
          <span>📅 New</span>
          <span className="font-mono text-xs truncate max-w-[120px]">
            {details.newDate} {details.newTime || "N/A"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100 max-w-full">
      {Object.entries(details).map(([key, value]) => (
        <div key={key} className="flex gap-2 items-center p-1.5 hover:bg-gray-100 rounded transition-colors">
          <span className="font-semibold text-gray-600 capitalize min-w-[70px] text-[11px] truncate">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </span>
          <span 
            className="text-gray-800 font-medium truncate text-[11px] max-w-[150px]" 
            title={String(value)}
          >
            {String(value).length > 25 ? `${String(value).slice(0, 25)}...` : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const getActionBadge = (action) => {
  const type = action.split("_")[0];
  let styles = "bg-gray-100 text-gray-700 border-gray-200";

  if (["CREATE", "ADD", "BOOK"].includes(type)) styles = "bg-green-50 text-green-700 border-green-200";
  if (["UPDATE", "EDIT", "RESCHEDULE"].includes(type)) styles = "bg-blue-50 text-blue-700 border-blue-200";
  if (["DELETE", "CANCEL", "REVOKE"].includes(type)) styles = "bg-red-50 text-red-700 border-red-200";
  if (["LOGIN", "LOGOUT"].includes(type)) styles = "bg-purple-50 text-purple-700 border-purple-200";

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap ${styles} shadow-sm`}>
      {action.split("_").map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(" ")}
    </span>
  );
};

// ---------------- main page ----------------
export default function AuditLogsPage() {
  const { user } = useSelector((state) => state.auth);

  const Layout = user?.role === "ADMIN" ? ClinicAdminLayout : SuperAdminLayout;

  // plan only relevant for clinic admins
  const adminCtx = user?.role === "ADMIN" ? useAdminContext() : null;
  const plan = adminCtx?.plan || null;
  const planLoading = adminCtx?.loading || false;

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ startDate: "", endDate: "", role: "" });

  // choose endpoint based on role
  const auditLogsUrl = useMemo(() => {
    if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") {
      return ENDPOINTS?.ADMIN?.AUDIT_LOGS;
    }
    return null;
  }, [user?.role]);

  const fetchLogs = async (page = 1) => {
    if (!auditLogsUrl) return;

    setLoading(true);
    try {
      const res = await api.get(auditLogsUrl, {
        params: {
          page,
          limit: 12,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          role: filters.role || undefined,
        },
      });

      const list = Array.isArray(res.data) ? res.data : res.data.data || res.data.logs || [];
      const pag = Array.isArray(res.data)
        ? { page, totalPages: 1, total: list.length }
        : res.data.pagination || { page, totalPages: 1, total: list.length };

      setLogs(list);
      setPagination(pag);
      setError(null);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      if (err.response?.status === 403) setError("🔒 Access Denied: Audit View Disabled.");
      else {
        setError(null);
        setLogs([]);
        setPagination({ page: 1, totalPages: 1, total: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters, auditLogsUrl]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) fetchLogs(newPage);
  };

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const clearFilters = () => setFilters({ startDate: "", endDate: "", role: "" });

  if (!auditLogsUrl) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-100 text-center max-w-lg">
            Audit logs are not available for this account.
          </div>
        </div>
      </Layout>
    );
  }

  // clinic admin: wait for plan
  if (user?.role === "ADMIN" && planLoading) {
    return (
      <Layout>
        <div className="py-20">
          <Loader />
        </div>
      </Layout>
    );
  }

  // clinic admin: plan gating
  if (user?.role === "ADMIN" && !plan?.enableAuditLogs) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📜</span> Audit Logs
          </h1>
          <UpgradeNotice feature="Audit logs & activity history" planName={plan?.name} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-red-50 text-red-600 p-8 rounded-xl border border-red-100 text-center shadow-sm max-w-md">
            <h3 className="text-xl font-bold mb-2">Access Restricted</h3>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-3xl sm:text-2xl">📜</span> Audit Logs
            </h1>
            <p className="text-gray-500 text-sm mt-2">Track all system activities and changes across your clinics.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap">
              {pagination.total.toLocaleString()} Records
            </span>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
        </div>

        {/* Filters - Responsive */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Role</label>
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 hover:bg-white transition-all"
              >
                <option value="">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Clinic Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="USER">Patient/User</option>
              </select>
            </div>

            <div className="sm:pt-8 lg:pt-0">
              <button
                onClick={clearFilters}
                className="w-full px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:from-gray-200 hover:to-gray-300 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 shadow-sm"
              >
                <span className="text-lg">✕</span> Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs - Responsive Cards */}
        {loading ? (
          <div className="py-24 flex flex-col items-center">
            <Loader />
            <p className="mt-4 text-gray-500 text-sm">Loading audit logs...</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-24 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm">
                  <div className="text-6xl mb-4 opacity-20">📜</div>
                  <p className="text-xl font-semibold text-gray-500 mb-2">No activity logs found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 pb-4 mb-4 border-b border-gray-100">
                      {/* User Avatar + Info */}
                      <div className="flex items-start gap-4 min-w-0 flex-1 lg:flex-none">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white shadow-lg ring-2 ring-white/50 flex-shrink-0">
                          {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {log.user?.name || "Unknown User"}
                          </p>
                          <p className="text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-full uppercase tracking-wide text-gray-700 truncate max-w-[140px]">
                            {log.user?.role || "USER"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Action Badge */}
                      <div className="flex-shrink-0">
                        {getActionBadge(log.action)}
                      </div>
                    </div>

                    {/* Details - Responsive */}
                    <div className="w-full">
                      {formatDetails(log.details)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination - Responsive */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12 pt-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:from-gray-200 hover:to-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="text-xl">←</span> Previous
                </button>

                <div className="text-sm font-semibold text-gray-700 bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                  Page <span className="text-blue-600 font-black">{pagination.page}</span> of {pagination.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:from-gray-200 hover:to-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-200 flex items-center gap-2 whitespace-nowrap"
                >
                  Next <span className="text-xl">→</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
