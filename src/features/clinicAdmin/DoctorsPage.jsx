import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  speciality: '',
  experience: '',
  avatar: '',
  password: '',
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/doctors');
      setDoctors(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openCreateModal = () => {
    setEditingDoctorId(null);
    setForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctorId(doc.id);
    setForm({
      name: doc.name || '',
      email: doc.userEmail || '',
      phone: doc.phone || '',
      speciality: doc.speciality || '',
      experience: String(doc.experience || ''),
      avatar: doc.avatar || '',
      password: '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSaving(true);

      if (editingDoctorId) {
        const payload = {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          speciality: form.speciality,
          experience: form.experience,
          avatar: form.avatar || undefined,
          password: form.password || undefined,
        };
        await api.put(`/admin/doctors/${editingDoctorId}`, payload);
      } else {
        await api.post('/admin/doctors', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          speciality: form.speciality,
          experience: form.experience,
          avatar: form.avatar || undefined,
          password: form.password,
        });
      }

      setModalOpen(false);
      setForm(INITIAL_FORM);
      setEditingDoctorId(null);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save doctor');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/admin/doctors/${id}/toggle`);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update doctor status');
    }
  };

  return (
    <ClinicAdminLayout>
      <div className="w-full px-3 sm:px-6">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight text-center sm:text-left"
          style={{ color: 'var(--color-primary)' }}
        >
          Doctors
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center sm:text-left">
            {error}
          </p>
        )}

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Total doctors: <span className="font-semibold">{doctors.length}</span>
          </p>
          <button
            onClick={openCreateModal}
            className="btn-primary px-4 py-2 text-sm rounded-lg"
            style={{ backgroundColor: 'var(--color-action)' }}
          >
            + Add Doctor
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-sm text-gray-500 mb-4">No doctors added yet.</p>
            <button
              onClick={openCreateModal}
              className="btn-primary px-6 py-2.5 rounded-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              + Add First Doctor
            </button>
          </div>
        ) : (
          <>
            {/* FULLY RESPONSIVE SECTION STARTS HERE */}
            <div className="bg-white rounded-xl shadow">

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Speciality</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Experience</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{doc.name}</div>
                          <div className="text-xs text-gray-500">{doc.slug ? `@${doc.slug}` : ''}</div>
                        </td>
                        <td className="px-4 py-3">{doc.speciality || '-'}</td>
                        <td className="px-4 py-3">{doc.experience ? `${doc.experience} yrs` : '-'}</td>
                        <td className="px-4 py-3">{doc.phone || '-'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              doc.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {doc.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(doc)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(doc.id)}
                            className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded"
                          >
                            {doc.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-3 space-y-3">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="border p-4 rounded-xl bg-gray-50 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900 text-base">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.speciality || '---'}</p>
                      </div>

                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          doc.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-gray-700 space-y-1">
                      <p><strong>Experience:</strong> {doc.experience} yrs</p>
                      <p><strong>Phone:</strong> {doc.phone || '-'}</p>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => openEditModal(doc)}
                        className="flex-1 text-sm py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(doc.id)}
                        className="flex-1 text-sm py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                      >
                        {doc.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            {/* END RESPONSIVE SECTION */}
          </>
        )}

        {/* Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingDoctorId ? 'Edit Doctor' : 'Add Doctor'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name*</label>
                <input name="name" className="input w-full" value={form.name} onChange={handleChange} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email* {editingDoctorId ? '(optional)' : ''}
                </label>
                <input
                  name="email"
                  type="email"
                  className="input w-full"
                  value={form.email}
                  onChange={handleChange}
                  required={!editingDoctorId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <input name="phone" className="input w-full" value={form.phone} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Speciality*</label>
                <input name="speciality" className="input w-full" value={form.speciality} onChange={handleChange} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Experience (years)*</label>
                <input
                  name="experience"
                  type="number"
                  min="0"
                  className="input w-full"
                  value={form.experience}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Avatar URL</label>
                <input name="avatar" className="input w-full" value={form.avatar} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {editingDoctorId ? 'New Password (optional)' : 'Password*'}
              </label>
              <input
                name="password"
                type="password"
                className="input w-full"
                value={form.password}
                onChange={handleChange}
                required={!editingDoctorId}
                placeholder={editingDoctorId ? 'Leave blank to keep existing password' : ''}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 py-2.5 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {saving ? 'Saving...' : editingDoctorId ? 'Update Doctor' : 'Create Doctor'}
              </button>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="flex-1 py-2.5 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </ClinicAdminLayout>
  );
}
