import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';
import { useAdminContext } from '../../context/AdminContext.jsx';
import UpgradeNotice from '../../components/UpgradeNotice.jsx';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const { plan, loading: planLoading } = useAdminContext() || {};

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN.REVIEWS, {
        params: { page, limit: 10 },
      });

      if (res.data.data && res.data.pagination) {
        setReviews(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReviews(newPage);
    }
  };

  // while plan is loading
  if (planLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  // low plan: show upgrade message instead of reviews
  if (!plan?.enableAuditLogs) {
    return (
      <AdminLayout>
        <div className="p-6 max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Patient Reviews & Ratings
          </h1>
          <UpgradeNotice
            feature="Patient reviews & doctor ratings"
            planName={plan?.name}
          />
        </div>
      </AdminLayout>
    );
  }

  // allowed: show reviews UI
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Patient Reviews & Ratings
        </h1>

        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  No reviews yet.
                </p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-800">
                          {review.user.name}
                        </p>
                        <p className="text-sm text-blue-600">
                          reviewed Dr. {review.doctor.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-lg">
                        {'★'.repeat(review.rating)}
                        <span className="text-gray-300">
                          {'★'.repeat(5 - review.rating)}
                        </span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded border border-gray-100">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 bg-white rounded-xl border border-gray-200 p-4">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} (
                  {pagination.total} total)
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
