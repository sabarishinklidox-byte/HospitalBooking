import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import Loader from '../../components/Loader.jsx';

export default function DoctorProfilePage() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor/profile');
      setDoctor(res.data);
      setForm((prev) => ({
        ...prev,
        phone: res.data.phone || '',
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        phone: form.phone,
      };
      if (form.password) payload.password = form.password;

      await api.patch('/doctor/profile', payload);
      
      setSuccess('Profile updated successfully');
      setForm((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      fetchProfile(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DoctorLayout>
      <div className="flex justify-center py-20"><Loader /></div>
    </DoctorLayout>
  );

  return (
    <DoctorLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#0b3b5e]">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header / Read-only info */}
          <div className="bg-gradient-to-r from-[#0b3b5e] to-[#062739] p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-bold">
                {doctor?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{doctor?.name}</h2>
                <p className="opacity-90">{doctor?.speciality}</p>
                <p className="text-sm opacity-75 mt-1">{doctor?.email}</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Leave empty to keep current"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-8 py-3 rounded-xl disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DoctorLayout>
  );
}
