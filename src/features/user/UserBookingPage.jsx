// src/features/user/UserBookingPage.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** Fix image URL – remove /api */
const toFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(Number(price || 0));

const getPeriodFromTime = (timeStr) => {
  if (!timeStr) return 'Morning';
  const hour24 = parseInt(timeStr.split(':')[0], 10);
  if (hour24 < 12) return 'Morning';
  if (hour24 < 17) return 'Afternoon';
  return 'Evening';
};

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

const pad2 = (n) => String(n).padStart(2, '0');
const formatCountdown = (seconds) => {
  const s = Math.max(0, Number(seconds || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${pad2(mm)}:${pad2(ss)}`;
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

  const [doctorAvatarBroken, setDoctorAvatarBroken] = useState(false);

  // payment hold / countdown
  const [hold, setHold] = useState(null);
  const [holdLeftSec, setHoldLeftSec] = useState(0);
  const holdTimerRef = useRef(null);

  const selectedDateStr = useMemo(
    () => selectedDate?.toISOString?.().split('T')[0],
    [selectedDate]
  );

  const DOCTOR_URL = useMemo(
    () => ENDPOINTS.PUBLIC.DOCTOR_BY_ID(doctorId),
    [doctorId]
  );
  const SLOTS_URL = useMemo(
    () => ENDPOINTS.PUBLIC.DOCTOR_SLOTS(doctorId),
    [doctorId]
  );
  const CREATE_BOOKING_URL = ENDPOINTS.PAYMENT.CREATE_BOOKING;
  const VERIFY_RAZORPAY_URL = ENDPOINTS.PAYMENT.VERIFY_RAZORPAY;

  const stopHoldTimer = useCallback(() => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    holdTimerRef.current = null;
  }, []);

  const startHoldTimer = useCallback(
    (expiresAtMs, fetchSlotsFn) => {
      stopHoldTimer();
      const tick = () => {
        const left = Math.ceil((expiresAtMs - Date.now()) / 1000);
        setHoldLeftSec(Math.max(0, left));
        if (left <= 0) {
          stopHoldTimer();
          toast.error('Payment hold expired. Please select slot & book again.', {
            duration: 5000,
          });
          setHold(null);
          if (fetchSlotsFn) fetchSlotsFn();
          return;
        }
      };
      tick();
      holdTimerRef.current = setInterval(tick, 1000);
    },
    [stopHoldTimer]
  );

  // Fetch doctor
  useEffect(() => {
    if (doctor) return;
    let alive = true;

    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const res = await api.get(DOCTOR_URL);
        if (!alive) return;
        setDoctor(res.data);
      } catch (err) {
        if (!alive) return;
        setError('Doctor not found.');
        toast.error('Doctor not found');
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchDoctor();
    return () => {
      alive = false;
    };
  }, [DOCTOR_URL, doctor]);

  // Fetch slots (uses backend isPassed)
  const fetchSlots = useCallback(async () => {
    if (!doctor || !selectedDateStr) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.get(SLOTS_URL, { params: { date: selectedDateStr } });

      const list = res.data?.slots || res.data?.data || res.data || [];
      const normalized = (Array.isArray(list) ? list : []).map((s) => ({
        ...s,
        isBooked: Boolean(s.isBooked),
        period: s.period || getPeriodFromTime(s.time),
      }));

      setSlots(normalized);

      if (
        selectedSlot &&
        normalized.some((s) => s.id === selectedSlot.id && s.isBooked)
      ) {
        setSelectedSlot(null);
        toast.error('Slot just got booked. Please pick another.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [SLOTS_URL, doctor, selectedDateStr, selectedSlot]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Auto‑refresh slots every 30s ONLY when there is an active hold
  useEffect(() => {
    if (!doctor || !hold) return;
    const id = setInterval(() => {
      fetchSlots();
    }, 30000);
    return () => clearInterval(id);
  }, [doctor, hold, fetchSlots]);

  useEffect(() => () => stopHoldTimer(), [stopHoldTimer]);

  // Use backend isPassed for counts
  const availableSlots = useMemo(
    () => slots.filter((s) => !s.isBooked && !s.isPassed),
    [slots]
  );
  const freeSlotsCount = useMemo(
    () => availableSlots.filter((s) => s.paymentMode === 'FREE').length,
    [availableSlots]
  );
  const paidSlotsCount = useMemo(
    () => availableSlots.filter((s) => s.paymentMode !== 'FREE').length,
    [availableSlots]
  );

  // Book
  const handleBookNow = async () => {
    if (!selectedSlot) return;

    if (!token || !user) {
      toast('Please login to continue booking');
      navigate('/login', { state: { from: location, doctor } });
      return;
    }

    if (selectedSlot.isBooked) {
      toast.error('Slot already booked. Please pick another.');
      setSelectedSlot(null);
      return;
    }

    try {
      setBookingLoading(true);

      const paymentMethod =
        selectedSlot.paymentMode === 'FREE'
          ? 'FREE'
          : selectedSlot.paymentMode === 'OFFLINE'
          ? 'OFFLINE'
          : 'ONLINE';

      const res = await api.post(CREATE_BOOKING_URL, {
        slotId: selectedSlot.id,
        paymentMethod,
      });

      const data = res.data;
      if (!data?.success) {
        toast.error(data?.error || 'Booking failed');
        return;
      }

      if (!data.isOnline) {
        toast.success(data.message || 'Appointment confirmed');
        navigate('/my-appointments');
        return;
      }

      const expiresIn =
        typeof data.expiresIn === 'number'
          ? data.expiresIn
          : Number(data.expiresIn || 0);

      if (!expiresIn || expiresIn <= 0) {
        toast.error('Booking hold expired. Please select slot & book again.', {
          duration: 5000,
        });
        fetchSlots();
        return;
      }

      const expiresAtMs = Date.now() + expiresIn * 1000;

      setHold({
        appointmentId: data.appointmentId,
        provider: data.provider,
        expiresAtMs,
        orderId: data.orderId,
        sessionId: data.sessionId,
        url: data.url,
        key: data.key,
        amount: data.amount,
      });
      startHoldTimer(expiresAtMs, fetchSlots);

      if (data.provider === 'STRIPE') {
        if (!data.url) {
          toast.error('Stripe payment URL missing');
          return;
        }
        window.location.href = data.url;
        return;
      }

      if (data.provider === 'RAZORPAY') {
        if (!window.Razorpay) {
          toast.error(
            'Razorpay SDK not loaded. Add checkout.js in index.html.'
          );
          return;
        }

        const options = {
          key: data.key,
          amount: data.amount,
          currency: 'INR',
          name: doctor?.clinic?.name || 'Clinic',
          description: `Consultation with ${doctor?.name || 'Doctor'}`,
          order_id: data.orderId,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          handler: async function (response) {
            try {
              const token = localStorage.getItem('token');

              await api.post(
                VERIFY_RAZORPAY_URL,
                {
                  appointmentId: data.appointmentId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              stopHoldTimer();
              setHold(null);
              toast.success('Appointment confirmed');
              navigate('/my-appointments');
            } catch (e) {
              console.error(e);
              toast.error(
                e.response?.data?.error ||
                  'Payment captured. Confirmation will reflect shortly.'
              );
              navigate('/my-appointments');
            }
          },
          modal: {
            ondismiss: function () {
              toast('Payment cancelled/closed. Slot is held temporarily.');
              fetchSlots();
            },
          },
          theme: { color: '#0b3b5e' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      }

      toast.error('Unsupported payment provider');
    } catch (err) {
      const msg = err?.response?.data?.error;
      const status = err?.response?.status;

      if (status === 409) {
        toast.error(msg || 'Slot just got booked. Please pick another.');
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

  const avatarUrl =
    !doctorAvatarBroken && doctor.avatar ? toFullUrl(doctor.avatar) : null;
  const doctorInitial = doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D';

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-28 h-28 mx-auto bg-[#003366] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md overflow-hidden text-white relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    setDoctorAvatarBroken(true);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-4xl font-bold uppercase">
                  {doctorInitial}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
            <p className="text-blue-600 font-medium mb-2">
              {getSpecialityLabel(doctor.speciality)}
            </p>

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
                onChange={(d) => setSelectedDate(d)}
                inline
                minDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  Available Slots
                </h3>
                <p className="text-sm text-gray-500">
                  For{' '}
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="flex gap-2 text-xs sm:text-sm">
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                  {availableSlots.length} Open
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {freeSlotsCount} Free
                </span>
                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {paidSlotsCount} Paid
                </span>
              </div>
            </div>

            {hold && holdLeftSec > 0 && (
              <div className="mb-5 bg-amber-50 border border-amber-200 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="text-sm text-amber-900">
                  Payment hold active ({hold.provider}). Complete payment within{' '}
                  <span className="font-bold">
                    {formatCountdown(holdLeftSec)}
                  </span>
                  .
                </div>
                <button
                  type="button"
                  onClick={() => {
                    fetchSlots();
                    toast('Slots refreshed');
                  }}
                  className="text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200"
                >
                  Refresh
                </button>
              </div>
            )}

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
                  const periodSlots = slots.filter(
                    (s) => s.period === period
                  );
                  if (!periodSlots.length) return null;

                  return (
                    <div key={period}>
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span>
                          {period === 'Morning'
                            ? '☀️'
                            : period === 'Afternoon'
                            ? '🌤️'
                            : '🌙'}
                        </span>
                        <span>{period}</span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {periodSlots.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          const isFree = slot.paymentMode === 'FREE';
                          const isBooked = slot.isBooked === true;
                          const isPassed = slot.isPassed === true;
                          const isDisabled = isBooked || isPassed;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                if (isDisabled) return;
                                setSelectedSlot(slot);
                              }}
                              className={`
                                min-w-[90px] text-center py-2 px-3 rounded-lg text-sm font-semibold border transition-all
                                ${
                                  isDisabled
                                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-white text-blue-600 border-blue-500 shadow-sm ring-2 ring-blue-200'
                                    : 'bg-white text-gray-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400'
                                }
                              `}
                            >
                              <div
                                className={
                                  isPassed ? 'line-through opacity-50' : ''
                                }
                              >
                                {to12Hour(slot.time)}
                              </div>

                              {isBooked ? (
                                <div className="text-[10px] mt-0.5 text-gray-400">
                                  Booked
                                </div>
                              ) : isPassed ? (
                                <div className="text-[10px] mt-0.5 text-red-300 font-medium">
                                  Passed
                                </div>
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
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm text-green-800 font-bold">
                        Slot Selected
                      </p>
                      <p className="text-xs text-green-600">
                        {selectedDate.toLocaleDateString()} at{' '}
                        {to12Hour(selectedSlot.time)}
                      </p>
                      <p className="text-xs text-green-700 font-semibold mt-1">
                        {selectedSlot.paymentMode === 'FREE'
                          ? 'Free Consultation'
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
                    {!token
                      ? 'Login to Confirm'
                      : bookingLoading
                      ? 'Processing...'
                      : selectedSlot.paymentMode === 'ONLINE'
                      ? 'Pay & Book'
                      : 'Confirm Booking'}
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

function getSpecialityLabel(speciality) {
  const labels = {
    DENTIST: 'Dentist',
    CARDIOLOGIST: 'Cardiologist',
    NEUROLOGIST: 'Neurologist',
    ORTHOPEDIC: 'Orthopedic',
    GYNECOLOGIST: 'Gynecologist',
    PEDIATRICIAN: 'Pediatrician',
    DERMATOLOGIST: 'Dermatologist',
    OPHTHALMOLOGIST: 'Ophthalmologist',
    GENERAL_PHYSICIAN: 'General Physician',
    OTHER: 'Specialist',
  };
  return labels[speciality] || speciality || 'Specialist';
}
