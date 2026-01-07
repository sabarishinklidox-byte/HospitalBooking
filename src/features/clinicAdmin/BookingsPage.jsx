import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import AdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import Loader from "../../components/Loader.jsx";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ENDPOINTS } from "../../lib/endpoints";
import { useAdminContext } from "../../context/AdminContext.jsx";
import UpgradeNotice from "../../components/UpgradeNotice.jsx";

// --- HELPER FUNCTIONS ---

// 📅 SMART DATE FORMATTER (Today/Tomorrow/Date)
const getRelativeDateLabel = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  
  // Reset time part for accurate comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  
  return null; // Return null if it's just a regular date
};

// 🕒 FORMAT "BOOKED ON" DATE
const formatCreatedDate = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

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
          {" "}— <span className="italic">{app.cancelReason}</span>
        </>
      ) : null}
    </p>
  );
};

// 💰 SMART PAYMENT SUMMARY
const getPaymentSummary = (app) => {
  const { 
    paymentStatus, 
    financialStatus, 
    diffAmount, 
    status, 
    amount, 
    slot 
  } = app;
  
  const paymentMode = slot?.paymentMode || "CLINIC";
  const finalAmount = Number(amount ?? slot?.price ?? 0);
  const difference = Number(diffAmount || 0);

  // 1. CANCELLED / REJECTED
  if (["CANCELLED", "REJECTED"].includes(status)) {
    return (
      <span className="text-red-600">
        Cancelled — {paymentStatus === 'PAID' ? 'Refund needed' : 'No collection'}
      </span>
    );
  }

  // 2. FREE APPOINTMENTS
  if (paymentMode === "FREE" || finalAmount === 0) {
    return <span className="text-green-600 font-bold">Free Visit</span>;
  }

  // 3️⃣ RESCHEDULE WITH PAYMENT CHANGE (CHECK FIRST!)
  if (financialStatus === "PAY_DIFFERENCE" || financialStatus === "PAY_DIFFERENCE_OFFLINE") {
    const paidAmount = finalAmount - difference;
    const location = paymentMode === "ONLINE" ? "Online" : "at Clinic";
    return (
      <div className="flex flex-col">
        <span className="text-orange-700 font-bold">Paid ₹{paidAmount}, Collect ₹{difference}</span>
        <span className="text-[10px] text-gray-500">{location} • Total ₹{finalAmount}</span>
      </div>
    );
  }

  if (financialStatus === "REFUND_AT_CLINIC" && difference > 0) {
    return (
      <div className="flex flex-col">
        <span className="text-red-600 font-bold">Refund Due: ₹{difference}</span>
        <span className="text-[10px] text-gray-500">Downgrade (New: ₹{finalAmount})</span>
      </div>
    );
  }

  if (financialStatus === "OFFLINE_TO_ONLINE") {
    return (
      <div className="flex flex-col">
        <span className="text-blue-600 font-bold">Paid Online</span>
        <span className="text-[10px] text-gray-500">Switched from Offline (₹{finalAmount})</span>
      </div>
    );
  }

  // 4️⃣ STANDARD ONLINE PAYMENT (after financial status)
  if (paymentMode === "ONLINE") {
    if (paymentStatus === "PAID") {
      return <span className="text-green-700 font-medium">Paid Online: ₹{finalAmount}</span>;
    } else {
      return <span className="text-orange-600 font-medium">Pending Online: ₹{finalAmount}</span>;
    }
  }

  // 5️⃣ STANDARD CLINIC PAYMENT
  if (paymentMode === "CLINIC" || paymentMode === "OFFLINE") {
    if (paymentStatus === "PAID") {
      return <span className="text-green-700 font-medium">Paid at Clinic: ₹{finalAmount}</span>;
    } else {
      return <span className="text-blue-700 font-bold">Collect at Clinic: ₹{finalAmount}</span>;
    }
  }

  return <span>Amount: ₹{finalAmount}</span>;
};
  

