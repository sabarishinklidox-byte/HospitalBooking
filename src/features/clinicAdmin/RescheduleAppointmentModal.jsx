import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import Loader from "../../components/Loader.jsx";
import clsx from "clsx";
import { ENDPOINTS } from "../../lib/endpoints";
import toast from 'react-hot-toast';

const PRIMARY_COLOR = "#0b3b5e";

// 🔥 Local date (no UTC shift)
const getLocalDateString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export default function RescheduleAppointmentModal({
  open,
  onClose,
  appointment, 
  onRescheduled,
}) {
  const [slotsByDay, setSlotsByDay] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [deleteOldSlot, setDeleteOldSlot] = useState(false);
  const [error, setError] = useState("");

  // 🔥 window start for infinite navigation
  const [fromDate, setFromDate] = useState(getLocalDateString());
  const windowSize = 7;

  const fetchSlots = async (baseFrom = fromDate) => {
    if (!appointment?.doctorId || !appointment?.id) return;

    try {
      setLoadingSlots(true);
      setError("");

      const res = await api.get(
        ENDPOINTS.ADMIN.DOCTOR_SLOTS(appointment.doctorId), 
        {
          params: {
            from: baseFrom,         
            days: windowSize,
            excludeAppointmentId: appointment.id,
          },
        }
      );

      const days = Array.isArray(res.data) ? res.data : [];
      setSlotsByDay(days);
      setSelectedSlot(null);
      setSelectedDate(days[0]?.date ?? null);
    } catch (err) {
      console.error("Failed to load slots", err);
      setError("Failed to load available slots for this doctor.");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (!open || !appointment?.doctorId) return;

    setSlotsByDay([]);
    setSelectedSlot(null);
    setSelectedDate(null);
    setNote("");
    setDeleteOldSlot(false);
    setError("");

    const todayStr = getLocalDateString();
    setFromDate(todayStr);
    fetchSlots(todayStr);
  }, [open, appointment?.id, appointment?.doctorId]);

  if (!open || !appointment) return null;

  // 🔥 move 7-day window forward/backward (infinite reschedule)
  const shiftWindow = (deltaDays) => {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + deltaDays);
    const newFrom = d.toISOString().slice(0, 10);
    setFromDate(newFrom);
    fetchSlots(newFrom);
  };

  // 🔥 FIXED: Complete slot selection with TIME!
  const handleSlotSelect = (slot, dayDate) => {
    setSelectedSlot({
      slotId: slot.slotId,
      time: slot.time || slot.timeLabel,        // ✅ CRITICAL FIX!
      timeLabel: slot.timeLabel,
      date: dayDate,
      priceDisplay: slot.priceDisplay,
      slotType: slot.slotType,
      period: slot.period,
      isBooked: slot.isBooked
    });
    setSelectedDate(dayDate);
  };
