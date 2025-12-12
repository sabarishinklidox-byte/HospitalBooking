import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import BulkSlotCreator from './BulkSlotCreator';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

const today = new Date().toISOString().split('T')[0];

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Filters
  const [doctorId, setDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);
  
  // ✅ Updated Form with Strict Defaults
  const [form, setForm] = useState({
    doctorId: '',
    date: today,
    time: '',
    duration: '30',
    price: '500',
    paymentMode: 'ONLINE', // Default
  });

  // Data fetching
  const fetchDoctors = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN.DOCTORS);
      const activeDoctors = (res.data || []).filter((doc) => doc.isActive);
      setDoctors(activeDoctors);
      if (activeDoctors.length > 0 && !doctorId) {
        setDoctorId(activeDoctors[0].id);
      }
    } catch {
      toast.error('Failed to load doctors');
    }
  };

  const fetchSlots = async () => {
    if (!doctorId || !selectedDate) {
      setSlots([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN.SLOTS, {
        params: { doctorId, date: selectedDate },
      });
      setSlots(res.data || []);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [doctorId, selectedDate]);

  // Open create modal
  const openCreateModal = () => {
    setEditingSlotId(null);
    setForm({
      doctorId,
      date: selectedDate,
      time: '',
      duration: '30',
      price: '500',
      paymentMode: 'ONLINE', // Default
    });
    setModalOpen(true);
  };

  // Open edit modal
  const handleEditSlot = (slot) => {
    setEditingSlotId(slot.id);
    setForm({
      doctorId: slot.doctorId,
      date: slot.date.split('T')[0],
      time: slot.time,
      duration: String(slot.duration),
      price: String(slot.price),
      paymentMode: slot.paymentMode || 'ONLINE', // Use existing or default
    });
    setModalOpen(true);
  };

  // Create / update
  const handleCreateOrUpdateSlot = async (e) => {
    e.preventDefault();

    const promise = editingSlotId
      ? api.put(ENDPOINTS.ADMIN.SLOT_BY_ID(editingSlotId), form)
      : api.post(ENDPOINTS.ADMIN.SLOTS, form);

    await toast.promise(promise, {
      loading: editingSlotId ? 'Updating slot...' : 'Creating slot...',
      success: () => {
        setModalOpen(false);
        fetchSlots();
        return `Slot ${editingSlotId ? 'updated' : 'created'} successfully!`;
      },
      error: (err) => err.response?.data?.error || 'Failed to save slot',
    });
  };

  // Delete
  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this slot?')) return;

    await toast.promise(api.delete(ENDPOINTS.ADMIN.SLOT_BY_ID(id)), {
      loading: 'Deleting slot...',
      success: () => {
        fetchSlots();
        return 'Slot deleted.';
      },
      error: 'Failed to delete slot.',
    });
  };

  return (
    <ClinicAdminLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>🗓️</span> Manage Slots
          </h1>
          <p className="text-gray-500 mt-2 ml-1">
            Create and manage individual or bulk appointment slots for your doctors.
          </p>
        </div>

        <BulkSlotCreator doctors={doctors} onSuccess={fetchSlots} />

        {/* Filters & Results */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Select Doctor
              </label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">-- Choose a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.speciality}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <span className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                  📅
                </span>
              </div>
            </div>
          </div>

          {/* Slots list */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Available Slots ({slots.length})
            </h2>
            <button
              onClick={openCreateModal}
              disabled={!doctorId || !selectedDate}
              className="btn-primary py-2 px-5 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Single Slot
            </button>
          </div>

          {loading ? (
            <div className="py-20"><Loader /></div>
          ) : !doctorId || !selectedDate ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
              <p className="font-medium text-gray-600">Please select a doctor and a date to view slots.</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
              <p className="font-medium text-gray-600">No slots found for this day.</p>
              <p className="text-sm text-gray-400 mt-1">Use the "Add Single Slot" or "Bulk Create" buttons to generate them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Payment Mode</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-blue-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-800">{slot.time}</td>
                      <td className="px-4 py-3 text-gray-600">{slot.duration} mins</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          slot.paymentMode === 'FREE' ? 'bg-green-100 text-green-800' :
                          slot.paymentMode === 'ONLINE' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {slot.paymentMode === 'ONLINE' ? 'Online Only' : 
                           slot.paymentMode === 'OFFLINE' ? 'Pay at Clinic' : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-700">
                        {slot.paymentMode === 'FREE' ? 'Free' : `₹${slot.price}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${slot.isBooked ? 'bg-red-100 text-red-800' : 'bg-cyan-100 text-cyan-800'}`}>
                          {slot.isBooked ? 'Booked' : 'Available'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => handleEditSlot(slot)} className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md font-semibold">Edit</button>
                        <button onClick={() => handleDeleteSlot(slot.id)} disabled={slot.isBooked} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-semibold disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSlotId ? 'Edit Slot' : 'Create New Slot'}>
        <form onSubmit={handleCreateOrUpdateSlot} className="space-y-4 p-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input type="time" className="input w-full" value={form.time} onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
              <input type="number" min="10" className="input w-full" value={form.duration} onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input 
                type="number" min="0" className="input w-full" 
                value={form.price} 
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} 
                required={form.paymentMode !== 'FREE'} 
                disabled={form.paymentMode === 'FREE'} 
              />
            </div>
          </div>

          {/* ✅ Strict 3-Option Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <select
              className="input w-full bg-white"
              value={form.paymentMode}
              onChange={(e) => {
                const mode = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  paymentMode: mode,
                  price: mode === 'FREE' ? '0' : prev.price,
                }));
              }}
            >
              <option value="ONLINE">Online Payment Only</option>
              <option value="OFFLINE">Pay at Clinic (Cash Only)</option>
              <option value="FREE">Free Slot</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary py-2 px-5">Cancel</button>
            <button type="submit" className="btn-primary py-2 px-5">{editingSlotId ? 'Update Slot' : 'Create Slot'}</button>
          </div>
        </form>
      </Modal>
    </ClinicAdminLayout>
  );
}
