import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

const INITIAL_FORM = {
  email: '',
  name: '',
  phone: '',
  clinicId: '',
  password: '',
};

export default function CreateClinicAdminForm({ onCreated, onError }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  // 1. Fetch Clinics for Dropdown
  useEffect(() => {
  const fetchClinics = async () => {
    try {
      setLoadingClinics(true);
      const res = await api.get(`${ENDPOINTS.SUPER_ADMIN.CLINICS}?limit=100`);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.clinics || [];
      setClinics(list);
    } catch (err) {
      console.error('Failed to load clinics', err);
      toast.error('Failed to load clinics list');
    } finally {
      setLoadingClinics(false);
    }
  };
  fetchClinics();
}, []);

const handleChange = (e) =>
  setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  if (
    !form.email ||
    !form.name ||
    !form.password ||
    form.password.length < 6
  ) {
    toast.error('Email, Name, and Password (min 6 chars) are required.');
    setSaving(false);
    return;
  }

  try {
    const payload = { ...form };
    if (!payload.clinicId || payload.clinicId === '') {
      delete payload.clinicId;
    }

    const res = await api.post(ENDPOINTS.SUPER_ADMIN.ADMINS, payload);

    setForm(INITIAL_FORM);

    if (onCreated) {
      onCreated(res.data);
    } else {
      toast.success(`Admin "${res.data.name}" created!`);
    }
  } catch (err) {
    console.error('Create Admin Error:', err);
    const msg = err.response?.data?.error || 'Failed to create admin.';
    if (onError) onError(msg);
    else toast.error(msg);
  } finally {
    setSaving(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="w-full">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Email */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Email*
          </label>
          <input
            name="email"
            type="email"
            className="input w-full"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="admin@clinic.com"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Full Name*
          </label>
          <input
            name="name"
            className="input w-full"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Phone
          </label>
          <input
            name="phone"
            className="input w-full"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
          />
        </div>

        {/* Clinic Select */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Clinic (optional)
          </label>
          {loadingClinics ? (
            <div className="h-10 w-full bg-gray-100 animate-pulse rounded-lg"></div>
          ) : (
            <select
              name="clinicId"
              className="input w-full bg-white"
              value={form.clinicId}
              onChange={handleChange}
            >
              <option value="">Not assigned yet</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name} {clinic.city ? `(${clinic.city})` : ''}
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Assign this admin to a specific clinic immediately.
          </p>
        </div>

        {/* Password */}
        <div className="md:col-span-2">
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Password* (min 6 chars)
          </label>
          <input
            name="password"
            type="password"
            className="input w-full"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="Secure Admin Password"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full md:w-auto px-8 py-3 text-base font-bold rounded-xl shadow-lg disabled:opacity-70"
          style={{ backgroundColor: '#003366' }} 
        >
          {saving ? 'Creating...' : 'Create Admin'}
        </button>
      </div>
    </form>
  );
}
