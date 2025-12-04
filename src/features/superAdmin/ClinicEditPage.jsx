import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';

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

export default function ClinicEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

 const fetchClinic = async () => {
  try {
    setLoading(true);
    const res = await api.get(`/super-admin/clinics/${id}`);
    const clinic = res.data;
    if (!clinic) {
      setError('Clinic not found');
      setLoading(false);
      return;
    }
    setForm({
      name: clinic.name || '',
      address: clinic.address || '',
      city: clinic.city || '',
      pincode: clinic.pincode || '',
      accountNumber: clinic.accountNumber || '',
      ifscCode: clinic.ifscCode || '',
      bankName: clinic.bankName || '',
      timings: clinic.timings || '',
      details: clinic.details || '',
    });
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to load clinic');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchClinic();
}, [id]);

const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSaving(true);

  if (!form.name || !form.address || !form.city || !form.pincode) {
    setError('Name, address, city, and pincode are required');
    setSaving(false);
    return;
  }

  try {
    await api.patch(`/super-admin/clinics/${id}`, form);
    navigate('/super-admin/clinics'); // back to clinics list
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to update clinic');
    setSaving(false);
  }
};

  if (loading) return (
    <SuperAdminLayout>
      <Loader />
    </SuperAdminLayout>
  );

  return (
    <SuperAdminLayout>
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
        Edit Clinic
      </h1>

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Clinic Name*</label>
            <input name="name" className="input" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">City*</label>
            <input name="city" className="input" value={form.city} onChange={handleChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Address*</label>
            <input name="address" className="input" value={form.address} onChange={handleChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Pincode*</label>
            <input name="pincode" className="input" value={form.pincode} onChange={handleChange} required />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Account Number</label>
            <input name="accountNumber" className="input" value={form.accountNumber} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">IFSC Code</label>
            <input name="ifscCode" className="input" value={form.ifscCode} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Bank Name</label>
            <input name="bankName" className="input" value={form.bankName} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Timings</label>
            <input name="timings" className="input" value={form.timings} onChange={handleChange} placeholder="Mon–Fri 9AM–6PM" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">Details</label>
            <textarea name="details" className="input" rows={3} value={form.details} onChange={handleChange} placeholder="Brief description" />
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" disabled={saving} className="btn-primary w-full py-3 font-semibold">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </SuperAdminLayout>
  );
}
