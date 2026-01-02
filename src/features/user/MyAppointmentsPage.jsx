import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import UserLayout from "../../layouts/UserLayout.jsx";
import Loader from "../../components/Loader.jsx";
import Modal from "../../components/Modal.jsx";
import AppointmentCard from "../../features/user/AppointmentCard.jsx";
import { toast } from "react-hot-toast";
import { ENDPOINTS } from "../../lib/endpoints";

// ✅ HELPER: Format Seconds to MM:SS
const pad2 = (n) => String(n).padStart(2, "0");
const formatCountdown = (seconds) => {
  const s = Math.max(0, Number(seconds || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
};

// ✅ HELPER: Open Razorpay Popup
const openRazorpay = (options) => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      return reject("SDK_MISSING");
    }
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      toast.error(response.error.description || "Payment Failed");
      reject(response.error);
    });
    rzp.open();
  });
};

// ✅ HELPER: Check if a slot time has passed
const isSlotPassed = (slotDateStr, slotTimeStr) => {
  if (!slotDateStr || !slotTimeStr) return false;
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const slotDateOnly = new Date(slotDateStr).toISOString().split("T")[0];
  if (slotDateOnly < todayStr) return true;
  if (slotDateOnly > todayStr) return false;
  const [hours, minutes] = slotTimeStr.split(":").map(Number);
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  if (hours < currentHours) return true;
  if (hours === currentHours && minutes <= currentMinutes) return true;
  return false;
};

// Helper: Convert 24h to 12h format
const to12Hour = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  let hour = parseInt(h, 10);
  const minute = m ?? "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour < 10 ? "0" + hour : hour}:${minute} ${ampm}`;
};

