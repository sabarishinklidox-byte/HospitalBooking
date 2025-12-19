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
    startTime: "09:00", // Shift Start
    endTime: "17:00",   // Shift End (NEW)
    duration: "30",
    days: [1, 2, 3, 4, 5],
    paymentMode: "ONLINE",
    kind: "APPOINTMENT",
    lunchStart: "",     // NEW (Optional)
    lunchEnd: "",       // NEW (Optional)
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

    // Force FREE if BREAK
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
    if (!formData.startTime || !formData.endTime) 
      return toast.error("Please select shift start and end time");
    
    if (formData.lunchStart && !formData.lunchEnd)
        return toast.error("Lunch End Time is required if Start Time is set");

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
        
        {/* Row 1: Doctor & Duration */}
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

        {/* Row 2: Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-400"
            />
          </div>
        </div>

        {/* Row 3: Shift Times (Full Day) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <div>
            <label className="block text-xs font-bold text-blue-800 mb-1">
               Start Time (Shift Start)
            </label>
            <input
              type="time"
              name="startTime"
              required
              className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              value={formData.startTime}
              onChange={handleInputChange}
            />
          </div>

           <div>
            <label className="block text-xs font-bold text-blue-800 mb-1">
               End Time (Shift End)
            </label>
            <input
              type="time"
              name="endTime"
              required
              className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              value={formData.endTime}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Row 4: Lunch Break (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
           <div className="md:col-span-2">
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lunch Break (Optional)</span>
           </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
               Lunch Start
            </label>
            <input
              type="time"
              name="lunchStart"
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none font-mono"
              value={formData.lunchStart}
              onChange={handleInputChange}
            />
          </div>

           <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
               Lunch End
            </label>
            <input
              type="time"
              name="lunchEnd"
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-400 outline-none font-mono"
              value={formData.lunchEnd}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Row 5: Type & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 flex items-center">
              Break slots are always FREE.
            </div>
          )}
        </div>

        {/* Row 6: Days */}
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
          {loading ? "Processing..." : "✨ Generate All Slots"}
        </button>
      </form>
    </div>
  );
}
