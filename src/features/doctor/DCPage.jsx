import React, { useEffect, useState } from "react";
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import api from "../../lib/api";
import { ENDPOINTS } from "../../lib/endpoints";
import { motion } from 'framer-motion';

export default function DoctorCalendarPage() {
  const toLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const formatTo12Hr = (timeStr) => {
  if (!timeStr) return "";
  // Handles formats like "14:30", "14:30:00", or even "2024-01-01T14:30:00"
  const [hours, minutes] = timeStr.includes('T') 
    ? timeStr.split('T')[1].split(':') 
    : timeStr.split(':');
    
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convert 0 to 12
  return `${hour}:${minutes.substring(0, 2)} ${ampm}`;
};

  const today = toLocalDateString(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const pendingAppts = appointments.filter(a => ['PENDING', 'PENDING_PAYMENT'].includes(a.status));
  const confirmedAppts = appointments.filter(a => a.status === 'CONFIRMED');

  const fetchData = async (date) => {
    setLoading(true);
    try {
      const [slotsRes, apptsRes] = await Promise.all([
        api.get(`/doctor/available-slots?date=${date}`),
        api.get(`${ENDPOINTS.DOCTOR.APPOINTMENTS}?date=${date}`)
      ]);
      setSlots(slotsRes.data?.slots || []);
      setAppointments(apptsRes.data?.appointments || apptsRes.data || []);
    } catch (err) {
      console.error("Fetch error", err);
      setSlots([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    const dayOfMonth = i - firstDay + 1;
    if (dayOfMonth < 1) {
      const prevDay = new Date(year, month, dayOfMonth);
      calendarDays.push({ day: prevDay.getDate(), date: null, isCurrentMonth: false });
    } else if (dayOfMonth <= daysInMonth) {
      const dateStr = toLocalDateString(new Date(year, month, dayOfMonth));
      calendarDays.push({ day: dayOfMonth, date: dateStr, isCurrentMonth: true });
    } else {
      const nextDay = new Date(year, month + 1, dayOfMonth - daysInMonth);
      calendarDays.push({ day: nextDay.getDate(), date: null, isCurrentMonth: false });
    }
  }

  const handleDateClick = (dayObj) => {
    if (dayObj.date) setSelectedDate(dayObj.date);
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const StatusBadge = ({ status }) => {
    const config = {
      'PENDING': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', dot: 'bg-orange-400' },
      'CONFIRMED': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-400' },
      'COMPLETED': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', dot: 'bg-blue-400' },
      'CANCELLED': { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', dot: 'bg-slate-400' },
    }[status] || { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', dot: 'bg-gray-400' };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border} flex items-center gap-1.5 uppercase tracking-wider`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {status.split('_')[0]}
      </span>
    );
  };

  return (
    <DoctorLayout>
      <div className="min-h-screen bg-[#FDFDFF] p-4 lg:p-8 font-sans text-slate-900">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Doctor Schedule</h1>
              <p className="text-slate-500 font-medium mt-1">Manage your daily workflow and availability</p>
            </div>
            <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Focusing on</span>
              <span className="text-lg font-bold text-blue-600">
                {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Awaiting', val: pendingAppts.length, color: 'orange' },
              { label: 'Confirmed', val: confirmedAppts.length, color: 'emerald' },
              { label: 'Free Slots', val: slots.length, color: 'blue' }
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <div className={`text-4xl font-black text-${stat.color}-500`}>{stat.val}</div>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center text-xl`}>
                   {stat.label === 'Free Slots' ? '⏰' : '📅'}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 📅 CALENDAR CARD */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm sticky top-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-xl text-slate-800">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600">‹</button>
                    <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600">›</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayObj, idx) => {
                    const isSelected = dayObj.date === selectedDate;
                    const isToday = dayObj.date === today;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateClick(dayObj)}
                        disabled={!dayObj.isCurrentMonth}
                        className={`aspect-square rounded-2xl text-sm font-bold transition-all relative
                          ${!dayObj.isCurrentMonth ? 'text-slate-200 cursor-default' : 'hover:bg-slate-50'}
                          ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 z-10 hover:bg-blue-700' : 'text-slate-600'}
                          ${isToday && !isSelected ? 'text-blue-600 ring-2 ring-blue-50 ring-offset-1' : ''}
                        `}
                      >
                        {dayObj.day}
                        {dayObj.isCurrentMonth && !isSelected && slots.some(s => s.date === dayObj.date) && (
                          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 🕒 APPOINTMENTS & SLOTS SECTION */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Appointments List */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Confirmed Patients</h3>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500">
                    {appointments.length} Total
                  </span>
                </div>
                
                <div className="p-8">
                  {loading ? (
                    <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Syncing Schedule...</div>
                  ) : appointments.length === 0 ? (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">☕</div>
                      <p className="text-slate-400 font-bold">No appointments for this date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appointments.map(appt => (
                        <motion.div 
                          key={appt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 p-5 rounded-3xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-md transition-all group"
                        >
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl group-hover:bg-blue-50 transition-colors">
                            {appt.patientName?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 truncate">{appt.patientName}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{formatTo12Hr(appt.timeFormatted)}</p>
                          </div>
                          <StatusBadge status={appt.status} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Slots Grid */}
              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-slate-50 bg-emerald-50/20">
                  <h3 className="text-lg font-black text-emerald-900 tracking-tight">Available Bookings</h3>
                </div>
                
                <div className="p-8">
                  {slots.length === 0 ? (
                    <div className="py-12 text-center text-slate-300 font-bold italic border-2 border-dashed border-slate-50 rounded-[2rem]">
                      All slots are currently booked or unavailable.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                      {slots.map(slot => (
                        <div key={slot.id} className="relative p-4 bg-white border border-slate-100 rounded-2xl text-center group hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-default shadow-sm">
                          <div className="text-lg font-black text-slate-700 group-hover:text-emerald-700">{formatTo12Hr(slot.time)}</div>
                          <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter group-hover:text-emerald-500">Free</div>
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}