export default function MyAppointmentsPage() {
  const navigate = useNavigate();
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

  // --- PAYMENT HOLD / TIMER STATE ---
  const [hold, setHold] = useState(null); 
  const [holdLeftSec, setHoldLeftSec] = useState(0);
  const holdTimerRef = useRef(null);

  // ----------------------------------------------------
  // ⏳ TIMER LOGIC
  // ----------------------------------------------------
  const stopHoldTimer = useCallback(() => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = null;
  }, []);

  const startHoldTimer = useCallback((expiresAtMs) => {
    stopHoldTimer();
    const tick = () => {
      const left = Math.ceil((expiresAtMs - Date.now()) / 1000);
      setHoldLeftSec(Math.max(0, left));
      if (left <= 0) {
        stopHoldTimer();
        setHold(null);
        toast.error("Payment hold expired. Please try rescheduling again.");
      }
    };
    tick(); // run immediately
    holdTimerRef.current = setInterval(tick, 1000);
  }, [stopHoldTimer]);

  useEffect(() => {
    return () => stopHoldTimer();
  }, [stopHoldTimer]);

  // ----------------------------------------------------
  // FETCH APPOINTMENTS
  // ----------------------------------------------------
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
  }, [page, statusFilter, doctorFilter, dateFrom, dateTo]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) setPage(newPage);
  };

  const getClinicId = (appt) => {
    return appt?.clinicId || appt?.clinic?.id || appt?.slot?.clinicId || null;
  };

  // ----------------------------------------------------
  // RESCHEDULE MODAL
  // ----------------------------------------------------
  const openReschedule = (appt) => {
    setSelectedAppt(appt);
    setNewDate("");
    setSlots([]);
    setSelectedNewSlotId(null);
    setRescheduleModalOpen(true);
    
    // Clear any previous holds for other appointments
    if (hold && hold.appointmentId !== appt.id) {
      setHold(null);
      stopHoldTimer();
    }
  };

  // ✅ FIXED: Fetch Slots WITH excludeAppointmentId
  useEffect(() => {
    if (!newDate || !selectedAppt) return;
    const controller = new AbortController();

    const fetchSlots = async () => {
      setSlotLoading(true);
      try {
        const clinicId = getClinicId(selectedAppt);
        const doctorId = selectedAppt?.doctor?.id;
        if (!clinicId || !doctorId) return;

        const res = await api.get(ENDPOINTS.USER.SLOTS, {
          signal: controller.signal,
          params: { 
            clinicId, 
            doctorId, 
            date: newDate,
            excludeAppointmentId: selectedAppt.id
          },
        });

        const data = res.data?.data ?? res.data ?? [];
        setSlots(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.name !== "CanceledError") toast.error("Failed to load slots");
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
      const loadingToast = toast.loading("Processing reschedule...");
      
      const res = await api.patch(
        ENDPOINTS.USER.RESCHEDULE_APPOINTMENT(selectedAppt.id),
        {
          appointmentId: selectedAppt.id,
          newSlotId: selectedNewSlotId,
          provider: "RAZORPAY", 
        }
      );

      toast.dismiss(loadingToast);
      const apiResponse = res.data;
      
      // === SCENARIO A: PAYMENT REQUIRED ===
      if (apiResponse.status === "PAYMENT_REQUIRED") {
        setRescheduleModalOpen(false);
        const responseData = apiResponse.data;
        const backendExpiry = responseData.paymentExpiry || responseData.expiresAt;
        const expiresAtMs = backendExpiry 
          ? new Date(backendExpiry).getTime()
          : Date.now() + (responseData.expiresIn || 600) * 1000;

        if (expiresAtMs <= Date.now()) {
          toast.error('Payment session expired. Please try again.');
          return;
        }

        const holdData = {
          appointmentId: responseData.appointmentId,
          key: responseData.key,
          amount: responseData.amount,
          orderId: responseData.orderId,
          slotId: selectedNewSlotId,
          clinicId: getClinicId(selectedAppt),
          expiresAtMs,
          isReschedule: true
        };

        setHold(holdData);
        startHoldTimer(expiresAtMs);
        triggerPayment(holdData);
        return;
      }

      // === SCENARIO B: CLINIC PAYMENT ===
      if (apiResponse.status === "CLINIC_PAYMENT") {
        toast.success(`✅ Rescheduled! Pay ₹${apiResponse.data.amount} at clinic`);
        setRescheduleModalOpen(false);
        fetchAppointments();
        return;
      }

      // === SCENARIO C: SUCCESS ===
      toast.success("✅ Rescheduled successfully!");
      setRescheduleModalOpen(false);
      fetchAppointments();

    } catch (err) {
      toast.dismiss();
      console.error('❌ RESCHEDULE ERROR:', err);
      const msg = err.response?.data?.error || "Reschedule failed";
      toast.error(msg);
    }
  };

  const triggerPayment = async (paymentData) => {
    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: "INR",
      name: "Clinic Booking - Reschedule",
      description: "Confirm your new appointment slot",
      order_id: paymentData.orderId,
      handler: async function (response) {
        try {
          const verifyToast = toast.loading("Verifying payment...");
          await api.post(ENDPOINTS.PAYMENT.VERIFY_RAZORPAY, {
            appointmentId: paymentData.appointmentId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            notes: { type: "RESCHEDULE", appointmentId: paymentData.appointmentId }
          });
          
          toast.dismiss(verifyToast);
          toast.success("✅ Payment confirmed! Appointment rescheduled.");
          stopHoldTimer();
          setHold(null);
          fetchAppointments();
        } catch (err) {
          toast.dismiss();
          toast.error("Payment verification failed. Contact support.");
        }
      },
      prefill: {
        name: selectedAppt?.user?.name || "",
        contact: selectedAppt?.user?.phone || "",
        email: selectedAppt?.user?.email || "",
      },
      theme: { color: "#0b3b5e" },
    };
    
    await openRazorpay(options);
  };

  // ----------------------------------------------------
  // CANCEL & REVIEW
  // ----------------------------------------------------
  const handleCancel = async (appt) => {
    const isOnlinePay = appt.slot?.paymentMode === "ONLINE";
    const confirmText = isOnlinePay
      ? "Do you want to request cancellation for this paid appointment?"
      : "Do you want to cancel this appointment?";

    if (!window.confirm(confirmText)) return;
    const reason = window.prompt("Reason (optional):")?.trim() || null;

    try {
      await toast.promise(
        api.post(ENDPOINTS.USER.CANCEL_APPOINTMENT(appt.id), { reason }),
        {
          loading: "Processing...",
          success: "Appointment cancelled.",
          error: "Failed to cancel",
        }
      );
      fetchAppointments();
    } catch {}
  };

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
          loading: "Submitting...",
          success: "Review submitted!",
          error: "Failed to submit",
        }
      );
      setReviewModalOpen(false);
      fetchAppointments();
    } catch {}
  };
  
  const ratingLabels = { 1: "Very poor", 2: "Below average", 3: "Average", 4: "Very good", 5: "Excellent" };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-[#0b3b5e] mb-4">My Appointments</h1>

        {/* ⚠️ PAYMENT HOLD BANNER ⚠️ */}
        {hold && holdLeftSec > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="text-amber-900 font-bold text-sm">Payment hold active</p>
                <p className="text-amber-700 text-xs">
                  Reschedule slot reserved. Time remaining:{" "}
                  <span className="font-mono font-bold text-base text-amber-900">
                    {formatCountdown(holdLeftSec)}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => triggerPayment(hold)}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm shadow transition-transform active:scale-95"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* FILTERS */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setPage(1); setDateFrom(e.target.value); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
            </input>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setPage(1); setDateTo(e.target.value); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
            </input>
          </div>
        </div>

        {/* LIST */}
        {loading ? <Loader /> : (
          <>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <p className="text-gray-500">You have no appointments.</p>
              ) : (
                appointments.map((app) => (
                  <AppointmentCard
                    key={app.id}
                    app={app}
                    // 🔥 FIXED: Pass 'onReview' only if status is COMPLETED
                    onReview={app.status === "COMPLETED" ? openReviewModal : undefined}
                    onReschedule={app.status !== "CANCELLED" && app.status !== "COMPLETED" ? openReschedule : undefined}
                    onCancel={app.status !== "CANCELLED" && app.status !== "COMPLETED" ? handleCancel : undefined}
                    // 🔥 FIXED: Visual indicator for status
                    statusLabel={app.status} 
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
                <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
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

        {/* RESCHEDULE MODAL */}
        <Modal
          isOpen={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          title="Reschedule Appointment"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select a new date for <strong>Dr. {selectedAppt?.doctor?.name}</strong></p>

            <div>
              <label className="block text-sm font-medium mb-1">New Date</label>
              <input
                type="date"
                className="input w-full border p-2 rounded"
                min={new Date().toISOString().split("T")[0]}
                value={newDate}
                onChange={(e) => { setSelectedNewSlotId(null); setNewDate(e.target.value); }}
              />
            </div>

            {newDate && (
              <div>
                <label className="block text-sm font-medium mb-2">Slots</label>
                {slotLoading ? <p className="text-xs text-gray-400">Loading...</p> : slots.length === 0 ? <p className="text-sm text-red-500">No slots found.</p> : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => {
                      const booked = !!slot.isBooked;
                      const isMyCurrentSlot = currentSlotId && slot.id === currentSlotId;
                      const isPassed = isSlotPassed(newDate, slot.time);
                      const isMyHold = slot.isMyHold || false;
                      const disabled = isPassed || (booked && !isMyHold && !isMyCurrentSlot);

                      const paymentMode = slot.paymentMode || "OFFLINE";
                      const price = slot.price || 0;
                      const isFree = paymentMode === "FREE" || price === 0;

                      let badgeLabel = isFree ? "FREE" : 
                        isMyHold ? "YOUR HOLD" : 
                        paymentMode === "ONLINE" ? `₹${price} ONLINE` : `₹${price} CLINIC`;
                      
                      let badgeColor = isFree ? "bg-emerald-50 text-emerald-600" : 
                        isMyHold ? "bg-orange-50 text-orange-600" :
                        paymentMode === "ONLINE" ? "bg-purple-50 text-purple-600" : "bg-orange-50 text-orange-600";

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => !disabled && setSelectedNewSlotId(slot.id)}
                          className={`py-2 px-1 text-sm border rounded transition relative overflow-hidden flex flex-col items-center justify-center gap-1 min-h-[60px]
                            ${selectedNewSlotId === slot.id ? "bg-[#0b3b5e] text-white border-[#0b3b5e] ring-2 ring-offset-1 ring-[#0b3b5e]" : 
                              disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60" : 
                              isMyHold ? "bg-orange-50 border-orange-200 hover:border-orange-300" : 
                              isMyCurrentSlot ? "bg-blue-50 text-blue-700 border-blue-200" : 
                              "bg-white hover:border-blue-500 hover:shadow-sm"}`}
                        >
                          <div className={`font-semibold ${isPassed ? "line-through opacity-70" : ""}`}>
                            {to12Hour(slot.time)}
                          </div>
                          
                          {!disabled && (
                            <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide 
                              ${selectedNewSlotId === slot.id ? "bg-white/20 text-white" : badgeColor}`}>
                              {badgeLabel}
                            </div>
                          )}
                          
                          <div className="text-[9px] leading-tight font-medium">
                            {isMyCurrentSlot ? <span className={selectedNewSlotId === slot.id ? "text-blue-200" : "text-blue-600"}>(Current)</span> : 
                             isPassed ? <span className="text-red-400">Passed</span> : 
                             isMyHold ? <span className="text-orange-600 font-bold">Your hold</span> : 
                             booked ? <span className="text-gray-400">(Booked)</span> : null}
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

        {/* REVIEW MODAL */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Rate Your Experience"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5 justify-center text-3xl py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= reviewData.rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className={`transition transform duration-150 ${active ? "text-yellow-400 scale-110 drop-shadow-sm" : "text-gray-300 hover:text-yellow-300"} hover:scale-125 focus:outline-none`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <p className="text-center text-xs font-semibold text-gray-600 h-4">{ratingLabels[reviewData.rating]}</p>
            <textarea
              className="w-full border border-gray-200 p-3 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-200 outline-none"
              rows="3"
              placeholder="Share a few words..."
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
