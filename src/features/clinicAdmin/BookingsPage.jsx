import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import AdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import Loader from "../../components/Loader.jsx";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ENDPOINTS } from "../../lib/endpoints";
import { useAdminContext } from "../../context/AdminContext.jsx";
import UpgradeNotice from "../../components/UpgradeNotice.jsx";

const CancelMeta = ({ app }) => {
  if (app.status !== "CANCELLED") return null;

  const who =
    app.cancelledBy === "USER"
      ? "Cancelled by patient"
      : app.cancelledBy === "ADMIN"
      ? "Cancelled by admin"
      : "Cancelled";

  return (
    <p className="mt-1 text-[11px] text-red-600 font-medium">
      {who}
      {app.cancelReason ? (
        <>
          {" "}
          — <span className="italic">{app.cancelReason}</span>
        </>
      ) : null}
    </p>
  );
};

export default function BookingsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const { plan, loading: planLoading, refreshUnread } = useAdminContext() || {};
  const canUseExports = !!plan?.enableAuditLogs;

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterPatient, setFilterPatient] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const buildParams = () => ({
    status: filterStatus || undefined,
    doctor: filterDoctor || undefined,
    patient: filterPatient || undefined,
    dateFrom: filterDateFrom || undefined,
    dateTo: filterDateTo || undefined,
  });

  const fetchDoctors = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN.DOCTORS);
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  const fetchAppointments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN.APPOINTMENTS, {
        params: { ...buildParams(), page, limit: 10 },
      });

      if (res.data?.data) {
        setAppointments(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setAppointments(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Return promise for toast.promise
  // IMPORTANT: do NOT pass "type" from UI in normal flow,
  // because we want to mark both CANCELLATION + RESCHEDULE as read for that booking. [web:769]
  const markNotifReadForAppointment = (appointmentId, type) => {
    const payload = { entityId: appointmentId };
    if (type) payload.type = type;
    return api.patch(ENDPOINTS.ADMIN.NOTIFICATIONS_MARK_READ_BY_ENTITY, payload);
  };

  // ✅ Show Mark as read if ANY unread booking notification exists
  // (backend sends hasUnreadCancellation + hasUnreadReschedule)
  const canShowMarkAsRead = (app) => {
    return app.hasUnreadCancellation === true || app.hasUnreadReschedule === true;
  };

  const handleMarkAsRead = async (app) => {
    await toast.promise(markNotifReadForAppointment(app.id), {
      loading: "Marking as read...",
      success: "Marked as read",
      error: (err) =>
        err?.response?.data?.error || err?.message || "Failed to mark as read",
    });

    await fetchAppointments(pagination.page);
    await refreshUnread?.();
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAppointments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterDoctor, filterPatient, filterDateFrom, filterDateTo]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAppointments(newPage);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    let reason = null;

    if (newStatus === "CANCELLED") {
      const input = window.prompt(
        "Enter reason for cancellation (this will be shown to the patient):"
      );
      if (input === null) return;
      reason = input.trim() || null;
    } else if (newStatus === "NO_SHOW") {
      const confirmNoShow = window.confirm("Mark this appointment as NO_SHOW?");
      if (!confirmNoShow) return;
    } else {
      const action = newStatus === "COMPLETED" ? "Mark Complete" : "Approve";
      if (!window.confirm(`Are you sure you want to ${action} this appointment?`)) {
        return;
      }
    }

    const originalAppointments = [...appointments];
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    await toast.promise(
      api.patch(ENDPOINTS.ADMIN.APPOINTMENT_STATUS(id), { status: newStatus, reason }),
      {
        loading: "Updating status...",
        success: async () => {
          await fetchAppointments(pagination.page);
          await refreshUnread?.();
          return `Appointment ${newStatus.toLowerCase()}!`;
        },
        error: (err) => {
          setAppointments(originalAppointments);
          return err?.response?.data?.error || "Failed to update status";
        },
      }
    );
  };

  const exportToExcel = async () => {
    if (!canUseExports) return;
    setExporting(true);
    try {
      const response = await api.get(ENDPOINTS.ADMIN.APPOINTMENTS_EXPORT_EXCEL, {
        params: buildParams(),
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `bookings_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Excel file downloaded successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to export Excel file");
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    if (!canUseExports) return;
    setExporting(true);
    try {
      const response = await api.get(ENDPOINTS.ADMIN.APPOINTMENTS_EXPORT_PDF, {
        params: buildParams(),
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `bookings_${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("PDF file downloaded successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to export PDF file");
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterDoctor("");
    setFilterPatient("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const activeFiltersCount = [
    filterStatus,
    filterDoctor,
    filterPatient,
    filterDateFrom,
    filterDateTo,
  ].filter((f) => f !== "").length;

  const isRescheduled = (app) =>
    app.history && Array.isArray(app.history) && app.history.some((h) => h.oldDate);

  if (planLoading) {
    return (
      <AdminLayout>
        <div className="py-32 flex justify-center">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <span>📅</span> Bookings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage patient appointments and track their status.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              {pagination.total} Total
            </span>
          </div>
        </div>

        {!canUseExports && (
          <UpgradeNotice feature="Export to Excel and Export to PDF" planName={plan?.name} />
        )}

        {/* Filters UI unchanged... */}

        {loading ? (
          <div className="py-32 flex justify-center">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p>No bookings found matching your filters.</p>
                </div>
              ) : (
                appointments.map((app) => (
                  <MobileAppointmentCard
                    key={app.id}
                    app={app}
                    onUpdate={handleStatusUpdate}
                    isRescheduled={isRescheduled(app)}
                    canShowMarkAsRead={canShowMarkAsRead}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              )}
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {appointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-16 text-center text-gray-500 italic bg-gray-50"
                      >
                        No bookings found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((app) => (
                      <DesktopAppointmentRow
                        key={app.id}
                        app={app}
                        onUpdate={handleStatusUpdate}
                        isRescheduled={isRescheduled(app)}
                        canShowMarkAsRead={canShowMarkAsRead}
                        onMarkAsRead={handleMarkAsRead}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl border border-gray-200 md:mt-0 md:border-t-0 md:rounded-t-none shadow-sm">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600 font-bold">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// ---------- Sub components ----------

const StatusBadge = ({ status }) => {
  let colors = "bg-gray-100 text-gray-600 border-gray-200";
  if (status === "CONFIRMED") colors = "bg-green-100 text-green-700 border-green-200";
  if (status === "PENDING") colors = "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (status === "CANCELLED") colors = "bg-red-50 text-red-600 border-red-100";
  if (status === "COMPLETED") colors = "bg-blue-50 text-blue-600 border-blue-100";
  if (status === "NO_SHOW") colors = "bg-orange-50 text-orange-700 border-orange-200";
  if (status === "CANCEL_REQUESTED")
    colors = "bg-purple-50 text-purple-700 border-purple-200";

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${colors}`}
    >
      {status}
    </span>
  );
};

const ActionButtons = ({ app, onUpdate }) => {
  return (
    <div className="flex gap-2">
      {app.status === "PENDING" && (
        <>
          <button
            onClick={() => onUpdate(app.id, "CONFIRMED")}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            Approve
          </button>
          <button
            onClick={() => onUpdate(app.id, "CANCELLED")}
            className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            Reject
          </button>
        </>
      )}

      {app.status === "CONFIRMED" && (
        <>
          <button
            onClick={() => onUpdate(app.id, "COMPLETED")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            Mark Complete
          </button>
          <button
            onClick={() => onUpdate(app.id, "NO_SHOW")}
            className="flex-1 bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            Mark No‑Show
          </button>
        </>
      )}
    </div>
  );
};

const MobileAppointmentCard = ({ app, onUpdate, isRescheduled, canShowMarkAsRead, onMarkAsRead }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{app.patientName}</h3>
        <p className="text-sm text-gray-500">{app.patientPhone}</p>
      </div>
      <div className="text-right">
        <StatusBadge status={app.status} />
        <CancelMeta app={app} />
      </div>
    </div>

    <div className="space-y-3 text-sm text-gray-700 border-t border-b border-gray-100 py-4 my-4">
      <div className="flex items-center gap-3">
        <span className="text-lg">👨‍⚕️</span>
        <div>
          <span className="font-bold text-gray-900 block">{app.doctorName}</span>
          <span className="text-xs text-blue-600">{app.doctorSpecialization}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-lg">🕒</span>
        <div>
          <span className="font-medium block">{app.dateFormatted}</span>
          <span className="text-xs text-gray-500 font-mono">{app.timeFormatted}</span>
        </div>
      </div>

      {isRescheduled && (
        <span className="inline-block mt-1.5 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded w-max font-bold">
          ⚠️ Rescheduled
        </span>
      )}
    </div>

    {["PENDING", "CONFIRMED"].includes(app.status) ? (
      <ActionButtons app={app} onUpdate={onUpdate} />
    ) : canShowMarkAsRead(app) ? (
      <button
        type="button"
        onClick={() => onMarkAsRead(app)}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-bold"
      >
        Mark as read
      </button>
    ) : (
      <p className="text-xs text-center text-gray-400 italic font-medium">
        No actions available
      </p>
    )}
  </div>
);

const DesktopAppointmentRow = ({ app, onUpdate, isRescheduled, canShowMarkAsRead, onMarkAsRead }) => (
  <tr className="hover:bg-blue-50/30 transition-colors">
    <td className="p-5">
      <div className="font-bold text-gray-900">{app.patientName}</div>
      <div className="text-xs text-gray-500 mt-0.5">{app.patientPhone}</div>
      <Link
        to={`/admin/patients/${app.userId}/history`}
        className="mt-1 inline-block text-[11px] text-blue-600 font-semibold hover:underline"
      >
        View history
      </Link>
    </td>

    <td className="p-5">
      <div className="text-gray-900 text-sm font-bold">{app.doctorName}</div>
      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-max mt-1 font-medium">
        {app.doctorSpecialization}
      </div>
    </td>

    <td className="p-5">
      <div className="font-medium text-gray-900 text-sm">{app.dateFormatted}</div>
      <div className="text-xs text-gray-500 font-mono mt-0.5">{app.timeFormatted}</div>

      {isRescheduled && (
        <span className="block mt-1.5 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded w-max font-bold">
          ⚠️ Rescheduled
        </span>
      )}
    </td>

    <td className="p-5">
      <StatusBadge status={app.status} />
      <CancelMeta app={app} />
    </td>

    <td className="p-5">
      <div className="w-44">
        {["PENDING", "CONFIRMED"].includes(app.status) ? (
          <ActionButtons app={app} onUpdate={onUpdate} />
        ) : canShowMarkAsRead(app) ? (
          <button
            type="button"
            onClick={() => onMarkAsRead(app)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Mark as read
          </button>
        ) : (
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">
            {app.status === "NO_SHOW"
              ? "No‑Show"
              : app.status === "CANCELLED"
              ? "Cancelled"
              : "Completed"}
          </span>
        )}
      </div>
    </td>
  </tr>
);
