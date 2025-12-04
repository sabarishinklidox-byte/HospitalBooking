// src/features/clinicAdmin/SlotsPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import BulkSlotCreator from './BulkSlotCreator';

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    duration: '30',
    type: 'PAID',
    price: '500',
  });
  const [saving, setSaving] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);

  // Restore last used filters (doctor + date) from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('slotsFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.doctorId) setDoctorId(parsed.doctorId);
        if (parsed.selectedDate) setSelectedDate(parsed.selectedDate);
      } catch {
        localStorage.removeItem('slotsFilters');
      }
    }
  }, []);

  // Persist filters whenever they change
  useEffect(() => {
    const data = { doctorId, selectedDate };
    localStorage.setItem('slotsFilters', JSON.stringify(data));
  }, [doctorId, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/admin/doctors'); // returns all doctors
      setDoctors(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load doctors');
    }
  };

  const fetchSlots = async () => {
    if (!doctorId || !selectedDate) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/slots', {
        params: { doctorId, date: selectedDate },
      });
      setSlots(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (doctorId && selectedDate) {
      fetchSlots();
    }
  }, [doctorId, selectedDate]);

  const resetForm = () => {
    setForm({
      doctorId: doctorId || '',
      date: selectedDate || '',
      time: '',
      duration: '30',
      type: 'PAID',
      price: '500',
    });
  };

  const openCreateModal = () => {
    setEditingSlotId(null);
    resetForm();
    setModalOpen(true);
  };

  const handleCreateOrUpdateSlot = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingSlotId) {
        await api.put(`/admin/slots/${editingSlotId}`, form);
      } else {
        await api.post('/admin/slots', form);
      }
      setModalOpen(false);
      resetForm();
      setEditingSlotId(null);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save slot');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSlot = (slot) => {
    setForm({
      doctorId: slot.doctorId,
      date: slot.date.split('T')[0],
      time: slot.time,
      duration: String(slot.duration),
      type: slot.type,
      price: String(slot.price),
    });
    setEditingSlotId(slot.id);
    setModalOpen(true);
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await api.delete(`/admin/slots/${id}`);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete slot');
    }
  };

  const activeDoctors = doctors.filter((doc) => doc.isActive);

  return (
    <ClinicAdminLayout>
      <div className="w-full px-3 sm:px-6">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight text-center sm:text-left"
          style={{ color: 'var(--color-primary)' }}
        >
          Manage Slots
        </h1>
<div className="mb-8">
     <BulkSlotCreator 
        doctors={activeDoctors} 
        onSuccess={() => {
           // If current filters match newly created slots, refresh the list
           if (doctorId && selectedDate) fetchSlots();
        }} 
     />
  </div>
        {error && (
          <p className="mb-4 text-sm text-red-600 text-center sm:text-left">
            {error}
          </p>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-xl shadow">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Doctor
            </label>
            <select
              className="input w-full"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <option value="">Select doctor</option>
              {activeDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                  {doc.speciality ? ` – ${doc.speciality}` : ''} (
                  {String(doc.id).slice(0, 6)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Date
            </label>
            <input
              type="date"
              className="input w-full"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={fetchSlots}
              disabled={!doctorId || !selectedDate || loading}
              className="btn-primary w-full py-2.5 rounded-lg disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {loading ? 'Loading...' : 'Load Slots'}
            </button>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : slots.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500 mb-4">
              No slots found. Select doctor and date, then create slots.
            </p>
            <button
              onClick={openCreateModal}
              disabled={!doctorId || !selectedDate}
              className="btn-primary px-6 py-2.5 rounded-lg inline-flex items-center disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              + Add First Slot
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Slots ({slots.length})
              </h2>
              <button
                onClick={openCreateModal}
                className="btn-primary px-4 py-2 text-sm rounded-lg"
                style={{ backgroundColor: 'var(--color-action)' }}
              >
                + Add Slot
              </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{slot.time}</td>
                      <td className="px-4 py-3">{slot.duration} min</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            slot.type === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {slot.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-700">
                        ₹{slot.price}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add/Edit Slot Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSlotId ? 'Edit Slot' : 'Add Slot'}
        >
          <form onSubmit={handleCreateOrUpdateSlot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Doctor
              </label>
              <select
                className="input w-full"
                value={form.doctorId}
                onChange={(e) =>
                  setForm({ ...form, doctorId: e.target.value })
                }
                required
              >
                <option value="">Select doctor</option>
                {activeDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                    {doc.speciality ? ` – ${doc.speciality}` : ''} (
                    {String(doc.id).slice(0, 6)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Date
              </label>
              <input
                type="date"
                className="input w-full"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  className="input w-full"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Duration (min)
                </label>
                <input
                  type="number"
                  className="input w-full"
                  min="15"
                  max="120"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Type
              </label>
              <select
                className="input w-full"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="PAID">PAID</option>
                <option value="FREE">FREE</option>
              </select>
            </div>

            {form.type === 'PAID' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  className="input w-full"
                  min="0"
                  step="50"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 py-2.5 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {saving
                  ? 'Saving...'
                  : editingSlotId
                  ? 'Update Slot'
                  : 'Create Slot'}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="flex-1 py-2.5 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </ClinicAdminLayout>
  );
}
