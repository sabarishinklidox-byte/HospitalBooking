import React, { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

export default function BulkSlotCreator({ doctors, onSuccess }) {
  const [formData, setFormData] = useState({
    doctorId: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    duration: '30',
    days: [1, 2, 3, 4, 5],
    paymentMode: 'ONLINE', // Default strict
  });
  const [loading, setLoading] = useState(false);

  const daysOptions = [
    { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' }, { id: 0, label: 'Sun' },
  ];

  const handleDayChange = (dayId) => {
    setFormData(prev => {
      const newDays = prev.days.includes(dayId) ? prev.days.filter(d => d !== dayId) : [...prev.days, dayId];
      return { ...prev, days: newDays };
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) return toast.error('Please select a doctor');
    if (!formData.startDate || !formData.endDate) return toast.error('Please select a date range');
    if (formData.days.length === 0) return toast.error('Please select at least one day');

    const loadingToastId = toast.loading('Creating slots...');
    setLoading(true);

    try {
      const res = await api.post(ENDPOINTS.ADMIN.SLOTS_BULK, formData);
      toast.success(res.data.message || 'Slots created successfully!', { id: loadingToastId });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to create slots', { id: loadingToastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">⚡ Bulk Create Slots</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Select Doctor</label>
            <select name="doctorId" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.doctorId} onChange={handleInputChange}>
              <option value="">-- Choose Doctor --</option>
              {doctors.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Slot Duration</label>
            <select name="duration" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.duration} onChange={handleInputChange}>
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
            <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <input type="date" name="startDate" required value={formData.startDate} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-400 transition-colors" />
              <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">📅</span>
            </div>
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <input type="date" name="endDate" required value={formData.endDate} onChange={handleInputChange} className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shadow-sm hover:border-gray-400 transition-colors" />
              <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">📅</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Slot Start Time</label>
            <input type="time" name="startTime" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono" value={formData.startTime} onChange={handleInputChange} />
            <p className="text-[10px] text-gray-500 mt-1">Slots will be generated starting from this time.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Payment Mode</label>
            <select name="paymentMode" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.paymentMode} onChange={handleInputChange}>
              <option value="ONLINE">Online Payment Only</option>
              <option value="OFFLINE">Pay at Clinic (Cash Only)</option>
              <option value="FREE">Free Appointments</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">Repeat On Days</label>
          <div className="flex flex-wrap gap-2">
            {daysOptions.map(day => (
              <label key={day.id} className={`flex items-center space-x-2 cursor-pointer px-3 py-2 rounded-lg border transition-all text-sm ${formData.days.includes(day.id) ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <input type="checkbox" checked={formData.days.includes(day.id)} onChange={() => handleDayChange(day.id)} className="w-4 h-4 rounded text-[#0b3b5e] focus:ring-[#0b3b5e]" />
                <span className={`font-medium ${formData.days.includes(day.id) ? 'text-[#0b3b5e]' : 'text-gray-600'}`}>{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading || !formData.doctorId} className="w-full bg-[#003366] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-[#002244] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
          {loading ? 'Processing...' : '✨ Generate Slots'}
        </button>
      </form>
    </div>
  );
}
