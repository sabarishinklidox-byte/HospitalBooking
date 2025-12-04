import React, { useState, useEffect } from 'react';
import api from '../../lib/api'; // Adjust path

export default function BulkSlotCreator({ doctors, onSuccess }) {
  const [formData, setFormData] = useState({
    doctorId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    duration: '30',
    days: [1, 2, 3, 4, 5], // Default: Mon-Fri
  });
  const [loading, setLoading] = useState(false);

  // Days mapping for checkboxes
  const daysOptions = [
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
    { id: 0, label: 'Sun' },
  ];

  const handleDayChange = (dayId) => {
    setFormData(prev => {
      const newDays = prev.days.includes(dayId)
        ? prev.days.filter(d => d !== dayId) // Remove
        : [...prev.days, dayId]; // Add
      return { ...prev, days: newDays };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) return alert("Please select a doctor");

    setLoading(true);
    try {
      const res = await api.post('/admin/slots/bulk', formData);
      alert(res.data.message);
      if (onSuccess) onSuccess(); // Refresh parent list
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create slots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Bulk Create Slots</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* ROW 1: Doctor & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
            <select
              required
              className="input w-full border p-2 rounded"
              value={formData.doctorId}
              onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (mins)</label>
            <select
              className="input w-full border p-2 rounded"
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: e.target.value})}
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes</option>
              <option value="60">1 Hour</option>
            </select>
          </div>
        </div>

        {/* ROW 2: Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              required
              className="input w-full border p-2 rounded"
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              required
              className="input w-full border p-2 rounded"
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
            />
          </div>
        </div>

        {/* ROW 3: Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="time"
              required
              className="input w-full border p-2 rounded"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="time"
              required
              className="input w-full border p-2 rounded"
              value={formData.endTime}
              onChange={(e) => setFormData({...formData, endTime: e.target.value})}
            />
          </div>
        </div>

        {/* ROW 4: Days of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Repeat On</label>
          <div className="flex flex-wrap gap-3">
            {daysOptions.map(day => (
              <label key={day.id} className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-3 py-1 rounded border hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={formData.days.includes(day.id)}
                  onChange={() => handleDayChange(day.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading || !formData.doctorId}
          className="w-full bg-[#0b3b5e] text-white py-3 rounded-lg font-bold hover:bg-[#092c46] transition disabled:opacity-50"
        >
          {loading ? 'Generating Slots...' : 'Generate Bulk Slots'}
        </button>

      </form>
    </div>
  );
}
