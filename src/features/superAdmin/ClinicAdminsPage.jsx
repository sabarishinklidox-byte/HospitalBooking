import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../lib/api';

export default function ClinicAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/super-admin/admins');
      setAdmins(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin? This cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/super-admin/admins/${adminId}`);
      fetchAdmins(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete admin');
    }
  };

  useEffect(() => {
    fetchAdmins();
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
              Clinic Admins
            </h1>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="bg-white shadow-md rounded-xl p-4">
            <h2 className="font-semibold mb-4 text-gray-800">
              Clinic Admins List ({admins.length})
            </h2>

            {admins.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-12">
                No clinic admins yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Email</th>
                      <th className="text-left py-3 px-4 font-semibold">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold">Clinic</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {admin.name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {admin.email}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {admin.phone || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">
                            {admin.clinic?.name || 'No clinic'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => navigate(`/super-admin/admins/${admin.id}/edit`)}
                              className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center"
                              title="Edit Admin"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(admin.id)}
                              className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center"
                              title="Delete Admin"
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
