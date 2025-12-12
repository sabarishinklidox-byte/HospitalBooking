import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('UPCOMING'); // UPCOMING | COMPLETED

  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.DOCTOR.APPOINTMENTS);
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((app) => {
    if (filter === 'UPCOMING')
      return ['CONFIRMED', 'PENDING'].includes(app.status);
    if (filter === 'COMPLETED')
      return ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(app.status);
    return true;
  });

  const openPrescription = (appt) => {
    setSelectedAppt(appt);
    setPrescriptionText(appt.prescription || '');
    setPrescriptionModalOpen(true);
  };

  const handleSavePrescription = async () => {
    if (!selectedAppt) return;
    try {
      await api.patch(
        ENDPOINTS.DOCTOR.UPDATE_PRESCRIPTION(selectedAppt.id),
        { prescription: prescriptionText }
      );
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppt.id ? { ...a, prescription: prescriptionText } : a
        )
      );
      setPrescriptionModalOpen(false);
    } catch (err) {
      console.error('Failed to save prescription', err);
    }
  };

  // ✅ Doctor status actions
  const updateStatus = async (apptId, newStatus) => {
    try {
      await api.patch(ENDPOINTS.DOCTOR.APPOINTMENT_STATUS(apptId), {
        status: newStatus,
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === apptId ? { ...a, status: newStatus } : a
        )
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const markCompleted = (apptId) => {
    if (!window.confirm('Mark this appointment as COMPLETED?')) return;
    updateStatus(apptId, 'COMPLETED');
  };

  const markNoShow = (apptId) => {
    if (!window.confirm('Mark this appointment as NO_SHOW?')) return;
    updateStatus(apptId, 'NO_SHOW');
  };

  return (
    <DoctorLayout>
      <div className="p-6">
        {/* Header & Filter Tabs */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#0b3b5e]">My Appointments</h1>
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setFilter('UPCOMING')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition ${
                filter === 'UPCOMING'
                  ? 'bg-white shadow text-[#0b3b5e]'
                  : 'text-gray-500'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-4 py-2 text-sm font-bold rounded-md transition ${
                filter === 'COMPLETED'
                  ? 'bg-white shadow text-[#0b3b5e]'
                  : 'text-gray-500'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                No appointments found.
              </p>
            ) : (
              filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {/* Patient Info */}
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {app.user?.name || 'Unknown Patient'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        📅{' '}
                        {new Date(app.slot.date).toLocaleDateString()} at{' '}
                        <span className="font-mono text-black font-bold">
                          {app.slot.time}
                        </span>
                      </p>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded mt-2 inline-block
                          ${
                            app.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-700'
                              : app.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : app.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-700'
                              : app.status === 'NO_SHOW'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100'
                          }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {/* Rx button */}
                      {['CONFIRMED', 'COMPLETED'].includes(app.status) && (
                        <button
                          onClick={() => openPrescription(app)}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition"
                        >
                          <span>💊</span>{' '}
                          {app.prescription ? 'Edit Rx' : 'Write Rx'}
                        </button>
                      )}

                      {/* Status action buttons for upcoming/confirmed */}
                      {['CONFIRMED'].includes(app.status) && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => markCompleted(app.id)}
                            className="px-3 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() => markNoShow(app.id)}
                            className="px-3 py-1 text-xs font-bold rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          >
                            Mark No‑Show
                          </button>
                        </div>
                      )}

                      {app.prescription && (
                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                          ✓ Prescription Sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Prescription Modal */}
        <Modal
          isOpen={prescriptionModalOpen}
          onClose={() => setPrescriptionModalOpen(false)}
          title="📝 Medical Prescription"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-900">
              <p>
                <strong>Patient:</strong> {selectedAppt?.user?.name}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {selectedAppt &&
                  new Date(selectedAppt.slot.date).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Prescription Details:
              </label>
              <textarea
                className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                placeholder="Write prescription here..."
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                Visible to Patient & Admin immediately after saving.
              </p>
            </div>

            <button
              onClick={handleSavePrescription}
              className="w-full bg-[#0b3b5e] text-white py-3 rounded-lg font-bold hover:bg-[#092d47] transition shadow-lg"
            >
              Save & Send Prescription
            </button>
          </div>
        </Modal>
      </div>
    </DoctorLayout>
  );
}
