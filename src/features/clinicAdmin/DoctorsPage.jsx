// src/features/clinicAdmin/DoctorsPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

const SPECIALITIES_ENUM = [
  { label: 'Dentist', value: 'DENTIST' },
  { label: 'Cardiologist', value: 'CARDIOLOGIST' },
  { label: 'Neurologist', value: 'NEUROLOGIST' },
  { label: 'Orthopedic', value: 'ORTHOPEDIC' },
  { label: 'Gynecologist', value: 'GYNECOLOGIST' },
  { label: 'Pediatrician', value: 'PEDIATRICIAN' },
  { label: 'Dermatologist', value: 'DERMATOLOGIST' },
  { label: 'Ophthalmologist', value: 'OPHTHALMOLOGIST' },
  { label: 'General Physician', value: 'GENERAL_PHYSICIAN' },
  { label: 'Other', value: 'OTHER' },
];

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  speciality: '',
  experience: '',
  avatar: '',
  password: '',
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [avatarFile, setAvatarFile] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN.DOCTORS);
      setDoctors(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load doctors');
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
    setAvatarFile(null);
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
    setAvatarFile(null);
    setModalOpen(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', form.name);
    if (form.email) formData.append('email', form.email);
    if (form.phone) formData.append('phone', form.phone);
    formData.append('speciality', form.speciality);
    formData.append('experience', form.experience);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    } else if (editingDoctorId && form.avatar) {
      formData.append('avatar', form.avatar);
    }

    if (form.password) {
      formData.append('password', form.password);
    }

    const config = {
      headers: { 'Content-Type': 'multipart/form-data' },
    };

    const promise = editingDoctorId
      ? api.put(ENDPOINTS.ADMIN.DOCTOR_BY_ID(editingDoctorId), formData, config)
      : api.post(ENDPOINTS.ADMIN.DOCTORS, formData, config);

    await toast.promise(promise, {
      loading: editingDoctorId ? 'Updating doctor...' : 'Creating doctor...',
      success: () => {
        setModalOpen(false);
        setForm(INITIAL_FORM);
        setAvatarFile(null);
        setEditingDoctorId(null);
        fetchDoctors();
        return editingDoctorId ? 'Doctor updated!' : 'Doctor created!';
      },
      error: (err) => err.response?.data?.error || 'Failed to save doctor',
    });
  };

  const handleToggleActive = async (id, isActive) => {
    await toast.promise(api.patch(ENDPOINTS.ADMIN.DOCTOR_TOGGLE_ACTIVE(id)), {
      loading: isActive ? 'Deactivating...' : 'Activating...',
      success: () => {
        fetchDoctors();
        return isActive ? 'Doctor deactivated' : 'Doctor activated';
      },
      error: 'Failed to update doctor status',
    });
  };

  const getSpecialityLabel = (val) => {
    const found = SPECIALITIES_ENUM.find((s) => s.value === val);
    return found ? found.label : val;
  };

  const renderStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Inactive
      </span>
    );
  };

  return (
    <ClinicAdminLayout>
      <div className="w-full px-3 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2"
              style={{ color: 'var(--color-primary)' }}
            >
              <span>👨‍⚕️</span>
              <span>Doctors</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Manage your clinic’s doctors, specialties, and availability.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm text-white"
            style={{ backgroundColor: 'var(--color-action)' }}
          >
            <span className="text-lg leading-none">＋</span>
            <span>Add Doctor</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <p>
            Total doctors:{' '}
            <span className="font-semibold text-gray-900">
              {doctors.length}
            </span>
          </p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              No doctors added yet for this clinic.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <span className="text-lg leading-none">＋</span>
              <span>Add First Doctor</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Speciality
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Experience
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doctors.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-700 border border-blue-100 overflow-hidden">
                            {doc.avatar ? (
                              <img
                                src={
                                  doc.avatar.startsWith('http')
                                    ? doc.avatar
                                    : `${API_BASE_URL}${doc.avatar}`
                                }
                                alt={doc.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>
                                {doc.name
                                  ? doc.name.charAt(0).toUpperCase()
                                  : '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {doc.name}
                            </p>
                            {doc.userEmail && (
                              <p className="text-xs text-gray-400">
                                {doc.userEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {getSpecialityLabel(doc.speciality)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {doc.experience ? `${doc.experience} yrs` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {doc.phone || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {renderStatusBadge(doc.isActive)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(doc)}
                          className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleToggleActive(doc.id, doc.isActive)
                          }
                          className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-100"
                        >
                          {doc.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Name*
                </label>
                <input
                  name="name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email*
                </label>
                <input
                  name="email"
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.email}
                  onChange={handleChange}
                  required={!editingDoctorId}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Phone
                </label>
                <input
                  name="phone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Speciality*
                </label>
                <select
                  name="speciality"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.speciality}
                  onChange={handleChange}
                >
                  <option value="">-- Select Speciality --</option>
                  {SPECIALITIES_ENUM.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Experience (yrs)*
                </label>
                <input
                  name="experience"
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={form.experience}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAvatarFile(file);
                    setForm((prev) => ({ ...prev, avatar: prev.avatar || '' }));
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {form.avatar && !avatarFile && (
                  <p className="mt-1 text-xs text-gray-400 break-all">
                    Current: {form.avatar}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {editingDoctorId ? 'New Password (optional)' : 'Password*'}
              </label>
              <input
                name="password"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={form.password}
                onChange={handleChange}
                required={!editingDoctorId}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-[#0b3b5e] text-white font-semibold text-sm shadow-sm hover:bg-[#08263e] transition-colors"
              >
                {editingDoctorId ? 'Update Doctor' : 'Create Doctor'}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
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
