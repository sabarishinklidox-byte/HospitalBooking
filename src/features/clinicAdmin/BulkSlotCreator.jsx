// src/features/admin/BulkSlotCreator.jsx
import React, { useMemo, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { ENDPOINTS } from "../../lib/endpoints";
import { useAdminContext } from "../../context/AdminContext.jsx";

export default function BulkSlotCreator({ doctors = [], onSuccess }) {
  const { plan } = useAdminContext();
  const isLocked = !plan?.enableAuditLogs;

  const [formData, setFormData] = useState({
    doctorId: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    duration: "30",
    days: [1, 2, 3, 4, 5],
    paymentMode: "ONLINE",
    kind: "APPOINTMENT", // APPOINTMENT | BREAK
  });

  const [loading, setLoading] = useState(false);

  const daysOptions = useMemo(
    () => [
      { id: 1, label: "Mon" },
      { id: 2, label: "Tue" },
      { id: 3, label: "Wed" },
      { id: 4, label: "Thu" },
      { id: 5, label: "Fri" },
      { id: 6, label: "Sat" },
      { id: 0, label: "Sun" },
    ],
    []
  );

  const isBreak = formData.kind === "BREAK";

  const handleDayChange = (dayId) => {
    setFormData((prev) => {
      const newDays = prev.days.includes(dayId)
        ? prev.days.filter((d) => d !== dayId)
        : [...prev.days, dayId];
      return { ...prev, days: newDays };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // ✅ If BREAK, force FREE like single slot logic
    if (name === "kind") {
      setFormData((prev) => ({
        ...prev,
        kind: value,
        ...(value === "BREAK" ? { paymentMode: "FREE" } : {}),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (!formData.doctorId) return toast.error("Please select a doctor");
    if (!formData.startDate || !formData.endDate)
      return toast.error("Please select a date range");
    if (!formData.startTime) return toast.error("Please select start time");
    if (!formData.duration) return toast.error("Please select duration");
    if (!formData.days?.length)
      return toast.error("Please select at least one day");

    const loadingToastId = toast.loading("Creating slots...");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        duration: Number(formData.duration),
        days: formData.days.map(Number),
        paymentMode: formData.kind === "BREAK" ? "FREE" : formData.paymentMode,
      };

      const res = await api.post(ENDPOINTS.ADMIN.SLOTS_BULK, payload);

      toast.success(res.data.message || "Slots created successfully!", {
        id: loadingToastId,
      });

      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create slots", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLocked) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-8">
        <div className="font-semibold mb-1">Feature locked</div>
        <p className="text-sm">
          Bulk slot creation is not available on your current plan. Please
          upgrade your plan to enable this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        ⚡ Bulk Create Slots
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Select Doctor
            </label>
            <select
              name="doctorId"
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.doctorId}
              onChange={handleInputChange}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Slot Duration
            </label>
            <select
              name="duration"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.duration}
              onChange={handleInputChange}
            >
              <option value="15">15 Minutes</option>
              <option value="20">20 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-400 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Slot Start Time
            </label>
            <input
              type="time"
              name="startTime"
              required
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              value={formData.startTime}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Slot Type
            </label>
            <select
              name="kind"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.kind}
              onChange={handleInputChange}
            >
              <option value="APPOINTMENT">Appointment</option>
              <option value="BREAK">Break / Lunch</option>
            </select>
          </div>

          {!isBreak ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.paymentMode}
                onChange={handleInputChange}
              >
                <option value="ONLINE">Online Payment Only</option>
                <option value="OFFLINE">Pay at Clinic (Cash Only)</option>
                <option value="FREE">Free Appointments</option>
              </select>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
              Break slots are always FREE (payment mode forced to FREE).
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Repeat On Days
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOptions.map((day) => (
              <label
                key={day.id}
                className={`flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg border transition-all text-sm ${
                  formData.days.includes(day.id)
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.days.includes(day.id)}
                  onChange={() => handleDayChange(day.id)}
                  className="w-4 h-4 rounded text-[#0b3b5e] focus:ring-[#0b3b5e]"
                />
                <span className="font-medium">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.doctorId}
          className="w-full bg-[#003366] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#002244] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "✨ Generate Slots"}
        </button>
      </form>
    </div>
  );
}
