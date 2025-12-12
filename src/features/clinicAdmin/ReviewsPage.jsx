import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchReviews = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN.REVIEWS);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };
  fetchReviews();
}, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Patient Reviews & Ratings</h1>

        {loading ? <Loader /> : (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No reviews yet.</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{review.user.name}</p>
                      <p className="text-sm text-blue-600">reviewed Dr. {review.doctor.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 text-lg">
                      {"★".repeat(review.rating)}
                      <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
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
        )}
      </div>
    </AdminLayout>
  );
}
