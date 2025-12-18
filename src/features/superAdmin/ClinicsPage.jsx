import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import ClinicCard from './ClinicCard.jsx';
import api from '../../lib/api';
import { ENDPOINTS } from '../../lib/endpoints';
import toast from 'react-hot-toast';

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const navigate = useNavigate();

  // ✅ Fetch Clinics with Search & Pagination
  const fetchClinics = async (searchQuery = '', currentPage = 1) => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.SUPER_ADMIN.CLINICS, {
        params: {
          search: searchQuery,
          page: currentPage,
          limit: 12, // Using 12 for better grid alignment
        },
      });

      if (Array.isArray(res.data)) {
        // Handle legacy API response (array)
        setClinics(res.data);
        setPagination({
          total: res.data.length,
          limit: 12,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else if (res.data?.data) {
        // Handle new API response (paginated object)
        setClinics(Array.isArray(res.data.data) ? res.data.data : []);
        setPagination(res.data.pagination || {});
      } else {
        setClinics([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to load clinics');
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchClinics(search, page);
  }, [page]);

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on search
      fetchClinics(search, 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <SuperAdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  Clinics Management
                </h1>
                <p className="text-gray-500 mt-2 text-lg ml-1">
                  Manage all your clinic locations and settings
                </p>
              </div>

              
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="px-5 py-3 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Total Clinics</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total || clinics.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative group max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
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
              <input
                type="text"
                placeholder="Search clinics by name, city, phone, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-4 rounded-xl border border-gray-200 shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-gray-700 placeholder-gray-400 bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3.5 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
            {search && (
              <p className="mt-3 text-sm text-gray-500 ml-1">
                Found <strong>{pagination.total}</strong> results for "{search}"
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && clinics.length === 0 ? (
            <div className="flex justify-center py-32">
              <Loader />
            </div>
          ) : clinics.length === 0 ? (
            /* Empty State */
            <div className="text-center py-24 px-6 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {search ? 'No clinics found' : 'No clinics yet'}
              </h3>
              <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto">
                {search
                  ? `We couldn't find any clinics matching "${search}". Try checking for typos or use different keywords.`
                  : 'Get started by creating your first clinic location to manage appointments and doctors.'}
              </p>
              {!search ? (
                <button
                  onClick={() => navigate('/super-admin/clinics/new')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Create First Clinic
                </button>
              ) : (
                <button
                  onClick={() => setSearch('')}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Clinics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {clinics.map((clinic, idx) => (
                  <div
                    key={clinic.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <ClinicCard
                      clinic={clinic}
                      onUpdate={() => fetchClinics(search, page)}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="text-sm text-gray-600 font-medium">
                    Showing <span className="text-gray-900">{Math.max(0, (page - 1) * pagination.limit + 1)}</span> – <span className="text-gray-900">{Math.min(page * pagination.limit, pagination.total)}</span> of <span className="text-gray-900">{pagination.total}</span> clinics
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                      Previous
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(pagination.totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          return pageNum;
                        }
                      ).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                            page === pageNum
                              ? 'bg-blue-600 text-white shadow-md transform scale-105'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </SuperAdminLayout>
  );
}
