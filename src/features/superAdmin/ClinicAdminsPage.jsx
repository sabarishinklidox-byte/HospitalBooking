import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import CreateClinicAdminForm from './CreateClinicAdminForm.jsx';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

export default function ClinicAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch with Page Number
  const fetchAdmins = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.SUPER_ADMIN.ADMINS, {
        params: { page, limit: 9 }, // 9 cards per page looks good in grid
      });

      // Support both old API (array) and new API (object with data)
      if (Array.isArray(res.data)) {
        setAdmins(res.data);
      } else {
        setAdmins(res.data.data || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this admin?'))
      return;

    try {
      // ✅ FIX: Use ADMIN_BY_ID instead of ADMIN
      await api.delete(ENDPOINTS.SUPER_ADMIN.ADMIN_BY_ID(adminId));
      toast.success('Admin deleted successfully');
      fetchAdmins(pagination.page); // Refresh current page
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete admin');
    }
  };

  useEffect(() => {
    fetchAdmins(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAdmins(newPage);
    }
  };

  return (
    <SuperAdminLayout>
      {/* MODAL */}
      {openCreateModal && (
        <Modal
          onClose={() => setOpenCreateModal(false)}
          title="Create New Admin"
        >
          <CreateClinicAdminForm
            onCreated={() => {
              fetchAdmins(1); // Go back to first page on new create
              setOpenCreateModal(false);
              toast.success('Admin created successfully!');
            }}
            onError={(msg) => toast.error(msg)}
          />
        </Modal>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Clinic Admins
              </h1>
              <p className="text-gray-500 mt-1">
                Total Admins: {pagination.total}
              </p>
            </div>
          </div>

          {/* EMPTY STATE */}
          {admins.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                No Admins Found
              </h3>
              <button
                onClick={() => setOpenCreateModal(true)}
                className="text-blue-600 font-semibold hover:underline mt-2"
              >
                Create your first admin
              </button>
            </div>
          ) : (
            <>
              {/* GRID CARD LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
                  >
                    <div className="p-5 border-b border-gray-50 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 leading-tight">
                            {admin.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium">
                            Administrator
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                        {admin.clinic?.name || 'Unassigned'}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="truncate font-mono">
                          {admin.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{admin.phone || 'No phone number'}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-5 py-3 flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          navigate(`/super-admin/admins/${admin.id}/edit`)
                        }
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-1.5 rounded text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="flex-1 bg-white border border-red-100 text-red-600 py-1.5 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ PAGINATION CONTROLS */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 border-t pt-6">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </SuperAdminLayout>
  );
}
