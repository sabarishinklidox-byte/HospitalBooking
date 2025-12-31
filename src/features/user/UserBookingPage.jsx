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
import clsx from 'clsx';

import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  const rescheduleFromId = location.state?.rescheduleFromAppointmentId;

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
          toast.error('Payment hold expired. Please select slot & try again.', {
            duration: 5000,
          });
          setHold(null);
          if (fetchSlotsFn) fetchSlotsFn();
        }
      };
      tick();
      holdTimerRef.current = setInterval(tick, 1000);
    },
    [stopHoldTimer]
  );

  useEffect(() => () => stopHoldTimer(), [stopHoldTimer]);

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
    return () => { alive = false; };
  }, [DOCTOR_URL, doctor]);

const fetchSlots = useCallback(async () => {
  if (!doctor || !selectedDateStr) return;
  setLoading(true);
  setError('');
  try {
    const params = { 
      date: selectedDateStr,
      showHolds: true  // ✅ Backend sends ALL holds
    };
    if (rescheduleFromId) params.excludeAppointmentId = rescheduleFromId;

    const res = await api.get(SLOTS_URL, { params });
    const list = res.data?.slots || res.data || [];
    
    const normalized = list.map((s) => {
      // 🔥 CRITICAL: Differentiate MY hold vs OTHER user's hold!
      const isConfirmedBooked = s.isBooked && !s.holdStatus;
      
      // ✅ FIXED: Check holdUserId matches CURRENT user
      // Frontend can now check: s.holdUserId === user?.userId
const isMyHold = s.holdStatus === 'PENDING_PAYMENT' && 
                 s.holdUserId === user?.userId;  // ✅ WORKS NOW!

      
      // 🔥 NEW: Other user's hold (User B sees this as DISABLED)
      const isOtherHold = s.holdStatus === 'PENDING_PAYMENT' && 
                          s.holdUserId !== user?.userId &&  // 🔥 BLOCK OTHER!
                          s.holdExpiresInMinutes && s.holdExpiresInMinutes > 0;

      return {
        ...s,
        isBooked: isConfirmedBooked,
        myHold: isMyHold,                           // ✅ Only MY holds clickable
        otherHold: isOtherHold,                     // 🔥 Other holds DISABLED
        holdExpiry: s.holdExpiry,
        period: getPeriodFromTime(s.time),
      };
    });

    setSlots(normalized);

    // 🔥 MAGIC: Restore ONLY MY EXISTING hold!
    const myExistingHold = normalized.find(s => s.myHold);
    if (myExistingHold && !hold) {
      const expiresAtMs = new Date(myExistingHold.holdExpiry).getTime();
      if (expiresAtMs > Date.now()) {
        setHold({
          appointmentId: myExistingHold.holdAppointmentId,  // ✅ Use appointmentId!
          slotId: myExistingHold.id,
          expiresAtMs,
        });
        startHoldTimer(expiresAtMs, fetchSlots);
        setSelectedSlot(myExistingHold);
        toast(`Your hold restored! ${myExistingHold.holdExpiresInMinutes}m left`);
      }
    }

  } catch (err) {
    toast.error('Failed to load slots');
  } finally {
    setLoading(false);
  }
}, [SLOTS_URL, doctor, selectedDateStr, rescheduleFromId, hold, user?.userId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useEffect(() => {
    if (!doctor || !hold) return;
    const id = setInterval(() => { fetchSlots(); }, 30000);
    return () => clearInterval(id);
  }, [doctor, hold, fetchSlots]);

  // 🔥 FIXED: availableSlots = excludes confirmed/pending/OTHER holds
  const availableSlots = useMemo(() => 
    slots.filter((s) => 
      !s.isBooked &&           // Confirmed bookings OUT
      !s.isPassed && 
      !s.isClinicPending &&    // Clinic pending OUT
      (!s.isPaymentHold || s.myHold)  // Other holds OUT, MY holds IN
    ), 
    [slots, user?.userId]
  );
const openRazorpayForExistingHold = (holdData) => {
  if (!window.Razorpay) {
    toast.error('Razorpay SDK not loaded');
    return;
  }

  // 🔥 ADD THIS 1 LINE SAFETY CHECK:
  if (!holdData.key || !holdData.orderId) {
    console.error('❌ Missing hold data:', holdData);
    toast.error('Payment session expired. Please try again.');
    return;
  }

  const options = {
    key: holdData.key,
    amount: holdData.amount,
    currency: 'INR',
    name: doctor?.clinic?.name || 'Clinic',
    description: rescheduleFromId ? 'Reschedule Payment' : 'Appointment Payment',
    order_id: holdData.orderId,
    prefill: {
      name: user?.name,
      email: user?.email,
      contact: user?.phone,
    },
    handler: async function (response) {
      try {
        const verifyToast = toast.loading("Verifying payment...");
        await api.post(VERIFY_RAZORPAY_URL, {
          provider: "RAZORPAY",
          clinic_id: doctor.clinic.id || selectedSlot.clinicId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          notes: {
            type: rescheduleFromId ? "RESCHEDULE" : "BOOKING",
            appointmentId: holdData.appointmentId,
            slotId: selectedSlot.id,
            amount: holdData.amount
          }
        });
        toast.dismiss(verifyToast);
        stopHoldTimer();
        setHold(null);
        toast.success(rescheduleFromId ? 'Reschedule Confirmed' : 'Appointment Confirmed');
        navigate('/my-appointments');
      } catch (e) {
        toast.dismiss();
        console.error(e);
        toast.error('Payment verification failed. Contact support.');
        navigate('/my-appointments');
      }
    },
    theme: { color: '#0b3b5e' },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


  const handleBookNow = async () => {
    if (!selectedSlot) return;

    if (!token || !user) {
      toast('Please login to continue');
      navigate('/login', { state: { from: location, doctor } });
      return;
    }

    // 🔥 FIXED: Allow MY holds + handle all status types
   if (selectedSlot.isBooked || selectedSlot.isClinicPending || selectedSlot.isPaymentHold) {
    if (!hold || hold.slotId !== selectedSlot.id || !selectedSlot.myHold) {
      toast.error('Slot currently unavailable.');
      setSelectedSlot(null);
      return;
    }
  }
   if (hold && hold.slotId === selectedSlot.id && holdLeftSec > 0) {
    console.log('🔄 Using EXISTING hold - no new API call');
    openRazorpayForExistingHold(hold);
    return;
  }

    try {
      setBookingLoading(true);
      let responseData;

      if (rescheduleFromId) {
        const res = await api.patch(
          ENDPOINTS.USER.RESCHEDULE_APPOINTMENT(rescheduleFromId),
          {
            appointmentId: rescheduleFromId,
            newSlotId: selectedSlot.id,
            provider: "RAZORPAY" 
          }
        );
        const apiResponse = res.data;
        responseData = apiResponse.data ? apiResponse.data : apiResponse;
        
        if (apiResponse.success && apiResponse.status !== "PAYMENT_REQUIRED" && !responseData.status) {
          toast.success("Reschedule Successful!");
          navigate('/my-appointments');
          return;
        }
      } else {
        const paymentMethod = selectedSlot.paymentMode === 'FREE' ? 'FREE' 
          : selectedSlot.paymentMode === 'OFFLINE' ? 'OFFLINE' : 'ONLINE';
        
        const res = await api.post(CREATE_BOOKING_URL, {
          slotId: selectedSlot.id,
          paymentMethod,
        });
        responseData = res.data;

        if (!responseData.success) {
          throw new Error(responseData.error || 'Booking failed');
        }

        if (!responseData.isOnline) {
          toast.success(responseData.message || 'Appointment confirmed');
          navigate('/my-appointments');
          return;
        }
      }

      const isPaymentRequired = responseData.status === "PAYMENT_REQUIRED" || responseData.isOnline;

      if (isPaymentRequired) {
        const expiresIn = responseData.expiresIn || 600;
        const expiresAtMs = Date.now() + expiresIn * 1000;

        setHold({
          appointmentId: responseData.appointmentId,
          provider: responseData.provider || 'RAZORPAY',
          expiresAtMs,
          orderId: responseData.orderId,
          key: responseData.key || responseData.keyId,
          amount: responseData.amount,
          slotId: selectedSlot.id,
          isReschedule: !!rescheduleFromId 
        });

        startHoldTimer(expiresAtMs, fetchSlots);

        if (!window.Razorpay) {
          toast.error('Razorpay SDK not loaded');
          return;
        }

        const options = {
          key: responseData.key || responseData.keyId,
          amount: responseData.amount,
          currency: 'INR',
          name: doctor?.clinic?.name || 'Clinic',
          description: rescheduleFromId ? 'Reschedule Payment' : 'Appointment Payment',
          order_id: responseData.orderId,
          prefill: {
              name: user?.name,
              email: user?.email,
              contact: user?.phone,
          },
         handler: async function (response) {
  try {
    const verifyToast = toast.loading("Verifying payment...");
    
    // 🔥 SAFE VALUES (from hold state, not volatile selectedSlot)
    const safeAppointmentId = hold?.appointmentId || responseData.appointmentId;
    const safeSlotId = hold?.slotId || selectedSlot?.id;
    const safeClinicId = doctor?.clinic?.id || selectedSlot?.clinicId;
    
    // 🔥 VALIDATION
    if (!safeAppointmentId) {
      throw new Error('Missing appointmentId');
    }
    
    await api.post(VERIFY_RAZORPAY_URL, {
      appointmentId: safeAppointmentId,  // ✅ Primary field (backend expects this)
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
      notes: {
        type: rescheduleFromId ? "RESCHEDULE" : "BOOKING",
        appointmentId: safeAppointmentId,  // ✅ Duplicate for safety
        slotId: safeSlotId,                // ✅ Safe (can be null for reschedule)
        clinicId: safeClinicId,
        amount: responseData.amount
      }
    });
    
    toast.dismiss(verifyToast);
    stopHoldTimer();
    setHold(null);
    toast.success(rescheduleFromId ? 'Reschedule Confirmed!' : 'Booking Confirmed!');
    
    // Small delay for backend processing
    setTimeout(() => {
      navigate('/my-appointments');
    }, 500);
    
  } catch (e) {
    toast.dismiss();
    console.error('❌ Payment handler error:', e);
    
    // User-friendly message
    toast.error(
      'Payment received but verification pending. Check "My Appointments" in 30 seconds.',
      { duration: 8000 }
    );
    
    // Still navigate - webhook will complete
    setTimeout(() => {
      navigate('/my-appointments');
    }, 2000);
  }
},
theme: { color: '#0b3b5e' },
        }

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Action failed';
      if (err?.response?.status === 409) {
        toast.error('Slot just got booked. Please pick another.');
        fetchSlots();
        setSelectedSlot(null);
      } else {
        toast.error(msg);
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

  const avatarUrl = !doctorAvatarBroken && doctor.avatar ? toFullUrl(doctor.avatar) : null;
  const doctorInitial = doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D';

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT PROFILE */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-28 h-28 mx-auto bg-[#003366] rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md overflow-hidden text-white relative">
              {avatarUrl ? (
                  <img src={avatarUrl} alt={doctor.name} className="w-full h-full object-cover" onError={(e) => { setDoctorAvatarBroken(true); e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <span className="text-4xl font-bold">{doctorInitial}</span>
                )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{doctor.name}</h2>
            <p className="text-blue-600 font-medium mb-2">{doctor.speciality?.name || doctor.speciality || 'Unknown'}</p>
            {doctor.clinic && (
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 bg-gray-50 py-2 rounded-lg">
                <span>🏥</span> {doctor.clinic.name}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
               <h3 className="font-bold text-[#003366] flex items-center gap-2"><span>📅</span> Select Date</h3>
            </div>
            <div className="p-4 flex justify-center booking-calendar-wrapper">
              <DatePicker selected={selectedDate} onChange={(d) => setSelectedDate(d)} inline minDate={new Date()} />
            </div>
          </div>
        </div>

        {/* RIGHT SLOTS */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Available Slots</h3>
                <p className="text-sm text-gray-500">For {selectedDate.toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 text-xs sm:text-sm">
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">{availableSlots.length} Open</span>
              </div>
            </div>

            {hold && holdLeftSec > 0 && (
              <div className="mb-5 bg-amber-50 border border-amber-200 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="text-sm text-amber-900">
                  Payment hold active. Complete payment within <span className="font-bold">{formatCountdown(holdLeftSec)}</span>.
                </div>
                <button type="button" onClick={fetchSlots} className="text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-900 font-semibold hover:bg-amber-200">Refresh</button>
              </div>
            )}

            {loading ? <div className="flex-1 flex items-center justify-center py-12"><Loader /></div> : slots.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12"><span className="text-4xl mb-2">😴</span><p>No slots available.</p></div>
            ) : (
              <div className="space-y-6">
                {['Morning', 'Afternoon', 'Evening'].map((period) => {
                  const periodSlots = slots.filter((s) => s.period === period);
                  if (!periodSlots.length) return null;
                  return (
                      <div key={period}>
                          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"><span>{period}</span></div>
                          <div className="flex flex-wrap gap-3">
                              {periodSlots.map((slot) => {
                                  const isSelected = selectedSlot?.id === slot.id;
                                  const isFree = slot.paymentMode === 'FREE';
                                  
                                  // 🔥 PERFECT DISABLE LOGIC
                                  const isMyHold = slot.myHold;
                                  const isOtherHold = slot.isPaymentHold;
                                  const isDisabled = slot.isBooked || 
                                                     slot.isPassed || 
                                                     slot.isClinicPending || 
                                                     (isOtherHold && !isMyHold);
                                  
                                  return (
                                      <button 
                                        key={slot.id} 
                                        type="button" 
                                        disabled={isDisabled} 
                                        onClick={() => !isDisabled && setSelectedSlot(slot)}
                                        className={clsx(
                                          "min-w-[90px] text-center py-2 px-3 rounded-lg text-sm font-semibold border transition-all flex flex-col items-center",
                                          isDisabled 
                                            ? (isOtherHold 
                                                ? "bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed opacity-80" 
                                                : slot.isClinicPending 
                                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200 cursor-not-allowed opacity-80"
                                                  : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed")
                                            : isSelected 
                                              ? "bg-white text-blue-600 border-blue-500 shadow-sm ring-2 ring-blue-200" 
                                              : "bg-white text-gray-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400"
                                        )}>
                                        <div className={slot.isPassed ? 'line-through opacity-50' : ''}>
                                          {to12Hour(slot.time)}
                                        </div>
                                        
                                        {/* 🔥 PERFECT STATUS HIERARCHY */}
                                        {slot.isBooked ? (
                                          <div className="text-[10px] mt-0.5 text-red-400 font-medium">Booked</div>
                                        ) : slot.isClinicPending ? (
                                          <div className="text-[10px] mt-0.5 text-yellow-600 font-medium">Pending</div>
                                        ) : isOtherHold ? (
                                          <div className="text-[10px] mt-0.5 text-amber-600 font-medium animate-pulse">Hold</div>
                                        ) : isMyHold ? (
                                          <div className="text-[10px] mt-0.5 text-blue-600 font-medium animate-pulse">
                                            Your Hold
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
                      <div>
                         <p className="text-sm text-green-800 font-bold">Slot Selected</p>
                         <p className="text-xs text-green-600">{selectedDate.toLocaleDateString()} at {to12Hour(selectedSlot.time)}</p>
                      </div>
                   </div>
                  <button onClick={handleBookNow} disabled={bookingLoading} className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition-transform active:scale-95 disabled:opacity-70">
                    {!token ? 'Login to Confirm' : bookingLoading ? 'Processing...' : 
                        rescheduleFromId ? 'Confirm Reschedule' : 
                        selectedSlot.paymentMode === 'ONLINE' ? 'Pay & Book' : 'Confirm Booking'}
                  </button>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm">Select a time slot above to proceed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
