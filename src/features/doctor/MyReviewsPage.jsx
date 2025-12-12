import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

export default function MyReviewsPage() {
  const [data, setData] = useState({ average: 0, total: 0, reviews: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(ENDPOINTS.DOCTOR.REVIEWS);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load reviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <DoctorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Reviews</h1>
        <p className="text-gray-600 mb-6">See what your patients are saying about you.</p>

        {loading ? <Loader /> : (
          <>
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl shadow-sm border border-yellow-100 mb-6">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-yellow-600">{data.average}</p>
                  <p className="text-yellow-500 text-2xl">★★★★★</p>
                </div>
                <div className="text-left">
                  <p className="text-gray-700 font-semibold">Average Rating</p>
                  <p className="text-sm text-gray-500">{data.total} Total Reviews</p>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {data.reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No reviews yet. Keep up the great work!</p>
              ) : (
                data.reviews.map(review => (
                  <div key={review.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-800">{review.user.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 text-xl">
                        {"★".repeat(review.rating)}
                        <span className="text-gray-300">{"★".repeat(5 - review.rating)}</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </DoctorLayout>
  );
}