const convertTo24Hour = (time12h) => {
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
  // const handleConfirm = async () => {
  //   if (!selectedDate || !selectedSlot?.slotId || !selectedSlot.time) {
  //     setError("Please select a valid time slot.");
  //     return;
  //   }

  //   if (selectedSlot?.isBooked) {
  //     setError("This slot is already booked. Please choose another slot.");
  //     return;
  //   }

  //   try {
  //     setSaving(true);
  //     setError("");

  //     console.log('🚀 Rescheduling to:', {
  //       newSlotId: selectedSlot.slotId,
  //       newDate: selectedDate,
  //       newTime: selectedSlot.time,      // ✅ NOW GUARANTEED!
  //       note,
  //       deleteOldSlot
  //     });

  //     const res = await api.patch(
  //       `${ENDPOINTS.ADMIN.APPOINTMENT_BY_ID(appointment.id)}/reschedule`,
  //       {
  //         newSlotId: selectedSlot.slotId,
  //         newDate: selectedDate,
  //         newTime: selectedSlot.time,      // ✅ FIXED!
  //         note,
  //         deleteOldSlot,
  //       }
  //     );

  //     // Handle financial alerts
  //     const status = res.data?.financialStatus;
  //     const adminAlert = res.data?.adminNote || res.data?.financialAction;

  //     if (status === 'PAY_DIFFERENCE' || status === 'PAY_DIFFERENCE_OFFLINE') {
  //       toast((t) => (
  //         <div className="text-sm">⚠️ <b>Collect Payment!</b><br/>{adminAlert}</div>
  //       ), { duration: 8000, icon: '💰' });
  //     } else if (status === 'REFUND_AT_CLINIC' || status === 'FULL_REFUND') {
  //       toast((t) => (
  //         <div className="text-sm">ℹ️ <b>Refund Required!</b><br/>{adminAlert}</div>
  //       ), { duration: 8000, icon: '💸' });
  //     } else if (status === 'FREE_SLOT') {
  //       toast.success("✅ Rescheduled to FREE slot!");
  //     } else {
  //       toast.success("✅ Rescheduled successfully!");
  //     }

  //     onRescheduled?.(res.data?.appointment);
  //     onClose();
  //   } catch (err) {
  //     console.error("❌ Reschedule failed", err);
  //     setError(err?.response?.data?.error || "Failed to reschedule appointment.");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
const handleConfirm = async () => {
    // 1. Validation
    if (!selectedDate || !selectedSlot?.slotId || !selectedSlot.time) {
      setError("Please select a valid time slot.");
      return;
    }

    if (selectedSlot?.isBooked) {
      setError("This slot is already booked. Please choose another slot.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // 2. API Call to Backend
      const res = await api.patch(
        `${ENDPOINTS.ADMIN.APPOINTMENT_BY_ID(appointment.id)}/reschedule`,
        {
        
          newDate: selectedDate,
          newTime: convertTo24Hour(selectedSlot.time),
          note,
   
        }
      );

      /**
       * 3. DATA EXTRACTION
       * We extract the updated appointment object. 
       * This object must contain the new 'amount' (900) and 'diffAmount' (400).
       */
      const updatedApp = res.data?.appointment || res.data;
      const status = res.data?.financialStatus || updatedApp?.financialStatus;
      const adminAlert = res.data?.adminNote || res.data?.financialAction || updatedApp?.adminNote;

      // 4. FINANCIAL ALERTS (Toasts)
      if (status === 'PAY_DIFFERENCE' || status === 'PAY_DIFFERENCE_OFFLINE') {
        toast((t) => (
          <div className="text-sm">
            <span className="font-bold text-orange-600">💰 Payment Required</span>
            <br />
            {adminAlert || `Please collect the difference at the clinic.`}
          </div>
        ), { duration: 6000 });
      } 
      else if (status === 'REFUND_AT_CLINIC' || status === 'FULL_REFUND') {
        toast((t) => (
          <div className="text-sm">
            <span className="font-bold text-blue-600">💸 Refund Due</span>
            <br />
            {adminAlert || `Patient is owed a refund.`}
          </div>
        ), { duration: 6000 });
      } 
      else if (status === 'FREE_SLOT') {
        toast.success("Rescheduled to a free slot.");
      } 
      else {
        toast.success("Appointment rescheduled successfully!");
      }

      /**
       * 5. STATE SYNC
       * We pass the updatedApp back to the parent.
       * The Parent's 'onRescheduled' must update the list so the 
       * AppointmentCard receives the new 900/400 values.
       */
      if (onRescheduled) {
        onRescheduled(updatedApp);
      }
      
      onClose();

    } catch (err) {
      
      console.error("❌ Reschedule Error:", err);
        console.error("❌ FULL ERROR:", {
    message: err.message,
    status: err.response?.status,
    statusText: err.response?.statusText,
    data: err.response?.data,
    url: err.config?.url,
    method: err.config?.method,
  });
  
      const serverError = err?.response?.data?.error || "Failed to reschedule.";
      setError(serverError);
      toast.error(serverError);
    } finally {
      setSaving(false);
    }
  };
  const periods = ["Morning", "Afternoon", "Evening"];
  const dayObj = slotsByDay.find((d) => d.date === selectedDate) || { slots: [] };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center shrink-0"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <div>
            <h2 className="text-lg font-bold text-white">
              Reschedule Appointment
            </h2>
            <p className="text-xs text-blue-100">
              Choose a new slot (navigate weeks for future dates).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 space-y-5 overflow-y-auto grow custom-scrollbar">
          {/* Doctor info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-[#0b3b5e]">
              {appointment.doctorName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {appointment.doctorName}
              </p>
              <p className="text-xs text-gray-500">
                {appointment.doctorSpeciality || appointment.speciality?.name || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Current: {appointment.date} at {appointment.time}
              </p>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* Week navigator */}
          <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
            <button
              type="button"
              onClick={() => shiftWindow(-windowSize)}
              className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >
              ‹ Previous {windowSize} days
            </button>
            <span>Starting from {fromDate}</span>
            <button
              type="button"
              onClick={() => shiftWindow(windowSize)}
              className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50"
            >
              Next {windowSize} days ›
            </button>
          </div>

          {/* Day tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {slotsByDay.map((day) => (
                <button
                  key={day.date}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedSlot(null);
                  }}
                  className={clsx(
                    "px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors",
                    selectedDate === day.date
                      ? "border-[#0b3b5e] text-[#0b3b5e] bg-white"
                      : "border-transparent text-gray-600 bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div>{day.label || new Date(day.date).toDateString()}</div>
                  <div className="text-[11px] text-gray-500">
                    {day.slots?.length ?? 0} slots
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Slots */}
          {loadingSlots ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : (
            <div className="space-y-4 min-h-[150px]">
              {periods.map((period) => {
                const periodSlots = (dayObj.slots || []).filter(
                  (s) => s.period === period
                );
                if (periodSlots.length === 0) return null;

                return (
                  <div key={period}>
                    <p className="text-xs font-semibold text-gray-500 mb-2">
                      {period}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {periodSlots.map((slot) => {
                        const booked = !!slot.isBooked;
                        const isSelected =
                          selectedSlot?.slotId === slot.slotId &&
                          selectedDate === dayObj.date;

                        return (
                          <button
  key={slot.slotId}
  type="button"
  disabled={booked || loadingSlots}
  onClick={() => !booked && setSelectedSlot({
    slotId: slot.slotId,
    time: slot.timeLabel,           // 🔥 CRITICAL!
    timeLabel: slot.timeLabel,
    date: dayObj.date
  })}
                            className={clsx(
                              "px-4 py-3 rounded-lg border-2 text-sm min-w-[120px] transition-all flex flex-col items-center gap-1 shadow-sm",
                              booked
                                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                : isSelected
                                ? "bg-[#0b3b5e] text-white border-[#0b3b5e] shadow-md scale-105"
                                : "bg-white text-gray-900 border-gray-200 hover:border-[#0b3b5e] hover:shadow-md hover:scale-[1.02]"
                            )}
                          >
                            {/* Time */}
                            <div className="font-semibold">{slot.timeLabel}</div>
                            
                            {/* 🔥 NEW: Price & Type Display */}
                            <div className="flex items-center gap-1 text-xs">
                              <span className={clsx(
                                "font-bold",
                                slot.slotType === "FREE" ? "text-green-600" : 
                                slot.slotType === "Online Pay" ? "text-blue-600" : 
                                "text-orange-600"
                              )}>
                                {slot.priceDisplay}
                              </span>
                              {slot.slotType !== "FREE" && (
                                <span className="text-gray-400 text-[10px]">
                                  {slot.slotType === "Online Pay" ? "💳" : "🏥"}
                                </span>
                              )}
                            </div>

                            {/* Booked indicator */}
                            {booked && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                                Booked
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {(dayObj.slots || []).length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  No slots available for this day.
                </p>
              )}
            </div>
          )}

          {/* Settings Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
            {/* Block old slot */}
            <div className="flex items-center gap-2">
              <input
                id="deleteOldSlot"
                type="checkbox"
                checked={deleteOldSlot}
                onChange={(e) => setDeleteOldSlot(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#0b3b5e]"
              />
              <label
                htmlFor="deleteOldSlot"
                className="text-xs text-gray-700 font-medium cursor-pointer"
              >
                Block the old time slot (prevent new bookings)
              </label>
            </div>

            {/* Admin note */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Admin note (Internal reason)
              </label>
              <textarea
                className="w-full border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0b3b5e]/60 bg-white"
                rows={2}
                placeholder="e.g. Patient requested change via phone"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 flex flex-col shrink-0">
          {/* ⚠️ ADMIN WARNING BANNER */}
          <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-amber-800 text-xs">
            <span className="text-lg">📞</span> 
            <span>
              <strong>Required:</strong> Please contact the patient 
              {appointment.userPhone ? ` (${appointment.userPhone})` : ''} 
              to confirm this new time before clicking confirm.
            </span>
          </div>

          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedSlot || saving}
              className={clsx(
                "px-5 py-2 text-sm font-bold rounded-lg text-white disabled:opacity-60",
                "shadow-md hover:shadow-lg transform hover:-translate-y-[1px]",
                "transition-all"
              )}
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {saving ? "Processing..." : "Confirm & Notify Patient"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
