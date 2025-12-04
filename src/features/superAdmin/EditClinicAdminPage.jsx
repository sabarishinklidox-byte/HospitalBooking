import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../lib/api';

const INITIAL_FORM = {
  email: '',
  name: '',
  phone: '',
  clinicId: '',
  password: '',
};

export default function EditClinicAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/super-admin/admins`);
      const admin = res.data.find(a => a.id === id);
      if (!admin) {
        setError('Admin not found');
        setLoading(false);
        return;
      }
      setForm({
        email: admin.email || '',
        name: admin.name || '',
        phone: admin.phone || '',
        clinicId: admin.clinic?.id || '',
        password: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!form.email || !form.name) {
      setError('Email and name are required');
      setSaving(false);
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setSaving(false);
      return;
    }

    try {
      await api.patch(`/super-admin/admins/${id}`, form);
      navigate('/super-admin/admins');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update admin');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this clinic admin? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/super-admin/admins/${id}`);
      navigate('/super-admin/admins');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete admin');
    }
  };

  if (loading) return (
  <SuperAdminLayout>
    <div className="overflow-x-hidden w-full">
      <Loader />
    </div>
  </SuperAdminLayout>
);

return (
  <SuperAdminLayout>
    <div className="overflow-x-hidden w-full">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: 'var(--color-primary)' }}
      >
        Edit Clinic Admin
      </h1>

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg max-w-4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Email*</label>
            <input
              name="email"
              type="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Full Name*</label>
            <input
              name="name"
              className="input"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              name="phone"
              className="input"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Clinic ID</label>
            <input
              name="clinicId"
              className="input"
              value={form.clinicId}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">
              New Password (optional)
            </label>
            <input
              name="password"
              type="password"
              className="input"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>
        </div>

        <div className="mt-6 flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-6 font-semibold"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="py-3 px-6 text-red-600 border border-red-600 rounded hover:bg-red-100 font-semibold"
          >
            Delete Admin
          </button>
        </div>
      </form>
    </div>
  </SuperAdminLayout>
);
}