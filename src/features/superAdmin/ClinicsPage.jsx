// src/features/superAdmin/ClinicsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../lib/api';

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null); // Track which ID was just copied
  const navigate = useNavigate();

  const fetchClinics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/super-admin/clinics');
      setClinics(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clinicId) => {
    if (!window.confirm('Are you sure you want to delete this clinic? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/super-admin/clinics/${clinicId}`);
      fetchClinics(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete clinic');
    }
  };

  const handleCopyLink = (clinicId) => {
    const link = `${window.location.origin}/visit/${clinicId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(clinicId);
    setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  return (
    <SuperAdminLayout>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              Clinics
            </h1>
            {/* Optional: Add Clinic Button */}
            <button 
               onClick={() => navigate('/super-admin/clinics/new')}
               className="btn-primary px-4 py-2 rounded"
            >
               + Add Clinic
            </button>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </p>
          )}

          <div className="bg-white shadow-md rounded-xl p-4 border border-gray-100">
            <h2 className="font-semibold mb-4 text-gray-800 flex justify-between items-center">
              <span>Clinics List ({clinics.length})</span>
            </h2>

            {clinics.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-12 bg-gray-50 rounded-lg">
                No clinics found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">City</th>
                      <th className="text-center py-3 px-4 font-semibold">Admins</th>
                      <th className="text-center py-3 px-4 font-semibold">Doctors</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clinics.map((clinic) => (
                      <tr key={clinic.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {clinic.name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {clinic.city || '—'}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-gray-900">
                          {clinic.admins ? clinic.admins.length : 0}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">
                          {clinic.doctors ? clinic.doctors.length : 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            
                            {/* COPY LINK BUTTON */}
                            <button
                              onClick={() => handleCopyLink(clinic.id)}
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center border ${
                                copiedId === clinic.id
                                  ? 'bg-green-600 text-white border-green-600'
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                              }`}
                              title="Copy Clinic Visit Link"
                            >
                              {copiedId === clinic.id ? '✓ Copied' : '🔗 Link'}
                            </button>

                            <button
                              onClick={() => navigate(`/super-admin/clinics/${clinic.id}/edit`)}
                              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                              title="Edit Clinic"
                            >
                              Edit
                            </button>
                            
                            <button
                              onClick={() => handleDelete(clinic.id)}
                              className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                              title="Delete Clinic"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </SuperAdminLayout>
  );
}
