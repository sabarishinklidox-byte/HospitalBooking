import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

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
  const [error, setError] = useState('');
  const [clinics, setClinics] = useState([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoadingClinics(true);
        const res = await api.get('/super-admin/clinics');
        setClinics(res.data || []);
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to load clinics';
        setError(msg);
        if (onError) onError(msg);
      } finally {
        setLoadingClinics(false);
      }
    };
    fetchClinics();
  }, [onError]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.name || !form.password || form.password.length < 6) {
      const msg = 'Email, name, and password (min 6 chars) are required.';
      setError(msg);
      if (onError) onError(msg);
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/super-admin/admins', form);
      setForm(INITIAL_FORM);
      if (onCreated) onCreated(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to create admin.';
      setError(msg);
      if (onError) onError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
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

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
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

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
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

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Clinic (optional)
          </label>
          {loadingClinics ? (
            <p className="text-xs text-gray-500">Loading clinics...</p>
          ) : (
            <select
              name="clinicId"
              className="input w-full"
              value={form.clinicId}
              onChange={handleChange}
            >
              <option value="">Not assigned yet</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name} ({clinic.city || 'No city'})
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Select clinic by name, no need to copy/paste long IDs.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-600">
            Password* (min 6 chars)
          </label>
          <input
            name="password"
            type="password"
            className="input w-full"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Temporary admin password"
          />
        </div>
      </div>

      <div className="mt-6 sm:mt-8 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-action)' }}
        >
          {saving ? 'Creating...' : 'Create Admin'}
        </button>
      </div>
    </form>
  );
}
