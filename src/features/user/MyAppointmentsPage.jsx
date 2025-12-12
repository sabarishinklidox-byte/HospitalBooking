import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import AppointmentCard from '../../features/user/AppointmentCard.jsx';
import { toast } from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- RESCHEDULE STATE ---
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState(null);
  const [slotLoading, setSlotLoading] = useState(false);

  // --- REVIEW STATE ---
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewAppt, setSelectedReviewAppt] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  // 1. Fetch Data
  // 1. Fetch appointments
const fetchAppointments = async () => {
  try {
    const res = await api.get(ENDPOINTS.USER.APPOINTMENTS);
    setAppointments(res.data);
  } catch (err) {
    console.error('Error fetching appointments', err);
    toast.error('Failed to load appointments');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchAppointments();
}, []);

// 2. Reschedule Handlers
const openReschedule = (appt) => {
  setSelectedAppt(appt);
  setNewDate('');
  setAvailableSlots([]);
  setSelectedNewSlotId(null);
  setRescheduleModalOpen(true);
};

useEffect(() => {
  if (!newDate || !selectedAppt) return;
  const fetchSlots = async () => {
    setSlotLoading(true);
    try {
      const res = await api.get(
        ENDPOINTS.PUBLIC.DOCTOR_SLOTS(selectedAppt.doctor.id),
        { params: { date: newDate } }
      );
      setAvailableSlots(res.data.filter((s) => !s.isBooked));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load slots for selected date');
    } finally {
      setSlotLoading(false);
    }
  };
  fetchSlots();
}, [newDate, selectedAppt]);

const handleRescheduleSubmit = async () => {
  if (!selectedNewSlotId) {
    toast.error('Please select a new slot');
    return;
  }

  try {
    await toast.promise(
      api.patch(
        ENDPOINTS.USER.RESCHEDULE_APPOINTMENT(selectedAppt.id),
        { newSlotId: selectedNewSlotId }
      ),
      {
        loading: 'Rescheduling your appointment...',
        success: 'Appointment rescheduled successfully!',
        error: (err) =>
          err.response?.data?.error || 'Reschedule failed',
      }
    );

    setRescheduleModalOpen(false);
    setLoading(true);
    setAppointments([]);
    fetchAppointments();
  } catch {
    // handled by toast.promise
  }
};

// 3. Review Handlers
const openReviewModal = (appt) => {
  setSelectedReviewAppt(appt);
  setReviewData({ rating: 5, comment: '' });
  setReviewModalOpen(true);
};

const handleReviewSubmit = async () => {
  try {
    await toast.promise(
      api.post(ENDPOINTS.USER.REVIEWS, {
        appointmentId: selectedReviewAppt.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      }),
      {
        loading: 'Submitting your review...',
        success: 'Review submitted! Thank you.',
        error: (err) =>
          err.response?.data?.error || 'Failed to submit review',
      }
    );

    setReviewModalOpen(false);
    fetchAppointments();
  } catch {
    // handled by toast.promise
  }
};

const ratingLabels = {
  1: 'Very poor',
  2: 'Below average',
  3: 'Average',
  4: 'Very good',
  5: 'Excellent',
};

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-[#0b3b5e] mb-6">My Appointments</h1>

        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500">You have no appointments.</p>
            ) : (
              appointments.map((app) => (
                <AppointmentCard
                  key={app.id}
                  app={app}
                  onReschedule={openReschedule}
                  onReview={openReviewModal}
                />
              ))
            )}
          </div>
        )}

        {/* === MODAL 1: RESCHEDULE === */}
        <Modal
          isOpen={rescheduleModalOpen}
          onClose={() => setRescheduleModalOpen(false)}
          title="Reschedule Appointment"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select a new date for <strong>Dr. {selectedAppt?.doctor?.name}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">New Date</label>
              <input
                type="date"
                className="input w-full border p-2 rounded"
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            {newDate && (
              <div>
                <label className="block text-sm font-medium mb-2">Available Slots</label>
                {slotLoading ? (
                  <p className="text-xs text-gray-400">Loading...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-sm text-red-500">No slots available.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedNewSlotId(slot.id)}
                        className={`py-2 text-sm border rounded hover:border-blue-500 transition ${
                          selectedNewSlotId === slot.id
                            ? 'bg-[#0b3b5e] text-white'
                            : 'bg-gray-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleRescheduleSubmit}
              disabled={!selectedNewSlotId}
              className="w-full bg-[#0b3b5e] text-white py-3 rounded-lg font-bold mt-4 disabled:opacity-50"
            >
              Confirm Change
            </button>
          </div>
        </Modal>

        {/* === MODAL 2: REVIEW === */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Rate Your Experience"
        >
         <div className="flex flex-col items-center gap-3">
  {/* Stars */}
  <div className="flex gap-1.5 justify-center text-3xl py-2">
    {[1, 2, 3, 4, 5].map((star) => {
      const active = star <= reviewData.rating;
      return (
        <button
          key={star}
          type="button"
          onClick={() => setReviewData({ ...reviewData, rating: star })}
          className={`transition transform duration-150 ${
            active
              ? 'text-yellow-400 scale-110 drop-shadow-sm'
              : 'text-gray-300 hover:text-yellow-300'
          } hover:scale-125 focus:outline-none`}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      );
    })}
  </div>

  {/* Label + small animation on change */}
  <p className="text-center text-xs font-semibold text-gray-600 h-4">
    <span
      className="inline-block transition-transform duration-150 ease-out"
      key={reviewData.rating}
    >
      {ratingLabels[reviewData.rating]}
    </span>
  </p>

  {/* Comment box */}
  <textarea
    className="w-full border border-gray-200 p-3 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-300 outline-none transition-shadow shadow-sm"
    rows="3"
    placeholder="Share a few words about your experience (optional)..."
    value={reviewData.comment}
    onChange={(e) =>
      setReviewData({ ...reviewData, comment: e.target.value })
    }
  />

  {/* Submit button with subtle press animation */}
  <button
    onClick={handleReviewSubmit}
    className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white py-3 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md transition-transform transition-shadow active:scale-[0.98]"
  >
    Submit review
  </button>
</div>
        </Modal>
      </div>
    </UserLayout>
  );
}
