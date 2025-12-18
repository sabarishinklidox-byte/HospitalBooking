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
        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-semibold border border-red-100 text-xs">
          {details.previousStatus}
        </span>
        <span className="text-gray-400">➝</span>
        <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-semibold border border-green-100 text-xs">
          {details.newStatus}
        </span>
      </div>
    );
  }

  if (details.oldDate && details.newDate) {
    return (
      <div className="flex flex-col gap-1 text-sm bg-blue-50 p-2 rounded-md border border-blue-100">
        <div className="flex items-center gap-2 text-gray-500 line-through text-xs">
          📅 {details.oldDate} <span className="font-mono">{details.oldTime || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs">
          📅 {details.newDate} <span className="font-mono">{details.newTime || "N/A"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-xs bg-gray-50 p-2 rounded border border-gray-100">
      {Object.entries(details).map(([key, value]) => (
        <div key={key} className="flex gap-2">
          <span className="font-semibold text-gray-600 capitalize min-w-[80px]">{key}:</span>
          <span className="text-gray-800 truncate font-medium" title={String(value)}>
            {String(value)}
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
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${styles}`}>
      {action.replace(/_/g, " ")}
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
    return ENDPOINTS?.ADMIN?.AUDIT_LOGS; // "/admin/audit-logs"
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
          // OPTIONAL:
          // super admin can add clinicId filter later without changing endpoint
          // clinicId: selectedClinicId || undefined,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">📜</span> Audit Logs
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track all system activities and changes.</p>
          </div>
          <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
            {pagination.total} Records Found
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Role</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Clinic Admin</option>
              <option value="DOCTOR">Doctor</option>
              <option value="USER">Patient/User</option>
            </select>
          </div>

          <div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              ✕ Reset Filters
            </button>
          </div>
        </div>

        {/* Logs */}
        {loading ? (
          <div className="py-20">
            <Loader />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-400">No activity logs found matching your filters.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center"
                  >
                    <div className="min-w-[180px]">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                          {log.user?.name ? log.user.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{log.user?.name || "Unknown"}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{log.user?.role || "USER"}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 ml-11">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="min-w-[140px]">{getActionBadge(log.action)}</div>

                    <div className="flex-1 w-full">{formatDetails(log.details)}</div>
                  </div>
                ))
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  ← Previous
                </button>

                <span className="text-sm font-medium text-gray-600">
                  Page <span className="text-gray-900 font-bold">{pagination.page}</span> of {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
