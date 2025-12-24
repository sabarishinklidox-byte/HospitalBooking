// src/features/admin/ClinicSlotManager.jsx
import React, { useState, useEffect, useCallback } from "react";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import Loader from "../../components/Loader.jsx";
import api from "../../lib/api";
import { ENDPOINTS } from "../../lib/endpoints";
import toast from "react-hot-toast";

const getLocalDateString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

function Filters({
  doctors,
  selectedDoctor,
  onDoctorChange,
  selectedDate,
  onDateChange,
  loading,
  onRefresh,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        value={selectedDoctor}
        onChange={(e) => onDoctorChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Doctors</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <button
        onClick={onRefresh}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
      >
        {loading ? "⟲ Loading..." : "⟲ Refresh"}
      </button>
    </div>
  );
}

function BlockReasonInput({ blockReason, onChange }) {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <label className="block text-sm font-semibold text-amber-800 mb-2">
        Block Reason (VIP Patient, Maintenance, Dr Leave, etc)
      </label>
      <input
        type="text"
        value={blockReason}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter reason why you're blocking..."
        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
      />
    </div>
  );
}

function SlotCard({ slot, onBlock, onUnblock }) {
  // status pill style like "Active" on old card
  let statusLabel = "Available";
  let statusClass =
    "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (slot.hasActiveAppointment) {
    statusLabel = "Booked";
    statusClass = "bg-blue-100 text-blue-700 border border-blue-200";
  } else if (slot.isBlocked) {
    statusLabel = "Blocked";
    statusClass = "bg-red-100 text-red-700 border border-red-200";
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* top bar: time + status pill */}
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="text-sm font-semibold text-gray-900">
          {slot.time}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="px-4 pb-3 mt-1">
        <p className="text-sm font-semibold text-gray-900">
          {slot.doctorName}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Consultation fee
        </p>
        <p className="text-lg font-bold text-emerald-600 mt-1">
          ₹{slot.price}
        </p>
      </div>

      {/* booked / blocked info */}
      <div className="px-4 pb-3 space-y-2">
        {slot.hasActiveAppointment && (
          <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <span className="font-semibold">Booked</span>
            {slot.patientName && (
              <span className="block mt-0.5 text-blue-800">
                {slot.patientName}
              </span>
            )}
          </div>
        )}

        {slot.isBlocked && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <span className="font-semibold">Blocked</span>
            {slot.blockedReason && (
              <span className="block mt-0.5 text-red-800">
                {slot.blockedReason}
              </span>
            )}
          </div>
        )}
      </div>

      {/* action area like lower row of old card */}
      {!slot.hasActiveAppointment && (
        <div className="mt-auto px-4 pb-4">
          <button
            onClick={() =>
              slot.isBlocked ? onUnblock(slot.id) : onBlock(slot.id)
            }
            className={`w-full text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors ${
              slot.isBlocked
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {slot.isBlocked ? "Unblock slot" : "Block slot"}
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onRefresh }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto mb-5 bg-gray-100 rounded-2xl flex items-center justify-center">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        No Slots Available
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Try selecting a different doctor or date.
      </p>
      <button
        onClick={onRefresh}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        ⟲ Refresh slots
      </button>
    </div>
  );
}

export default function ClinicSlotManager() {
  const [slots, setSlots] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [loading, setLoading] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
    api
      .get(ENDPOINTS.ADMIN.DOCTORS)
      .then((res) => setDoctors(res.data))
      .catch(() => toast.error("Failed to load doctors"));
  }, []);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDoctor) params.append("doctorId", selectedDoctor);
      if (selectedDate) params.append("date", selectedDate);

      const res = await api.get(`${ENDPOINTS.ADMIN.MANAGE}?${params}`);
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error("Fetch slots error:", err);
      toast.error("Failed to load slots");
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const blockSlot = async (slotId) => {
    if (!blockReason.trim()) {
      toast.error("Please enter block reason");
      return;
    }
    try {
      await api.post(ENDPOINTS.ADMIN.BLOCK(slotId), { reason: blockReason });
      toast.success("Slot blocked successfully");
      fetchSlots();
    } catch (err) {
      console.error("Block error:", err);
      toast.error(err?.response?.data?.error || "Failed to block slot");
    }
  };

  const unblockSlot = async (slotId) => {
    try {
      await api.post(ENDPOINTS.ADMIN.UNBLOCK(slotId));
      toast.success("Slot unblocked");
      fetchSlots();
    } catch (err) {
      console.error("Unblock error:", err);
      toast.error(err?.response?.data?.error || "Failed to unblock slot");
    }
  };

  return (
    <ClinicAdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header + filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Slot Manager
            </h1>
            <p className="text-sm text-gray-600">
              Block/unblock slots for phone bookings, VIPs, maintenance.
            </p>
          </div>

          <Filters
            doctors={doctors}
            selectedDoctor={selectedDoctor}
            onDoctorChange={setSelectedDoctor}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            loading={loading}
            onRefresh={fetchSlots}
          />
        </div>

        <BlockReasonInput
          blockReason={blockReason}
          onChange={setBlockReason}
        />

        {/* Slots grid with new card design */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              onBlock={blockSlot}
              onUnblock={unblockSlot}
            />
          ))}
        </div>

        {!loading && slots.length === 0 && (
          <EmptyState onRefresh={fetchSlots} />
        )}

        {loading && (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        )}
      </div>
    </ClinicAdminLayout>
  );
}
