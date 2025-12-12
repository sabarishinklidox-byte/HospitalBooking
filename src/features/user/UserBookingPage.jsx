import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

// API base + helper to build full URLs
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const toFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url}`;
};

// Helper to format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function UserBookingPage() {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');

  // 1. Fetch Doctor
  useEffect(() => {
    if (doctor) return;

    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const res = await api.get(ENDPOINTS.PUBLIC.DOCTOR_BY_ID(doctorId));
        setDoctor(res.data);
      } catch (err) {
        setError('Doctor not found.');
        toast.error('Doctor not found');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId, doctor]);

  // 2. Fetch Slots
  useEffect(() => {
    if (!doctor || !selectedDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError('');
      const formattedDate = selectedDate.toISOString().split('T')[0];

      try {
        const res = await api.get(
          ENDPOINTS.PUBLIC.DOCTOR_SLOTS(doctor.id),
          { params: { date: formattedDate } }
        );
        setSlots(res.data);
        setSelectedSlot(null);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load slots');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctor, selectedDate]);

  // 3. Booking Handler (CORRECTED LOGIC)
  const handleBookNow = async () => {
    if (!selectedSlot) return;

    // A. Auth Check
    if (!token || !user) {
      toast('Please login to continue booking', { icon: '🔒' });
      navigate('/login', { state: { from: location, doctor } });
      return;
    }

    try {
      setBookingLoading(true);

      // B. Resolve Clinic ID
      const finalClinicId = doctor.clinicId || doctor.clinic?.id;
      if (!finalClinicId) {
        toast.error('System Error: Missing Clinic ID');
        return;
      }

      // ----------------------------------------------------------------
      // CASE 1: ONLINE PAYMENT (Stripe Redirect)
      // ----------------------------------------------------------------
      if (selectedSlot.paymentMode === 'ONLINE') {
         // Create Stripe Session
        const res = await api.post(ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
             slotId: selectedSlot.id,
             doctorId: doctor.id,
             userId: user.id
         });

         // Redirect to Stripe
         if (res.data.url) {
             window.location.href = res.data.url;
         } else {
             toast.error("Failed to initiate payment");
         }
      } 
      // ----------------------------------------------------------------
      // CASE 2: OFFLINE / FREE (Direct Booking)
      // ----------------------------------------------------------------
      else {
        // Direct API call to book appointment
        await api.post(ENDPOINTS.USER.APPOINTMENTS, {
          slotId: selectedSlot.id,
          doctorId: doctor.id,
          clinicId: finalClinicId,
          bookingSection: 'GENERAL',
        });

        toast.success('Appointment Confirmed! 🎉');
        navigate('/my-appointments');
      }

    } catch (err) {
      const msg = err.response?.data?.error;
      console.error("Booking Error:", err);

      if (msg && msg.includes('Unique constraint')) {
        toast.error('Slot already taken. Please pick another.');
        setSlots((prev) =>
          prev.map((s) =>
            s.id === selectedSlot.id ? { ...s, isBooked: true } : s
          )
        );
        setSelectedSlot(null);
      } else {
        toast.error(msg || 'Booking failed. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && !doctor)
    return (
      <UserLayout>
        <div className="h-screen flex items-center justify-center">
          <Loader />
        </div>
      </UserLayout>
    );

  if (error)
    return (
      <UserLayout>
        <div className="h-screen flex items-center justify-center text-red-500 font-medium">
          {error}
        </div>
      </UserLayout>
    );

  if (!doctor) return null;

  const avatarUrl = doctor.avatar ? toFullUrl(doctor.avatar) : null;
  const doctorInitial = doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D';

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Doctor & Calendar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-28 h-28 mx-auto bg-[#003366] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md overflow-hidden text-white relative">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const sibling = e.currentTarget.nextSibling;
                    if (sibling) sibling.style.display = 'block';
                  }}
                />
              )}
              <span
                className="text-4xl font-bold uppercase absolute"
                style={{ display: avatarUrl ? 'none' : 'block' }}
              >
                {doctorInitial}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
            <p className="text-blue-600 font-medium mb-2">{doctor.speciality}</p>
            {doctor.clinic && (
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 bg-gray-50 py-2 rounded-lg">
                <span>🏥</span> {doctor.clinic.name}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-[#003366] flex items-center gap-2">
                <span>📅</span> Select Date
              </h3>
            </div>
            <div className="p-4 flex justify-center booking-calendar-wrapper">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                inline
                minDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Slots */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Available Slots</h3>
                <p className="text-sm text-gray-500">
                  For{' '}
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                {slots.filter((s) => !s.isBooked).length} Openings
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader />
              </div>
            ) : slots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
                <span className="text-4xl mb-2">😴</span>
                <p>No slots available for this date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 content-start">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isFree = slot.paymentMode === 'FREE';

                  return (
                    <button
                      key={slot.id}
                      disabled={slot.isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        relative py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 border flex flex-col items-center justify-center gap-1
                        ${
                          slot.isBooked
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed decoration-gray-300 line-through'
                            : isSelected
                            ? 'bg-[#003366] text-white border-[#003366] shadow-lg transform scale-105 ring-2 ring-blue-200 ring-offset-1'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50'
                        }
                      `}
                    >
                      <span>{slot.time}</span>
                      {!slot.isBooked && (
                        <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-blue-200' : 'text-gray-400'}`}>
                          {isFree ? 'Free' : formatPrice(slot.price)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-auto pt-8">
              {selectedSlot ? (
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm text-green-800 font-bold">Slot Selected</p>
                      <p className="text-xs text-green-600">
                        {selectedDate.toLocaleDateString()} at {selectedSlot.time}
                      </p>
                      <p className="text-xs text-green-700 font-semibold mt-1">
                        {selectedSlot.paymentMode === 'FREE'
                          ? '✨ Free Consultation'
                          : `${formatPrice(selectedSlot.price)} (${selectedSlot.paymentMode === 'OFFLINE' ? 'Pay at Clinic' : 'Pay Online'})`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleBookNow}
                    disabled={bookingLoading}
                    className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {token
                      ? bookingLoading
                        ? 'Processing...'
                        : selectedSlot.paymentMode === 'ONLINE' ? 'Pay & Book' : 'Confirm Booking'
                      : 'Login to Confirm'}
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm">
                  Select a time slot above to proceed.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
