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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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

  // derive period from 24h time string "HH:MM" or "HH:MM:SS"
  const getPeriodFromTime = (timeStr) => {
    if (!timeStr) return 'Morning';
    const hour24 = parseInt(timeStr.split(':')[0], 10);
    if (hour24 < 12) return 'Morning';
    if (hour24 < 17) return 'Afternoon';
    return 'Evening';
  };

  // convert "HH:MM" / "HH:MM:SS" (24h) to "hh:mm AM/PM"
  const to12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h, 10);
    const minute = m ?? '00';

    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;

    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hour)}:${pad(parseInt(minute, 10))} ${ampm}`;
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

    // 2. Fetch Slots (FIXED: use /user/slots that returns isBooked)
    useEffect(() => {
      if (!doctor || !selectedDate) return;

      const fetchSlots = async () => {
        setLoading(true);
        setError('');
        const formattedDate = selectedDate.toISOString().split('T')[0];

        try {
          const clinicId = doctor.clinicId || doctor.clinic?.id;
          if (!clinicId) {
            setSlots([]);
            setSelectedSlot(null);
            toast.error('System Error: Missing Clinic ID');
            return;
          }

          // ✅ IMPORTANT: call user slots endpoint that returns isBooked
          // You must define ENDPOINTS.USER.SLOTS = "/user/slots"
          const res = await api.get(ENDPOINTS.PUBLIC.SLOTS, {
            params: { clinicId, doctorId: doctor.id, date: formattedDate },
          });

          const list = res.data?.data || [];

          const withPeriod = list.map((s) => ({
            ...s,
            isBooked: Boolean(s.isBooked),
            period: s.period || getPeriodFromTime(s.time),
          }));

          setSlots(withPeriod);

          // if currently selected slot became booked, clear it
          if (selectedSlot && withPeriod.some((s) => s.id === selectedSlot.id && s.isBooked)) {
            setSelectedSlot(null);
          }
        } catch (err) {
          console.error(err);
          toast.error(err?.response?.data?.error || 'Failed to load slots');
        } finally {
          setLoading(false);
        }
      };

      fetchSlots();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doctor, selectedDate]);

    // 3. Booking Handler
    const handleBookNow = async () => {
      if (!selectedSlot) return;

      if (!token || !user) {
        toast('Please login to continue booking', { icon: '🔒' });
        navigate('/login', { state: { from: location, doctor } });
        return;
      }

      // extra safety
      if (selectedSlot.isBooked) {
        toast.error('Slot already booked. Please pick another.');
        setSelectedSlot(null);
        return;
      }

      try {
        setBookingLoading(true);

        const finalClinicId = doctor.clinicId || doctor.clinic?.id;
        if (!finalClinicId) {
          toast.error('System Error: Missing Clinic ID');
          return;
        }

        if (selectedSlot.paymentMode === 'ONLINE') {
          const res = await api.post(ENDPOINTS.PAYMENT.CREATE_CHECKOUT_SESSION, {
            slotId: selectedSlot.id,
            doctorId: doctor.id,
            userId: user.id,
          });

          if (res.data.url) {
            window.location.href = res.data.url;
          } else {
            toast.error('Failed to initiate payment');
          }
        } else {
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
        const status = err.response?.status;
        console.error('Booking Error:', err);

        // ✅ backend should return 409 when slot taken (including P2002 case)
        if (status === 409) {
          toast.error(msg || 'Slot already taken. Please pick another.');
          setSlots((prev) =>
            prev.map((s) => (s.id === selectedSlot.id ? { ...s, isBooked: true } : s))
          );
          setSelectedSlot(null);
        } else {
          toast.error(msg || 'Booking failed. Please try again.');
        }
      } finally {
        setBookingLoading(false);
      }
    };

    if (loading && !doctor) {
      return (
        <UserLayout>
          <div className="h-screen flex items-center justify-center">
            <Loader />
          </div>
        </UserLayout>
      );
    }

    if (error) {
      return (
        <UserLayout>
          <div className="h-screen flex items-center justify-center text-red-500 font-medium">
            {error}
          </div>
        </UserLayout>
      );
    }

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
                <DatePicker selected={selectedDate} onChange={(d) => setSelectedDate(d)} inline minDate={new Date()} />
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
                <div className="space-y-6">
                  {['Morning', 'Afternoon', 'Evening'].map((period) => {
                    const periodSlots = slots.filter((s) => s.period === period);
                    if (!periodSlots.length) return null;

                    return (
                      <div key={period}>
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <span>
                            {period === 'Morning' ? '☀️' : period === 'Afternoon' ? '🌤️' : '🌙'}
                          </span>
                          <span>{period}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {periodSlots.map((slot) => {
                            const isSelected = selectedSlot?.id === slot.id;
                            const isFree = slot.paymentMode === 'FREE';
                            const isBooked = slot.isBooked === true;

                            return (
                              <button
                                key={slot.id}
                                type="button"
                                disabled={isBooked}
                                onClick={() => {
                                  if (isBooked) return; // extra safety
                                  setSelectedSlot(slot);
                                }}
                                className={`
                                  min-w-[90px] text-center py-2 px-3 rounded-lg text-sm font-semibold border transition-all
                                  ${
                                    isBooked
                                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                                      : isSelected
                                      ? 'bg-white text-blue-600 border-blue-500 shadow-sm'
                                      : 'bg-white text-gray-700 border-blue-300 hover:bg-blue-50'
                                  }
                                `}
                              >
                                <div>{to12Hour(slot.time)}</div>

                                {isBooked ? (
                                  <div className="text-[10px] mt-0.5 text-gray-400">Booked</div>
                                ) : (
                                  <div className="text-[10px] mt-0.5 text-gray-400">
                                    {isFree ? 'Free' : formatPrice(slot.price)}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
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
                          {selectedDate.toLocaleDateString()} at {to12Hour(selectedSlot.time)}
                        </p>
                        <p className="text-xs text-green-700 font-semibold mt-1">
                          {selectedSlot.paymentMode === 'FREE'
                            ? '✨ Free Consultation'
                            : `${formatPrice(selectedSlot.price)} (${
                                selectedSlot.paymentMode === 'OFFLINE'
                                  ? 'Pay at Clinic'
                                  : 'Pay Online'
                              })`}
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
                          : selectedSlot.paymentMode === 'ONLINE'
                          ? 'Pay & Book'
                          : 'Confirm Booking'
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
