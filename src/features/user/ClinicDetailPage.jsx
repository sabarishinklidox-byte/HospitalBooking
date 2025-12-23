// src/features/user/ClinicDetailPage.jsx - FIXED IMAGE URLS
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

const PRIMARY_COLOR = '#0056b3';
const ACCENT_COLOR = '#00bcd4';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ✅ FIXED: Removes /api from uploads path
 * /uploads/abc.jpg → http://localhost:5000/uploads/abc.jpg (NOT /api/uploads)
 */
const toFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  
  // Remove /api from base URL for static files
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

export default function ClinicDetailPage() {
  const { clinicId } = useParams();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoBroken, setLogoBroken] = useState(false);
  const [brokenAvatars, setBrokenAvatars] = useState({});

  useEffect(() => {
    const fetchClinicAndDoctors = async () => {
      setLoading(true);
      try {
        const [clinicRes, doctorRes] = await Promise.all([
          api.get(ENDPOINTS.PUBLIC.CLINIC_BY_ID(clinicId)),
          api.get(
            ENDPOINTS.PUBLIC.CLINIC_DOCTORS
              ? ENDPOINTS.PUBLIC.CLINIC_DOCTORS(clinicId)
              : `/public/clinics/${clinicId}/doctors`
          ),
        ]);

        setClinic(clinicRes.data);
        const list = Array.isArray(doctorRes.data)
          ? doctorRes.data
          : doctorRes.data?.doctors || [];
        setDoctors(list);
      } catch (err) {
        console.error('Fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicAndDoctors();
  }, [clinicId]);

  if (loading) {
    return (
      <UserLayout>
        <div className="py-20 flex justify-center">
          <Loader />
        </div>
      </UserLayout>
    );
  }

  if (!clinic) {
    return (
      <UserLayout>
        <div className="py-20 flex flex-col items-center text-gray-500">
          <p className="text-xl font-semibold mb-4">Clinic not found.</p>
          <Link
            to="/"
            className="text-blue-600 font-bold hover:underline underline-offset-2"
          >
            Go to clinics list
          </Link>
        </div>
      </UserLayout>
    );
  }

  const logo = !logoBroken ? toFullUrl(clinic.logo) : null;
  const ratingRaw = clinic.googleRating;
  const rating = ratingRaw != null && ratingRaw !== '' ? Number(ratingRaw) : null;
  const totalReviewsRaw = clinic.googleTotalReviews;
  const totalReviews = totalReviewsRaw != null && totalReviewsRaw !== ''
    ? Number(totalReviewsRaw)
    : null;

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Clinic header card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-7 flex flex-col md:flex-row md:items-center gap-6">
          {/* Logo - FIXED */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {logo ? (
                <img
                  src={logo}
                  alt={clinic.name}
                  className="w-full h-full object-contain"
                  onError={() => setLogoBroken(true)}
                />
              ) : (
                <span className="text-3xl md:text-4xl">🏥</span>
              )}
            </div>
          </div>

          {/* Text info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-400">Clinic</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              {clinic.name}
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              {clinic.address}, {clinic.city}
              {clinic.pincode ? ` - ${clinic.pincode}` : ''}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {clinic.phone && clinic.phone !== '0000000000' && (
                <a
                  href={`tel:${clinic.phone}`}
                  className="inline-flex items-center gap-1 text-blue-600 font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {clinic.phone}
                </a>
              )}

              {clinic.timings && (
                <span className="inline-flex items-center gap-1 text-gray-500 text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {clinic.timings}
                </span>
              )}

              {rating !== null && !Number.isNaN(rating) && rating > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-800">
                  ⭐ {rating.toFixed(1)} / 5
                  {totalReviews && !Number.isNaN(totalReviews) && totalReviews > 0 && (
                    <span className="text-[10px] text-gray-500">({totalReviews} reviews)</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">
              Specialists at this clinic
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose a doctor and book your appointment in a few seconds.
            </p>
          </div>
        </div>

        {/* Doctors grid - FIXED IMAGES */}
        {doctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
            <span className="text-5xl block mb-4">🩺</span>
            <p className="text-lg text-gray-600 font-semibold">
              No doctors available at this location yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {doctors.map((doctor, index) => {
              // ✅ FIXED: Use corrected toFullUrl + error handling
              const avatar = doctor.avatar && !brokenAvatars[doctor.id] 
                ? toFullUrl(doctor.avatar) 
                : null;
              const ratingValue = typeof doctor.rating === 'number' ? doctor.rating : null;

              return (
                <motion.div
                  key={doctor.id}
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.25 }}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center"
                >
                  {/* Avatar - FIXED */}
                  <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow">
                    {avatar ? (
                      <img
                        src={avatar}
                        className="w-full h-full object-cover"
                        alt={doctor.name}
                        onError={(e) => {
                          setBrokenAvatars((prev) => ({ ...prev, [doctor.id]: true }));
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-3xl font-extrabold text-[#003366] uppercase">
                        {doctor.name?.charAt(0) || 'D'}
                      </span>
                    )}
                  </div>

                  {/* Name + speciality */}
                  <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                    Dr. {doctor.name}
                  </h3>
                  <p
                    className="text-xs text-white font-semibold px-3 py-1 rounded-full mb-3 shadow-sm"
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    {getSpecialityLabel(doctor.speciality)}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between w-full text-xs text-gray-500 mb-4">
                    <div className="flex-1">
                      <p className="uppercase font-semibold">Experience</p>
                      <p className="text-sm font-extrabold text-[#003366]">
                        {doctor.experience || 1}+ years
                      </p>
                    </div>
                    <div className="w-px h-10 bg-gray-200 mx-2" />
                    <div className="flex-1">
                      <p className="uppercase font-semibold">Rating</p>
                      <div className="flex items-center justify-center gap-1 text-yellow-500 font-extrabold text-sm">
                        <span>★</span>
                        <span>{ratingValue ? ratingValue.toFixed(1) : 'New'}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/doctors/${doctor.id}/book`}
                    className="w-full py-2.5 text-white rounded-xl font-bold text-sm text-center shadow-md hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    Book appointment
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}

// Speciality labels
function getSpecialityLabel(speciality) {
  const labels = {
    DENTIST: 'Dentist',
    CARDIOLOGIST: 'Cardiologist',
    NEUROLOGIST: 'Neurologist',
    ORTHOPEDIC: 'Orthopedic',
    GYNECOLOGIST: 'Gynecologist',
    PEDIATRICIAN: 'Pediatrician',
    DERMATOLOGIST: 'Dermatologist',
    OPHTHALMOLOGIST: 'Ophthalmologist',
    GENERAL_PHYSICIAN: 'General Physician',
    OTHER: 'Specialist',
  };
  return labels[speciality] || speciality || 'Specialist';
}
