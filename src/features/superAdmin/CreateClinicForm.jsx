import React, { useState } from 'react';
import api from '../../lib/api';

const INITIAL_FORM = {
  name: '',
  address: '',
  city: '',
  pincode: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
  timings: '',
  details: '',
};

export default function CreateClinicForm({ onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.address || !form.city || !form.pincode) {
      setError('Name, address, city, and pincode are required.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/super-admin/clinics', form);
      setForm(INITIAL_FORM);
      if (onCreated) onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create clinic');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 max-w-3xl mx-auto"
    >

      {/* HEADER */}
      <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left text-[#003366]">
        Create Clinic
      </h2>

      {/* ERROR */}
      {error && (
        <p className="mb-4 text-sm text-red-600 font-medium bg-red-50 p-2 rounded-md border border-red-200">
          {error}
        </p>
      )}

      {/* FORM GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Clinic Name */}
        <div className="col-span-1 sm:col-span-2">
          <label className="input-label">Clinic Name*</label>
          <input name="name" className="input" value={form.name} onChange={handleChange} />
        </div>

        {/* City */}
        <div>
          <label className="input-label">City*</label>
          <input name="city" className="input" value={form.city} onChange={handleChange} />
        </div>

        {/* Pincode */}
        <div>
          <label className="input-label">Pincode*</label>
          <input name="pincode" className="input" value={form.pincode} onChange={handleChange} />
        </div>

        {/* Address */}
        <div className="col-span-1 sm:col-span-2">
          <label className="input-label">Address*</label>
          <input name="address" className="input" value={form.address} onChange={handleChange} />
        </div>

        {/* Account Number */}
        <div>
          <label className="input-label">Account Number</label>
          <input name="accountNumber" className="input" value={form.accountNumber} onChange={handleChange} />
        </div>

        {/* IFSC */}
        <div>
          <label className="input-label">IFSC Code</label>
          <input name="ifscCode" className="input" value={form.ifscCode} onChange={handleChange} />
        </div>

        {/* Bank Name */}
        <div>
          <label className="input-label">Bank Name</label>
          <input name="bankName" className="input" value={form.bankName} onChange={handleChange} />
        </div>

        {/* Timings */}
        <div>
          <label className="input-label">Timings</label>
          <input
            name="timings"
            className="input"
            placeholder="Mon–Fri 9AM–6PM"
            value={form.timings}
            onChange={handleChange}
          />
        </div>

        {/* Details */}
        <div className="col-span-1 sm:col-span-2">
          <label className="input-label">Details</label>
          <textarea
            name="details"
            rows={3}
            className="input"
            value={form.details}
            onChange={handleChange}
            placeholder="A brief description of the clinic."
          />
        </div>
      </div>

      {/* BUTTON */}
      <button
        type="submit"
        disabled={saving}
        className="mt-8 w-full bg-[#003366] text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-[#002552] disabled:opacity-50 transition-all"
      >
        {saving ? 'Saving...' : 'Create Clinic'}
      </button>
    </form>
  );
}
