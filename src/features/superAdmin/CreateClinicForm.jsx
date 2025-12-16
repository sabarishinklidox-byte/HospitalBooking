// src/features/superAdmin/CreateClinicForm.jsx
import React, { useState } from 'react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

const INITIAL_FORM = {
  name: '',
  address: '',
  city: '',
  pincode: '',
  timings: '',
  details: '',
  logo: '',
  banner: '',
};

export default function CreateClinicForm({ onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, banner: false });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading((prev) => ({ ...prev, [field]: true }));

      const fd = new FormData();
      fd.append('file', file);

      // Backend: POST /api/super-admin/clinics/upload
      const res = await api.post(ENDPOINTS.SUPER_ADMIN.CLINIC_UPLOAD, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setForm((prev) => ({ ...prev, [field]: res.data.url }));
      toast.success(`${field === 'logo' ? 'Logo' : 'Banner'} uploaded`);
    } catch (err) {
      console.error('Upload error', err);
      toast.error('Failed to upload image');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.address || !form.city || !form.pincode) {
      toast.error('Clinic Name, Address, City, and Pincode are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        timings: form.timings || undefined,
        details: form.details || undefined,
        logo: form.logo || undefined,
        banner: form.banner || undefined,
      };

      const res = await api.post(ENDPOINTS.SUPER_ADMIN.CLINICS, payload);

      setForm(INITIAL_FORM);
      toast.success(`Clinic "${res.data.name}" created`);
      if (onCreated) onCreated(res.data);
    } catch (err) {
      console.error('Create clinic error', err);
      const msg = err.response?.data?.error || 'Failed to create clinic.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Basic Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Clinic Name */}
        <div className="md:col-span-2">
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Clinic Name*
          </label>
          <input
            name="name"
            className="input w-full"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. City Care Hospital"
          />
        </div>

        {/* Logo (file upload) */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Logo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'logo')}
          />
          {uploading.logo && (
            <p className="mt-1 text-xs text-gray-400">Uploading logo...</p>
          )}
          {form.logo && (
            <img
              src={form.logo}
              alt="Logo preview"
              className="h-10 mt-2 rounded border object-contain"
            />
          )}
        </div>

        {/* Banner (file upload) */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Banner
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'banner')}
          />
          {uploading.banner && (
            <p className="mt-1 text-xs text-gray-400">Uploading banner...</p>
          )}
          {form.banner && (
            <img
              src={form.banner}
              alt="Banner preview"
              className="h-16 mt-2 rounded border object-cover"
            />
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Address*
          </label>
          <input
            name="address"
            className="input w-full"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Full Street Address"
          />
        </div>

        {/* City */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            City*
          </label>
          <input
            name="city"
            className="input w-full"
            value={form.city}
            onChange={handleChange}
            required
            placeholder="Mumbai"
          />
        </div>

        {/* Pincode */}
        <div>
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Pincode*
          </label>
          <input
            name="pincode"
            className="input w-full"
            value={form.pincode}
            onChange={handleChange}
            required
            placeholder="400001"
          />
        </div>

        {/* Timings (optional) */}
        <div className="md:col-span-2">
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Timings (Optional)
          </label>
          <input
            name="timings"
            className="input w-full"
            value={form.timings}
            onChange={handleChange}
            placeholder="Mon–Sat: 9am – 9pm"
          />
        </div>

        {/* Details (optional) */}
        <div className="md:col-span-2">
          <label className="block mb-1.5 text-sm font-bold text-gray-700">
            Details (Optional)
          </label>
          <textarea
            name="details"
            className="input w-full min-h-[80px]"
            value={form.details}
            onChange={handleChange}
            placeholder="Short description, specialties, parking info, etc."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-end pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full md:w-auto px-8 py-3 text-base font-bold rounded-xl shadow-lg disabled:opacity-70"
          style={{ backgroundColor: '#003366' }}
        >
          {saving ? 'Creating...' : 'Create Clinic'}
        </button>
      </div>
    </form>
  );
}
