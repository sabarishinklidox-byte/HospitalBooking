import React, { useMemo, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { ENDPOINTS } from "../../lib/endpoints";
import { useAdminContext } from "../../context/AdminContext.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':');
  const date = new Date();
  date.setHours(Number(h));
  date.setMinutes(Number(m));
  date.setSeconds(0);
  return date;
};

export default function BulkSlotCreator({ doctors = [], onSuccess }) {
  const { plan } = useAdminContext();
  const isLocked = !plan?.enableAuditLogs;
  const todayStr = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    doctorId: "",
    startDate: todayStr, // Default to today
    endDate: "",
    startTime: "09:00", 
    endTime: "17:00",   
    duration: "30",
    days: [1, 2, 3, 4, 5],
    paymentMode: "ONLINE",
    kind: "APPOINTMENT",
    lunchStart: "",     
    lunchEnd: "",       
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

  const handleTimeChange = (name, date) => {
    if (!date) {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        return;
    }
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    setFormData((prev) => ({ ...prev, [name]: `${h}:${m}` }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  // ✅ NEW: Filter out past times in the Time Picker
  const filterPassedTime = (time) => {
    const now = new Date();
    const selectedStart = formData.startDate;

    // If start date is in the future, allow all times
    if (selectedStart > todayStr) return true;

    // If start date is Today, block past times
    if (selectedStart === todayStr) {
        const selectedDate = new Date(time);
        return now < selectedDate;
    }

    return true; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (!formData.doctorId) return toast.error("Please select a doctor");
    if (!formData.startDate || !formData.endDate)
      return toast.error("Please select a date range");
    
    // Validation
    const now = new Date();
    
    if (formData.startDate < todayStr) {
        return toast.error("Start Date cannot be in the past.");
    }
    if (formData.startDate > formData.endDate) {
        return toast.error("Start Date cannot be after End Date");
    }
    
    // Check if start time is past (Double check on submit)
    if (formData.startDate === todayStr) {
        const [startH, startM] = formData.startTime.split(':').map(Number);
        const currentH = now.getHours();
        const currentM = now.getMinutes();
        if (startH < currentH || (startH === currentH && startM < currentM)) {
             return toast.error("Shift Start Time cannot be in the past for today.");
        }
    }

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
          Bulk slot creation is not available on your current plan. Please upgrade to enable this feature.
        </p>
      </div>
    );
  }

  const inputClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] focus:bg-white focus:border-transparent outline-none transition-all";
  const datePickerClass = "w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#003366] focus:bg-white outline-none cursor-pointer font-medium text-gray-700";

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        ⚡ Bulk Create Slots
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Row 1: Doctor & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Select Doctor</label>
            <select
              name="doctorId"
              required
              className={inputClass}
              value={formData.doctorId}
              onChange={handleInputChange}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Slot Duration</label>
            <select
              name="duration"
              className={inputClass}
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              required
              min={todayStr} // Block past dates
              value={formData.startDate}
              onChange={handleInputChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              required
              min={formData.startDate || todayStr} 
              value={formData.endDate}
              onChange={handleInputChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 3: Shift Times (12h Format) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/60 p-5 rounded-xl border border-indigo-100">
          <div>
            <label className="block text-xs font-bold text-indigo-900 mb-1">Start Time (Shift Start)</label>
            <DatePicker
                selected={parseTime(formData.startTime)}
                onChange={(date) => handleTimeChange("startTime", date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                filterTime={filterPassedTime} // ✅ BLOCKS PAST TIMES
                className={`${datePickerClass} border-indigo-200 bg-white focus:ring-indigo-500`}
                placeholderText="Select Start Time"
            />
          </div>

           <div>
            <label className="block text-xs font-bold text-indigo-900 mb-1">End Time (Shift End)</label>
            <DatePicker
                selected={parseTime(formData.endTime)}
                onChange={(date) => handleTimeChange("endTime", date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className={`${datePickerClass} border-indigo-200 bg-white focus:ring-indigo-500`}
                placeholderText="Select End Time"
            />
          </div>
        </div>

        {/* Row 4: Lunch Break (12h Format + Clearable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50/50 p-5 rounded-xl border border-orange-100">
           <div className="md:col-span-2 flex items-center gap-2">
               <span className="text-sm">🍽️</span>
               <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Lunch Break (Optional)</span>
           </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Lunch Start</label>
            <DatePicker
                selected={parseTime(formData.lunchStart)}
                onChange={(date) => handleTimeChange("lunchStart", date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className={`${datePickerClass} border-orange-200 bg-white focus:ring-orange-500`}
                placeholderText="Start (e.g. 01:00 PM)"
                isClearable
            />
          </div>

           <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Lunch End</label>
            <DatePicker
                selected={parseTime(formData.lunchEnd)}
                onChange={(date) => handleTimeChange("lunchEnd", date)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={5}
                timeCaption="Time"
                dateFormat="h:mm aa"
                className={`${datePickerClass} border-orange-200 bg-white focus:ring-orange-500`}
                placeholderText="End (e.g. 02:00 PM)"
                isClearable
            />
          </div>
        </div>

        {/* Row 5: Type & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Slot Type</label>
            <select
              name="kind"
              className={inputClass}
              value={formData.kind}
              onChange={handleInputChange}
            >
              <option value="APPOINTMENT">Appointment</option>
              <option value="BREAK">Break / Lunch</option>
            </select>
          </div>

          {!isBreak ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Payment Mode</label>
              <select
                name="paymentMode"
                className={inputClass}
                value={formData.paymentMode}
                onChange={handleInputChange}
              >
                <option value="ONLINE">Online Payment Only</option>
                <option value="OFFLINE">Pay at Clinic (Cash Only)</option>
                <option value="FREE">Free Appointments</option>
              </select>
            </div>
          ) : (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-xs text-gray-500 flex items-center justify-center italic">
              Break slots are always FREE.
            </div>
          )}
        </div>

        {/* Row 6: Days */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">Repeat On Days</label>
          <div className="flex flex-wrap gap-2">
            {daysOptions.map((day) => (
              <label
                key={day.id}
                className={`flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg border transition-all text-sm select-none ${
                  formData.days.includes(day.id)
                    ? "bg-[#003366] border-[#003366] text-white shadow-md transform scale-[1.02]"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.days.includes(day.id)}
                  onChange={() => handleDayChange(day.id)}
                  className="hidden" 
                />
                <span className="font-medium">{day.label}</span>
                {formData.days.includes(day.id) && <span className="text-xs ml-1">✓</span>}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.doctorId}
          className="w-full bg-[#003366] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#002244] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
        >
          {loading ? "Processing..." : "✨ Generate All Slots"}
        </button>
      </form>
    </div>
  );
}
