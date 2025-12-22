// src/features/user/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

const ACCENT_COLOR = '#00bcd4';
const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200';
const DEFAULT_LOGO =
  'https://cdn-icons-png.flaticon.com/128/4521/4521401.png';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatClinicTimings = (timings) => {
  if (!timings) return 'Timings not available';
  if (typeof timings === 'string') return timings;
  if (Array.isArray(timings)) return timings.join(' • ');
  if (typeof timings === 'object') {
    return Object.values(timings).filter(Boolean).join(' • ');
  }
  return 'Timings not available';
};

const toFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url}`;
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function LandingPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchClinics = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.PUBLIC.CLINICS, {
        params: {
          q: q || undefined,
          _t: Date.now(), // cache‑buster
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.clinics || [];

      if (list.length > 0) {
        console.log('Fresh clinic data sample:', {
          googleRating: list[0].googleRating,
          googleTotalReviews: list[0].googleTotalReviews,
          googleRatingUrl: list[0].googleRatingUrl,
          lastGoogleSync: list[0].lastGoogleSync,
          clinicId: list[0].id,
        });
      }

      setClinics(list);
    } catch (err) {
      console.error('Clinic fetch error:', err);
      setError('Failed to load clinics. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchClinics(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  return (
    <UserLayout>
      {/* Hero + search */}
      <motion.div
        className="bg-white pt-10 pb-16 text-center relative px-4"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[100px] -z-10 opacity-30"
          style={{ backgroundColor: ACCENT_COLOR }}
        />
        <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#003366] mb-4">
          Find Your Care Center
        </motion.h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Discover clinics near you, compare ratings and book appointments in a
          few clicks.
        </p>
        <div className="mt-6 max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinics by name or city..."
            className="w-full px-4 py-3 rounded-full border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </motion.div>

      {/* Clinics grid */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-[#003366] pl-4 flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            Choose a Clinic
          </h2>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-500 py-16">
              Loading clinics...
            </div>
          ) : clinics.length === 0 ? (
            <div className="text-center text-gray-500 py-16 rounded-2xl bg-white shadow-sm border border-dashed border-gray-300">
              No clinics found. Try a different search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {clinics.map((clinic, idx) => {
                const banner = toFullUrl(clinic.banner) || DEFAULT_BANNER;

                // logo: use uploaded if present and valid, else default
                const logoSrc = toFullUrl(clinic.logo) || DEFAULT_LOGO;

                const ratingRaw = clinic.googleRating;
                const rating =
                  ratingRaw != null && ratingRaw !== ''
                    ? Number(ratingRaw)
                    : null;

                const totalReviewsRaw = clinic.googleTotalReviews;
                const totalReviews =
                  totalReviewsRaw != null && totalReviewsRaw !== ''
                    ? Number(totalReviewsRaw)
                    : null;

                const reviewUrl =
                  clinic.googleRatingUrl || clinic.googleMapsUrl || null;

                return (
                  <motion.button
                    key={clinic.id}
                    custom={idx}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    onClick={() => navigate(`/clinics/${clinic.id}`)}
                    className="relative group text-left rounded-2xl overflow-hidden border border-gray-100 shadow-lg bg-white transition-all hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#003366]/40"
                    whileHover={{ y: -4 }}
                  >
                    {/* Banner */}
                    <div className="h-32 w-full overflow-hidden relative">
                      <img
                        src={banner}
                        className="w-full h-full object-cover"
                        alt={clinic.name}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
                    </div>

                    {/* Card body */}
                    <div className="p-6 pt-10 relative">
                      {/* Logo – uploaded if ok, else default */}
                      <div className="absolute -top-10 left-6 p-1 bg-white rounded-xl shadow-lg">
                        <img
                          src={logoSrc}
                          className="w-16 h-16 object-contain rounded-lg"
                          alt={`${clinic.name} logo`}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LOGO;
                          }}
                        />
                      </div>

                      {/* Name + rating row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-xl text-gray-900">
                            {clinic.name}
                          </h3>
                          <p className="text-xs uppercase tracking-wide text-gray-400 mt-0.5">
                            {clinic.city}
                          </p>
                        </div>

                        {rating !== null &&
                          !Number.isNaN(rating) &&
                          rating > 0 && (
                            <div className="inline-flex flex-col items-end gap-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-50 border border-yellow-100 text-[11px] font-semibold text-yellow-800">
                                ⭐ {rating.toFixed(1)} / 5
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {totalReviews &&
                                !Number.isNaN(totalReviews) &&
                                totalReviews > 0
                                  ? `${totalReviews} reviews`
                                  : 'New on Google'}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Address */}
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                        {clinic.address}, {clinic.city}
                        {clinic.pincode ? ` - ${clinic.pincode}` : ''}
                      </p>

                      {/* Phone number */}
                      {clinic.phone && clinic.phone !== '0000000000' && (
                        <p className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <a
                            href={`tel:${clinic.phone}`}
                            className="font-semibold text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {clinic.phone}
                          </a>
                        </p>
                      )}

                      {/* Timings */}
                      {clinic.timings && (
                        <p className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <svg
                            className="w-3.5 h-3.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {formatClinicTimings(clinic.timings)}
                        </p>
                      )}

                      {/* Google review link */}
                      {reviewUrl && (
                        <a
                          href={reviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Write a Google review
                          <span className="text-[10px]">↗</span>
                        </a>
                      )}

                      {/* CTA row */}
                      <div className="mt-5 pt-4 border-t flex items-center justify-between text-sm">
                        <span className="text-[#003366] font-semibold flex items-center gap-2">
                          View Specialists <span>→</span>
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Tap card to see doctors
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
