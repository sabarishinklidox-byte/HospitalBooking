import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import UserLayout from "../../layouts/UserLayout.jsx";
import Loader from "../../components/Loader.jsx";
import Modal from "../../components/Modal.jsx";
import AppointmentCard from "../../features/user/AppointmentCard.jsx";
import { toast } from "react-hot-toast";
import { ENDPOINTS } from "../../lib/endpoints";

// ✅ HELPER: Check if a slot time has passed (Same as Booking Page)
const isSlotPassed = (slotDateStr, slotTimeStr) => {
    if (!slotDateStr || !slotTimeStr) return false;
    
    // Normalize dates to YYYY-MM-DD strings for comparison
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const slotDateOnly = new Date(slotDateStr).toISOString().split('T')[0];
    
    // 1. If date is in the past, it's passed
    if (slotDateOnly < todayStr) return true;
    
    // 2. If date is in future, it's NOT passed
    if (slotDateOnly > todayStr) return false;

    // 3. If date is TODAY, check time
    const [hours, minutes] = slotTimeStr.split(':').map(Number);
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    if (hours < currentHours) return true;
    if (hours === currentHours && minutes <= currentMinutes) return true;
    
    return false;
};

// Helper to convert 24h to 12h format
const to12Hour = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const minute = m ?? '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour < 10 ? '0' + hour : hour}:${minute} ${ampm}`;
};

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters + pagination
  const [statusFilter, setStatusFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // --- RESCHEDULE STATE ---
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [slots, setSlots] = useState([]); 
  const [selectedNewSlotId, setSelectedNewSlotId] = useState(null);
  const [slotLoading, setSlotLoading] = useState(false);

  // --- REVIEW STATE ---
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewAppt, setSelectedReviewAppt] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  const buildParams = () => ({
    page,
    limit: 10,
    status: statusFilter || undefined,
    doctor: doctorFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.USER.APPOINTMENTS, { params: buildParams() });

      if (res.data?.data && res.data?.pagination) {
        setAppointments(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error("Error fetching appointments", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, doctorFilter, dateFrom, dateTo]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) setPage(newPage);
  };

  // ---------- RESCHEDULE ----------
  const getClinicId = (appt) => {
    return appt?.clinicId || appt?.clinic?.id || appt?.slot?.clinicId || appt?.slot?.clinic?.id || null;
  };

  const openReschedule = (appt) => {
    setSelectedAppt(appt);
    setNewDate("");
    setSlots([]);
    setSelectedNewSlotId(null);
    setRescheduleModalOpen(true);
  };

  useEffect(() => {
    if (!newDate || !selectedAppt) return;

    const controller = new AbortController();

    const fetchSlots = async () => {
      setSlotLoading(true);
      try {
        const clinicId = getClinicId(selectedAppt);
        const doctorId = selectedAppt?.doctor?.id;

        if (!clinicId || !doctorId) {
          toast.error("Missing clinicId/doctorId for slots fetch");
          setSlots([]);
          return;
        }

        const res = await api.get(ENDPOINTS.USER.SLOTS, {
          signal: controller.signal,
          params: {
            clinicId,
            doctorId,
            date: newDate,
          },
        });

        const data = res.data?.data ?? res.data ?? [];
        setSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.name === "CanceledError") return;
        console.error(err);
        toast.error("Failed to load slots for selected date");
      } finally {
        setSlotLoading(false);
      }
    };

    fetchSlots();
    return () => controller.abort();
  }, [newDate, selectedAppt]);

  const currentSlotId = useMemo(() => selectedAppt?.slot?.id ?? null, [selectedAppt]);

  const handleRescheduleSubmit = async () => {
    if (!selectedNewSlotId) {
      toast.error("Please select a new slot");
      return;
    }

    try {
      await toast.promise(
        api.patch(ENDPOINTS.USER.RESCHEDULE_APPOINTMENT(selectedAppt.id), { newSlotId: selectedNewSlotId }),
        {
          loading: "Rescheduling your appointment...",
          success: "Appointment rescheduled successfully!",
          error: (err) => err.response?.data?.error || "Reschedule failed",
        }
      );

      setRescheduleModalOpen(false);
      fetchAppointments();
    } catch {
      // handled by toast.promise
    }
  };

  // ---------- CANCEL ----------
  const handleCancel = async (appt) => {
    const isOnlinePay = appt.slot?.paymentMode === "ONLINE";
    const confirmText = isOnlinePay
      ? "Do you want to request cancellation for this paid appointment?"
      : "Do you want to cancel this appointment?";

    if (!window.confirm(confirmText)) return;

    let reason = window.prompt("Reason for cancellation (optional, shown to clinic):");
    if (reason === null) return;
    reason = reason.trim() || null;

    try {
      await toast.promise(api.post(ENDPOINTS.USER.CANCEL_APPOINTMENT(appt.id), { reason }), {
        loading: isOnlinePay ? "Submitting cancellation request..." : "Cancelling appointment...",
        success: (res) =>
          res.data?.message || (isOnlinePay ? "Cancellation request sent to clinic." : "Appointment cancelled."),
        error: (err) => err.response?.data?.error || "Failed to cancel appointment",
      });

      fetchAppointments();
    } catch {
      // handled by toast.promise
    }
  };

  // ---------- REVIEW ----------
  const openReviewModal = (appt) => {
    setSelectedReviewAppt(appt);
    setReviewData({ rating: 5, comment: "" });
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    try {
      await toast.promise(
        api.post(ENDPOINTS.USER.REVIEWS, {
          appointmentId: selectedReviewAppt.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
        {
          loading: "Submitting your review...",
          success: "Review submitted! Thank you.",
          error: (err) => err.response?.data?.error || "Failed to submit review",
        }
      );

      setReviewModalOpen(false);
      fetchAppointments();
    } catch {
      // handled by toast.promise
    }
  };

  const ratingLabels = { 1: "Very poor", 2: "Below average", 3: "Average", 4: "Very good", 5: "Excellent" };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-[#0b3b5e] mb-4">My Appointments</h1>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No-show</option>
              <option value="CANCEL_REQUESTED">Cancel requested</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setPage(1);
                setDateFrom(e.target.value);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setPage(1);
                setDateTo(e.target.value);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <p className="text-gray-500">You have no appointments.</p>
              ) : (
                appointments.map((app) => (
                  <AppointmentCard
                    key={app.id}
                    app={app}
                    onReschedule={openReschedule}
                    onReview={openReviewModal}
                    onCancel={handleCancel}
                  />
                ))
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* === MODAL 1: RESCHEDULE === */}
        <Modal isOpen={rescheduleModalOpen} onClose={() => setRescheduleModalOpen(false)} title="Reschedule Appointment">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a new date for <strong>Dr. {selectedAppt?.doctor?.name}</strong>
            </p>

            <div>
              <label className="block text-sm font-medium mb-1">New Date</label>
              <input
                type="date"
                className="input w-full border p-2 rounded"
                min={new Date().toISOString().split("T")[0]}
                value={newDate}
                onChange={(e) => {
                  setSelectedNewSlotId(null);
                  setNewDate(e.target.value);
                }}
              />
            </div>

            {newDate && (
              <div>
                <label className="block text-sm font-medium mb-2">Slots</label>

                {slotLoading ? (
                  <p className="text-xs text-gray-400">Loading...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-red-500">No slots found.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const booked = !!slot.isBooked;
                      const isMyCurrentSlot = currentSlotId && slot.id === currentSlotId;
                      
                      // ✅ Check PASSING Logic
                      const isPassed = isSlotPassed(newDate, slot.time);
                      
                      // Disable if: Passed OR (Booked AND Not mine)
                      const disabled = isPassed || (booked && !isMyCurrentSlot);

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            if (!disabled) setSelectedNewSlotId(slot.id);
                          }}
                          className={`py-2 text-sm border rounded transition relative overflow-hidden
                            ${
                              selectedNewSlotId === slot.id
                                ? "bg-[#0b3b5e] text-white border-[#0b3b5e]"
                                : disabled
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                                : booked && isMyCurrentSlot
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 hover:border-blue-500"
                            }`}
                          title={
                            isMyCurrentSlot
                              ? "Current slot (yours)"
                              : isPassed
                              ? "Time passed"
                              : booked
                              ? "Booked"
                              : "Available"
                          }
                        >
                          <div className={isPassed ? "line-through opacity-70" : ""}>
                            {to12Hour(slot.time)}
                          </div>
                          
                          <div className="text-[10px] leading-tight mt-0.5 font-medium">
                            {isMyCurrentSlot ? (
                                <span className="text-blue-600">(Current)</span>
                            ) : isPassed ? (
                                <span className="text-red-400">Passed</span>
                            ) : booked ? (
                                <span className="text-gray-400">(Booked)</span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleRescheduleSubmit}
              disabled={!selectedNewSlotId}
              className="w-full bg-[#0b3b5e] text-white py-3 rounded-lg font-bold mt-4 disabled:opacity-50 transition-opacity"
            >
              Confirm Change
            </button>
          </div>
        </Modal>

        {/* === MODAL 2: REVIEW === */}
        <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title="Rate Your Experience">
           {/* ... (Review Modal Content - Same as before) ... */}
           <div className="flex flex-col items-center gap-3">
             <div className="flex gap-1.5 justify-center text-3xl py-2">
               {[1, 2, 3, 4, 5].map((star) => {
                 const active = star <= reviewData.rating;
                 return (
                   <button
                     key={star}
                     type="button"
                     onClick={() => setReviewData({ ...reviewData, rating: star })}
                     className={`transition transform duration-150 ${
                       active ? "text-yellow-400 scale-110 drop-shadow-sm" : "text-gray-300 hover:text-yellow-300"
                     } hover:scale-125 focus:outline-none`}
                   >
                     ★
                   </button>
                 );
               })}
             </div>
             <p className="text-center text-xs font-semibold text-gray-600 h-4">
               {ratingLabels[reviewData.rating]}
             </p>
             <textarea
               className="w-full border border-gray-200 p-3 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
               rows="3"
               placeholder="Share a few words about your experience (optional)..."
               value={reviewData.comment}
               onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
             />
             <button
               onClick={handleReviewSubmit}
               className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold text-sm shadow-sm"
             >
               Submit review
             </button>
           </div>
        </Modal>
      </div>
    </UserLayout>
  );
}
