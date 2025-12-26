import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  specialityId: '', // Changed from 'speciality' to 'specialityId'
  experience: '',
  avatar: '',
  password: '',
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ✅ FIXED URL BUILDER
 */
const buildAvatarUrl = (raw) => {
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${origin}${path}`;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [specialities, setSpecialities] = useState([]); // ✅ New State for Specialities
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [avatarFile, setAvatarFile] = useState(null);

  // 1. Fetch Doctors AND Specialities
  const fetchData = async () => {
    try {
      setLoading(true);
      const [docRes, specRes] = await Promise.all([
        api.get(ENDPOINTS.ADMIN.DOCTORS),
        api.get(ENDPOINTS.ADMIN.SPECIALITIES) // ✅ Fetch Dynamic List
      ]);

      const docList = Array.isArray(docRes.data) ? docRes.data : docRes.data.doctors || [];
      setDoctors(docList);
      
      // Filter only active specialities for the dropdown
      const activeSpecs = Array.isArray(specRes.data) ? specRes.data.filter(s => s.isActive) : [];
      setSpecialities(activeSpecs);

    } catch (err) {
      console.error('fetchData error', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      // Check if your doctor object returns speciality object or ID
      specialityId: doc.speciality?.id || doc.specialityId || '', 
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
    
    // ✅ Send 'specialityId' to backend
    formData.append('specialityId', form.specialityId); 
    
    formData.append('experience', form.experience);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
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
        fetchData(); // Refresh list
        return editingDoctorId ? 'Doctor updated!' : 'Doctor created!';
      },
      error: (err) => err.response?.data?.error || 'Failed to save doctor',
    });
  };

  const handleToggleActive = async (id, isActive) => {
    await toast.promise(api.patch(ENDPOINTS.ADMIN.DOCTOR_TOGGLE_ACTIVE(id)), {
      loading: isActive ? 'Deactivating...' : 'Activating...',
      success: () => {
        fetchData();
        return isActive ? 'Doctor deactivated' : 'Doctor activated';
      },
      error: 'Failed to update doctor status',
    });
  };

  // ✅ Helper to show speciality Name from ID
  const getSpecialityLabel = (doc) => {
    if (doc.speciality && doc.speciality.name) return doc.speciality.name; // If populated object
    const found = specialities.find(s => s.id === doc.specialityId);
    return found ? found.name : 'Unknown';
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
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm text-white transition-opacity hover:opacity-90"
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
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Speciality</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Experience</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-700 border border-blue-100 overflow-hidden">
                            {doc.avatar ? (
                              <img
                                src={buildAvatarUrl(doc.avatar)}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null; 
                                  e.currentTarget.parentElement.innerHTML = `<span>${doc.name.charAt(0).toUpperCase()}</span>`;
                                }}
                              />
                            ) : (
                              <span>{doc.name ? doc.name.charAt(0).toUpperCase() : '?'}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{doc.name}</p>
                            {doc.userEmail && <p className="text-xs text-gray-400">{doc.userEmail}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                         {/* ✅ Show Dynamic Label */}
                         {getSpecialityLabel(doc)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{doc.experience ? `${doc.experience} yrs` : '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{doc.phone || '—'}</td>
                      <td className="px-4 py-3">{renderStatusBadge(doc.isActive)}</td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        <button
                          onClick={() => openEditModal(doc)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(doc.id, doc.isActive)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-100"
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

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingDoctorId ? 'Edit Doctor' : 'Add Doctor'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name*</label>
                <input
                  name="name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email*</label>
                <input
                  name="email"
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.email}
                  onChange={handleChange}
                  required={!editingDoctorId}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <input
                  name="phone"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Speciality*</label>
                <select
                  name="specialityId" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.specialityId}
                  onChange={handleChange}
                >
                  <option value="">-- Select Speciality --</option>
                  {/* ✅ Map Dynamic Specialities */}
                  {specialities.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                   Missing one? <a href="/admin/specialities" className="text-blue-600 underline">Add it here</a>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Experience (yrs)*</label>
                <input
                  name="experience"
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.experience}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Avatar Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {editingDoctorId ? 'New Password (optional)' : 'Password*'}
              </label>
              <input
                name="password"
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
