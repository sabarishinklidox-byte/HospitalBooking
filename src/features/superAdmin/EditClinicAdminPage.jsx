import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

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
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [adminRes, clinicsRes] = await Promise.all([
          api.get(ENDPOINTS.SUPER_ADMIN.ADMIN_BY_ID(id)),
          api.get(ENDPOINTS.SUPER_ADMIN.CLINICS),
        ]);

        const admin = adminRes.data;
        setForm({
          email: admin.email || '',
          name: admin.name || '',
          phone: admin.phone || '',
          clinicId: admin.clinicId || '',
          password: '', // Password intentionally blank on load
        });
        setClinics(clinicsRes.data);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || 'Failed to load data');
        navigate('/super-admin/admins'); // Redirect if not found
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  // ✅ MISSING HANDLER ADDED HERE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!form.email || !form.name || !form.clinicId) {
      toast.error('Email, Name, and Clinic are required');
      setSaving(false);
      return;
    }
    if (form.password && form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setSaving(false);
      return;
    }

    try {
      // Create payload without password if it's empty (to avoid overwriting)
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      await api.patch(ENDPOINTS.SUPER_ADMIN.ADMIN_BY_ID(id), payload);

      toast.success('Admin updated successfully!');
      navigate('/super-admin/admins');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update admin');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this clinic admin?'))
      return;

    try {
      await api.delete(ENDPOINTS.SUPER_ADMIN.ADMIN_BY_ID(id));
      toast.success('Admin deleted successfully');
      navigate('/super-admin/admins');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete admin');
    }
  };

  if (loading)
    return (
      <SuperAdminLayout>
        <div className="w-full flex justify-center py-20">
          <Loader />
        </div>
      </SuperAdminLayout>
    );

  return (
    <SuperAdminLayout>
      <div className="overflow-x-hidden w-full max-w-4xl mx-auto">
        <h1
          className="text-3xl font-bold mb-6"
          style={{ color: 'var(--color-primary)' }}
        >
          Edit Clinic Admin
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                className="input w-full border p-2 rounded"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Full Name *
              </label>
              <input
                name="name"
                className="input w-full border p-2 rounded"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Phone Number
              </label>
              <input
                name="phone"
                className="input w-full border p-2 rounded"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Assigned Clinic *
              </label>
              <select
                name="clinicId"
                className="input w-full border p-2 rounded bg-gray-50"
                value={form.clinicId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Clinic --</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-gray-700">
                Change Password (Optional)
              </label>
              <input
                name="password"
                type="password"
                className="input w-full border p-2 rounded"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 font-medium px-4 py-2 hover:bg-red-50 rounded transition-colors"
            >
              Delete Admin Account
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#0b3b5e] text-white py-3 px-8 rounded-lg font-bold hover:bg-[#092c46] transition-all disabled:opacity-70 shadow-md"
            >
              {saving ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
}