// --- MAIN COMPONENT ---

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
      const safeDoctors = (res.data || []).map((d) => ({
        ...d,
        speciality: d.speciality?.name || d.speciality || "Unknown",
      }));
      setDoctors(safeDoctors);
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
      const rawData = res.data?.data || res.data || [];
      const safeAppointments = rawData.map((a) => ({
        ...a,
        doctorSpecialization:
          a.doctorSpecialization?.name ||
          a.doctorSpecialization ||
          a.doctor?.speciality?.name ||
          "Unknown",
        doctorName: a.doctorName || a.doctor?.name || "Unknown Doctor",
        patientName: a.patientName || a.patient?.name || "Unknown Patient",
        // 🔥 NEW MAPPING FOR REQUESTS
        hasPendingRequest: a.cancellationRequest?.status === 'PENDING',
        requestReason: a.cancellationRequest?.reason,
        requestId: a.cancellationRequest?.id
      }));

      setAppointments(safeAppointments);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const markNotifReadForAppointment = (appointmentId, type) => {
    const payload = { entityId: appointmentId };
    if (type) payload.type = type;
    return api.patch(ENDPOINTS.ADMIN.NOTIFICATIONS_MARK_READ_BY_ENTITY, payload);
  };

  const canShowMarkAsRead = (app) => {
    return (
      app.hasUnreadCancellation === true || app.hasUnreadReschedule === true
    );
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
  }, []);

  useEffect(() => {
    fetchAppointments(1);
  }, [filterStatus, filterDoctor, filterPatient, filterDateFrom, filterDateTo]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAppointments(newPage);
    }
  };

  // 🔥 NEW: PROCESS REFUND REQUEST (APPROVE/REJECT)
  const handleProcessRequest = async (app, action) => {
    if (!app.hasPendingRequest) return;
    const requestId = app.requestId; 
    
    let note = "";
    if (action === 'REJECT') {
      note = prompt("Enter reason for rejection:");
      if (!note) return;
    } else {
      if(!window.confirm("Are you sure? This will refund the money and cancel the appointment.")) return;
    }

    await toast.promise(
      api.post(ENDPOINTS.ADMIN.CANCELLATION_PROCESS, { requestId, action, adminNote: note }),
      {
        loading: "Processing...",
        success: "Processed successfully!",
        error: (err) => err?.response?.data?.error || "Failed to process"
      }
    );
    fetchAppointments(pagination.page);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    let reason = null;

    if (newStatus === "CANCELLED") {
      const input = window.prompt("Enter reason for cancellation (shown to patient):");
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
      link.setAttribute("download", `bookings_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Excel file downloaded!");
    } catch (err) {
      toast.error("Failed to export Excel file");
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
      link.setAttribute("download", `bookings_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("PDF file downloaded!");
    } catch (err) {
      toast.error("Failed to export PDF file");
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

  const isRescheduled = (app) =>
    app.history && Array.isArray(app.history) && app.history.some((h) => h.oldDate);

  if (planLoading) {
    return (
      <AdminLayout>
        <div className="py-32 flex justify-center"><Loader /></div>
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
            <p className="text-sm text-gray-500 mt-1">Manage patient appointments.</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {canUseExports && (
              <div className="flex gap-2">
                 <button onClick={exportToExcel} disabled={exporting} className="px-3 py-1.5 bg-white border border-green-600 text-green-700 rounded-lg text-xs font-bold hover:bg-green-50 flex items-center gap-1">📊 Excel</button>
                <button onClick={exportToPDF} disabled={exporting} className="px-3 py-1.5 bg-white border border-red-600 text-red-700 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center gap-1">📄 PDF</button>
              </div>
            )}
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
              {pagination.total} Total
            </span>
          </div>
        </div>

        {!canUseExports && <UpgradeNotice feature="Export to Excel/PDF" planName={plan?.name} />}

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLATION_REQUESTED">Refund Requests</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
            <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              <option value="">All Doctors</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input type="text" placeholder="Search patient..." value={filterPatient} onChange={(e) => setFilterPatient(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            <div className="flex gap-2">
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
              <button onClick={clearFilters} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">✕</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex justify-center"><Loader /></div>
        ) : (
          <>
            {/* MOBILE LIST */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {appointments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed">No bookings found.</div>
              ) : (
                appointments.map((app) => (
                  <MobileAppointmentCard
                    key={app.id}
                    app={app}
                    onUpdate={handleStatusUpdate}
                    isRescheduled={isRescheduled(app)}
                    canShowMarkAsRead={canShowMarkAsRead}
                    onMarkAsRead={handleMarkAsRead}
                    onProcessRequest={handleProcessRequest}
                  />
                ))
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase">Patient</th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase">Doctor</th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase">Schedule</th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase">Status</th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase">Payment Info</th>
                    <th className="p-5 font-bold text-gray-600 text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.length === 0 ? (
                    <tr><td colSpan="6" className="p-16 text-center text-gray-500 italic bg-gray-50">No bookings found.</td></tr>
                  ) : (
                    appointments.map((app) => (
                      <DesktopAppointmentRow
                        key={app.id}
                        app={app}
                        onUpdate={handleStatusUpdate}
                        isRescheduled={isRescheduled(app)}
                        canShowMarkAsRead={canShowMarkAsRead}
                        onMarkAsRead={handleMarkAsRead}
                        onProcessRequest={handleProcessRequest}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <span className="text-sm font-bold">Page {pagination.page} of {pagination.totalPages}</span>
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

// --- SUB COMPONENTS ---

const StatusBadge = ({ status, hasPendingRequest }) => {
  // 🔥 UPDATED BADGE FOR REQUESTS
  if (hasPendingRequest || status === 'CANCELLATION_REQUESTED') {
    return <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border bg-red-100 text-red-700 border-red-200 animate-pulse">REFUND REQUESTED</span>;
  }

  const styles = {
    CONFIRMED: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-100",
    COMPLETED: "bg-blue-50 text-blue-600 border-blue-100",
    NO_SHOW: "bg-orange-50 text-orange-700 border-orange-200",
    default: "bg-gray-100 text-gray-600 border-gray-200"
  };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${styles[status] || styles.default}`}>{status?.replace('_', ' ')}</span>;
};

const ActionButtons = ({ app, onUpdate, onProcessRequest }) => {
  // 🔥 NEW: REFUND REQUEST BUTTONS
  if (app.hasPendingRequest || app.status === 'CANCELLATION_REQUESTED') {
    return (
      <div className="flex flex-col gap-1 w-full">
         <div className="text-[10px] text-red-600 italic bg-red-50 p-1.5 rounded mb-1 border border-red-100">
           Reason: "{app.requestReason || "Patient requested cancellation"}"
         </div>
         <div className="flex gap-2">
            <button onClick={() => onProcessRequest(app, 'APPROVE')} className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm">Approve Refund</button>
            <button onClick={() => onProcessRequest(app, 'REJECT')} className="flex-1 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50">Reject</button>
         </div>
      </div>
    );
  }

  // STANDARD BUTTONS (UNCHANGED)
  return (
    <div className="flex gap-2">
      {app.status === "PENDING" && (
        <>
          <button onClick={() => onUpdate(app.id, "CONFIRMED")} className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700">Approve</button>
          <button onClick={() => onUpdate(app.id, "CANCELLED")} className="flex-1 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50">Reject</button>
        </>
      )}
      {app.status === "CONFIRMED" && (
        <>
          <button onClick={() => onUpdate(app.id, "COMPLETED")} className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700">Complete</button>
          <button onClick={() => onUpdate(app.id, "NO_SHOW")} className="flex-1 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-50">No-Show</button>
        </>
      )}
    </div>
  );
};

const MobileAppointmentCard = ({ app, onUpdate, isRescheduled, canShowMarkAsRead, onMarkAsRead, onProcessRequest }) => {
  const relativeDate = getRelativeDateLabel(app.slot?.date || app.date);
  
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border ${app.hasPendingRequest ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{app.patientName}</h3>
          <p className="text-sm text-gray-500">{app.patientPhone}</p>
        </div>
        <div className="text-right">
          <StatusBadge status={app.status} hasPendingRequest={app.hasPendingRequest} />
          <CancelMeta app={app} />
        </div>
      </div>
      <div className="space-y-3 text-sm text-gray-700 border-t border-b border-gray-100 py-4 my-4">
        <div className="flex items-center gap-3">
          <span>👨‍⚕️</span>
          <div><span className="font-bold block">{app.doctorName}</span><span className="text-xs text-blue-600">{app.doctorSpecialization}</span></div>
        </div>
        <div className="flex items-center gap-3">
          <span>🕒</span>
          <div>
            <div className="flex items-center gap-2">
              {relativeDate && <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 rounded uppercase">{relativeDate}</span>}
              <span className="font-medium">{app.dateFormatted}</span>
            </div>
            <span className="text-xs text-gray-500 block">{app.timeFormatted}</span>
            <span className="text-[10px] text-gray-400 block mt-1">Booked: {formatCreatedDate(app.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span>💰</span>
          <div className="text-xs">{getPaymentSummary(app)}
            {app.adminNote && <div className="mt-0.5 text-[10px] text-gray-500 italic">{app.adminNote}</div>}
          </div>
        </div>
        {isRescheduled && <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 rounded font-bold">⚠️ Rescheduled</span>}
      </div>
      
      {/* ACTION BUTTONS LOGIC */}
      <ActionButtons app={app} onUpdate={onUpdate} onProcessRequest={onProcessRequest} />
      
      {!app.hasPendingRequest && !["PENDING", "CONFIRMED"].includes(app.status) && canShowMarkAsRead(app) && (
        <button onClick={() => onMarkAsRead(app)} className="w-full bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-bold mt-2">Mark as read</button>
      )}
    </div>
  );
};

const DesktopAppointmentRow = ({ app, onUpdate, isRescheduled, canShowMarkAsRead, onMarkAsRead, onProcessRequest }) => {
  const relativeDate = getRelativeDateLabel(app.slot?.date || app.date);

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${app.hasPendingRequest ? 'bg-red-50/50' : ''}`}>
      <td className="p-5">
        <div className="font-bold text-gray-900">{app.patientName}</div>
        <div className="text-xs text-gray-500">{app.patientPhone}</div>
        <Link to={`/admin/patients/${app.userId}/history`} className="mt-1 inline-block text-[11px] text-blue-600 font-semibold hover:underline">View history</Link>
      </td>
      <td className="p-5">
        <div className="text-gray-900 text-sm font-bold">{app.doctorName}</div>
        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-max mt-1">{app.doctorSpecialization}</div>
      </td>
      <td className="p-5">
        <div className="flex items-center gap-2 mb-0.5">
           {relativeDate && (
             <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase tracking-wide">
               {relativeDate}
             </span>
           )}
        </div>
        <div className="font-bold text-gray-900 text-sm">
          {app.dateFormatted}
        </div>
        <div className="text-xs text-gray-600 font-mono">
          {app.timeFormatted}
        </div>
        <div className="mt-1.5 text-[10px] text-gray-400 font-medium">
           Booked: {formatCreatedDate(app.createdAt)}
        </div>
        {isRescheduled && <span className="block mt-1.5 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded w-max font-bold">⚠️ Rescheduled</span>}
      </td>
      <td className="p-5">
        <StatusBadge status={app.status} hasPendingRequest={app.hasPendingRequest} />
        <CancelMeta app={app} />
      </td>
      <td className="p-5 align-top">
        <div className="text-xs font-semibold text-gray-800">{getPaymentSummary(app)}</div>
        {app.adminNote && <div className="mt-1 text-[11px] text-gray-500 italic">{app.adminNote}</div>}
      </td>
      <td className="p-5">
        <div className="w-44">
          <ActionButtons app={app} onUpdate={onUpdate} onProcessRequest={onProcessRequest} />
          
          {!app.hasPendingRequest && !["PENDING", "CONFIRMED"].includes(app.status) && canShowMarkAsRead(app) ? (
            <button onClick={() => onMarkAsRead(app)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white mt-2">Mark as read</button>
          ) : (
            !app.hasPendingRequest && !["PENDING", "CONFIRMED"].includes(app.status) && (
              <span className="text-xs text-gray-400 font-bold uppercase">{app.status.replace('_', ' ')}</span>
            )
          )}
        </div>
      </td>
    </tr>
  );
};
