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
  const [search, setSearch] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const navigate = useNavigate();

  const fetchAdmins = async (page = 1, searchQuery = '') => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.SUPER_ADMIN.ADMINS, {
        params: { page, limit: 9, search: searchQuery },
      });

      if (Array.isArray(res.data)) {
        setAdmins(res.data);
        setPagination({ page, totalPages: 1, total: res.data.length });
      } else {
        setAdmins(res.data.data || []);
        setPagination(res.data.pagination || { page, totalPages: 1, total: 0 });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this admin?')) return;

    try {
      await api.delete(ENDPOINTS.SUPER_ADMIN.ADMIN_BY_ID(adminId));
      toast.success('Admin deleted successfully');
      fetchAdmins(pagination.page, search);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete admin');
    }
  };

  useEffect(() => {
    fetchAdmins(1, '');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdmins(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAdmins(newPage, search);
    }
  };

  return (
    <SuperAdminLayout>
      {openCreateModal && (
        <Modal onClose={() => setOpenCreateModal(false)} title="Create New Admin">
          <CreateClinicAdminForm
            onCreated={() => {
              fetchAdmins(1, search);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clinic Admins</h1>
              <p className="text-gray-500 mt-1">Total Admins: {pagination.total}</p>
            </div>

            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Create Admin
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by admin name, email, phone, or clinic name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-400"
              />
              <svg
                className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {search && (
              <p className="mt-2 text-sm text-gray-600">
                Search results for: <strong>"{search}"</strong>
              </p>
            )}
          </div>

          {/* EMPTY STATE */}
          {admins.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {search ? 'No admins found' : 'No Admins Found'}
              </h3>
              <p className="text-gray-500 mt-1">
                {search ? 'Try adjusting your search terms' : 'Create your first admin to get started'}
              </p>
              {!search && (
                <button
                  onClick={() => setOpenCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Create your first admin
                </button>
              )}
            </div>
          ) : (
            <>
              {/* GRID CARD LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-5 border-b border-gray-50 flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 leading-tight truncate">{admin.name}</h3>
                          <p className="text-xs text-gray-500 font-medium">Administrator</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide whitespace-nowrap">
                        {admin.clinic?.name || 'Unassigned'}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="truncate font-mono text-xs">{admin.email}</span>
                      </div>

                      {admin.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <a
                            href={`tel:${admin.phone}`}
                            className="hover:text-blue-600 hover:underline font-mono text-xs"
                          >
                            {admin.phone}
                          </a>
                        </div>
                      )}

                      {admin.clinic && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-100">
                          <span className="text-xs font-medium truncate">{admin.clinic.name}</span>
                        </div>
                      )}
                    </div>

                    {/* ✅ ACTIONS ALWAYS VISIBLE */}
                    <div className="bg-gray-50 px-5 py-3 flex gap-2 border-t border-gray-100">
                      <button
                        onClick={() => navigate(`/super-admin/admins/${admin.id}/edit`)}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 border-t pt-6">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next →
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
