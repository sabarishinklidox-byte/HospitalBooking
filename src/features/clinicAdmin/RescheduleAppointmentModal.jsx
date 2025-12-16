// src/features/clinicAdmin/RescheduleAppointmentModal.jsx
import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import Loader from "../../components/Loader.jsx";
import clsx from "clsx";
import { ENDPOINTS } from '../../lib/endpoints';

const PRIMARY_COLOR = "#0b3b5e";

export default function RescheduleAppointmentModal({
  open,
  onClose,
  appointment,      // { id, doctorId, doctorName, doctorSpeciality, date, time }
  clinicId,         // optional, if your API needs it
  onRescheduled,    // callback(updatedAppt)
}) {
  const [slotsByDay, setSlotsByDay] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [deleteOldSlot, setDeleteOldSlot] = useState(false);
  const [error, setError] = useState("");

  // ---------- load slots ----------
  const fetchSlots = async () => {
    if (!appointment?.doctorId) return;

    try {
      setLoadingSlots(true);
      const res = await api.get(
          ENDPOINTS.ADMIN.DOCTOR_SLOTS(appointment.doctorId),
        {
          params: {
            clinicId,
            from: new Date().toISOString().slice(0, 10),
            days: 7, // Today + next 6 days
          },
        }
      );

      const days = res.data || [];
      setSlotsByDay(days);
      if (days.length > 0) {
        setSelectedDate(days[0].date);
      }
    } catch (err) {
      console.error("Failed to load slots", err);
      setError("Failed to load available slots for this doctor.");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (!open || !appointment?.doctorId) return;

    // reset state every time modal opens for a new appointment
    setSlotsByDay([]);
    setSelectedSlot(null);
    setSelectedDate(null);
    setNote("");
    setDeleteOldSlot(false);
    setError("");

    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointment?.id, clinicId]);

  if (!open || !appointment) return null;

  // ---------- confirm reschedule ----------
  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) {
      setError("Please select a new time slot.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const res = await api.patch(
        `/admin/appointments/${appointment.id}/reschedule`,
        {
          newDate: selectedDate,
          newTime: selectedSlot.startTime,
          note,
          deleteOldSlot,
        }
      );

      onRescheduled?.(res.data.appointment);
      onClose();
    } catch (err) {
      console.error("Reschedule failed", err);
      const msg =
        err?.response?.data?.error ||
        "Failed to reschedule appointment. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const periods = ["Morning", "Afternoon", "Evening"];
  const dayObj =
    slotsByDay.find((d) => d.date === selectedDate) || { slots: [] };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 flex justify-between items-center"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <div>
            <h2 className="text-lg font-bold text-white">
              Reschedule Appointment
            </h2>
            <p className="text-xs text-blue-100">
              Choose a new slot for this patient.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Doctor + current slot info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-[#0b3b5e]">
              {appointment.doctorName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {appointment.doctorName}
              </p>
              <p className="text-xs text-gray-500">
                {appointment.doctorSpeciality}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Current: {appointment.date} at {appointment.time}
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* Date tabs */}
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
                    "px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2",
                    selectedDate === day.date
                      ? "border-[#0b3b5e] text-[#0b3b5e] bg-white"
                      : "border-transparent text-gray-600 bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div>{day.label || new Date(day.date).toDateString()}</div>
                  <div className="text-[11px] text-green-600">
                    {day.slots.length} slots available
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Slots grid */}
          {loadingSlots ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : (
            <div className="space-y-4">
              {periods.map((period) => {
                const periodSlots = dayObj.slots.filter(
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
                        const isSelected =
                          selectedSlot &&
                          selectedSlot.timeLabel === slot.timeLabel &&
                          selectedDate === dayObj.date;

                        return (
                          <button
                            key={`${slot.timeLabel}-${slot.startTime}`}
                            type="button"
                            onClick={() =>
                              setSelectedSlot({
                                ...slot,
                                date: dayObj.date,
                              })
                            }
                            className={clsx(
                              "px-4 py-2 rounded-md border text-sm min-w-[88px]",
                              isSelected
                                ? "bg-[#0b3b5e] text-white border-[#0b3b5e]"
                                : "bg-white text-gray-700 border-gray-200 hover:border-[#0b3b5e]"
                            )}
                          >
                            {slot.timeLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {dayObj.slots.length === 0 && (
                <p className="text-xs text-gray-400">
                  No slots available for this day.
                </p>
              )}
            </div>
          )}

          {/* Old slot handling toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="deleteOldSlot"
              type="checkbox"
              checked={deleteOldSlot}
              onChange={(e) => setDeleteOldSlot(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#0b3b5e]"
            />
            <label
              htmlFor="deleteOldSlot"
              className="text-xs text-gray-600 cursor-pointer"
            >
              Block the old time slot (do not allow new bookings on it)
            </label>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Admin note (optional)
            </label>
            <textarea
              className="w-full border rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0b3b5e]/60"
              rows={2}
              placeholder="E.g. Spoke to patient, rescheduled after confirmation."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
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
            {saving ? "Rescheduling..." : "Confirm Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
