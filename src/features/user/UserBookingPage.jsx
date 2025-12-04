import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';

const DEFAULT_DOCTOR_IMAGE = "/default-doctor.jpg";

export default function UserBookingPage() {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  // 1. Initialize doctor from navigation state if available
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');

  // 2. Fetch Doctor Details (if accessed directly via URL)
  useEffect(() => {
    if (doctor) return;
    
    const fetchDoctor = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/public/doctors/${doctorId}`);
        setDoctor(res.data);
      } catch (err) {
        setError('Doctor not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId, doctor]);

  // 3. Fetch Slots for Selected Date
  useEffect(() => {
    if (!doctor || !selectedDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError('');
      try {
        // Backend should return slots with 'isBooked' flag
        const res = await api.get(`/public/doctors/${doctor.id}/slots`, { 
          params: { date: selectedDate } 
        });
        setSlots(res.data);
      } catch (err) {
        setError('Failed to load slots.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSlots();
  }, [doctor, selectedDate]);

  // 4. Handle Booking Action
  const handleBookNow = async () => {
    if (!selectedSlot) return;

    // Redirect to Login if needed (Pass 'from' location to return later)
    if (!token || !user) {
      navigate('/login', { 
        state: { 
          from: location,
          doctor: doctor 
        } 
      });
      return;
    }

    try {
      setLoading(true);
      
      // Safe Clinic ID check
      const finalClinicId = doctor.clinicId || doctor.clinic?.id;

      if (!finalClinicId) {
        alert("System Error: Clinic ID missing for this doctor.");
        return;
      }

      await api.post('/user/appointments', {
        slotId: selectedSlot.id,
        doctorId: doctor.id,
        clinicId: finalClinicId,
        bookingSection: 'GENERAL'
      });

      alert('Appointment booked successfully!');
      navigate('/my-appointments');
      
    } catch (err) {
      // Specific error message for booked slots
      const msg = err.response?.data?.error;
      if (msg && msg.includes('Unique constraint')) {
        alert('Someone just booked this slot! Please choose another.');
        // Optional: Refresh slots here
        setSlots(prev => prev.map(s => s.id === selectedSlot.id ? {...s, isBooked: true} : s));
        setSelectedSlot(null);
      } else {
        alert(msg || 'Booking failed.');
      }
      setLoading(false);
    }
  };

  if (loading && !doctor) return <UserLayout><Loader /></UserLayout>;
  if (error) return <UserLayout><p className="text-center p-10 text-red-500">{error}</p></UserLayout>;
  if (!doctor) return null;

  return (
    <UserLayout>
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT SIDE: Doctor Profile */}
        <div className="bg-white p-6 rounded-xl shadow-lg text-center h-fit border border-gray-100">
           <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full overflow-hidden mb-4 border-4 border-white shadow">
             <img 
                src={doctor.avatar || DEFAULT_DOCTOR_IMAGE} 
                alt={doctor.name} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = DEFAULT_DOCTOR_IMAGE; }}
             />
           </div>
           <h2 className="text-xl font-bold text-[#0b3b5e]">{doctor.name}</h2>
           <p className="text-gray-600 font-medium">{doctor.speciality}</p>
           {doctor.clinic && (
             <p className="text-sm text-gray-400 mt-2">{doctor.clinic.name}</p>
           )}
        </div>

        {/* RIGHT SIDE: Slot Selection */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
           <label className="block font-bold text-gray-700 mb-2">Select Date:</label>
           <input 
             type="date" 
             value={selectedDate} 
             min={new Date().toISOString().split('T')[0]}
             onChange={(e) => setSelectedDate(e.target.value)}
             className="input w-full mb-6 border-gray-300 focus:ring-[#0b3b5e]"
           />

           <h3 className="font-bold text-gray-800 mb-4">Available Slots</h3>
           
           {slots.length === 0 ? (
             <p className="text-gray-500 italic">No slots available for this date.</p>
           ) : (
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
               {slots.map(slot => (
                 <button
                   key={slot.id}
                   disabled={slot.isBooked} // Disable button if booked
                   onClick={() => setSelectedSlot(slot)}
                   className={`
                     py-2 px-1 rounded-lg text-sm font-semibold transition-all border
                     ${slot.isBooked 
                        ? 'bg-red-50 text-red-400 border-red-100 cursor-not-allowed line-through opacity-70' // BOOKED STYLE
                        : selectedSlot?.id === slot.id
                          ? 'bg-[#0b3b5e] text-white border-[#0b3b5e] shadow-md transform scale-105' // SELECTED STYLE
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#0b3b5e] hover:text-[#0b3b5e]' // AVAILABLE STYLE
                     }
                   `}
                 >
                   {slot.time}
                 </button>
               ))}
             </div>
           )}

           {/* Legend */}
           <div className="flex gap-4 mt-6 text-xs text-gray-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 border rounded bg-white"></div> Available</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#0b3b5e]"></div> Selected</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-50 border border-red-100"></div> Booked</div>
           </div>

           <button 
             onClick={handleBookNow}
             disabled={!selectedSlot}
             className="w-full mt-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
           >
             {token ? 'Confirm Booking' : 'Login to Book Appointment'}
           </button>
        </div>
      </div>
    </UserLayout>
  );
}
