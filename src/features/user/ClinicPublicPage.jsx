// src/pages/user/ClinicPublicPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

// Fallback to empty string if undefined to prevent crash
const ENV_API_URL = import.meta.env.VITE_API_BASE_URL;

const toFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const baseUrl = ENV_API_URL || 'http://localhost:5003';
  const origin = baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200';
const DEFAULT_LOGO =
  'https://cdn-icons-png.flaticon.com/128/4521/4521401.png';

const formatClinicTimings = (timings) => {
  if (!timings) return 'Timings not available';
  if (typeof timings === 'string') return timings;
  if (typeof timings === 'object' && timings.description)
    return timings.description;
  return 'Check Timings';
};

const formatDescription = (details) => {
  if (!details) return null;
  if (typeof details === 'string') return details;
  if (typeof details === 'object') {
    return details.text || details.bio || details.description || null;
  }
  return null;
};

const ExpandableText = ({ text, limit = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;
  if (text.length <= limit) {
    return (
      <p className="text-sm md:text-base text-slate-600 leading-relaxed text-left">
        {text}
      </p>
    );
  }

  return (
    <div className="text-sm md:text-base text-slate-600 leading-relaxed text-left">
      <p className="inline">
        {isExpanded ? text : `${text.substring(0, limit)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-blue-600 font-semibold hover:underline text-xs uppercase tracking-wide focus:outline-none"
      >
        {isExpanded ? 'Show Less' : 'Read More'}
      </button>
    </div>
  );
};

export default function ClinicPublicPage() {
  const { clinicId } = useParams();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clinicId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const clinicRes = await api.get(
          ENDPOINTS.PUBLIC.CLINIC_BY_ID(clinicId)
        );
        setClinic(clinicRes.data);

        const docRes = await api.get(
          ENDPOINTS.PUBLIC.CLINIC_DOCTORS(clinicId)
        );
        setDoctors(docRes.data);
      } catch (err) {
        setError('Clinic not found. Please check the link.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clinicId]);

  if (loading)
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      </UserLayout>
    );

  if (error)
    return (
      <UserLayout>
        <div className="p-20 text-center text-red-500 bg-red-50 border border-red-100 m-10 rounded-xl">
          {error}
        </div>
      </UserLayout>
    );

  if (!clinic) return null;

  const bannerSrc = toFullUrl(clinic.banner) || DEFAULT_BANNER;
  const logoSrc = toFullUrl(clinic.logo) || DEFAULT_LOGO;
  const description = formatDescription(clinic.details);

  const stylePrimaryText = { color: 'var(--color-primary)' };
  const stylePrimaryBg = { backgroundColor: 'var(--color-primary)' };
  const styleSecondaryText = { color: 'var(--color-secondary)' };

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* --- Header Section (Banner + Info) --- */}
        <div className="relative w-full mb-12">
          {/* Banner Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl h-64 sm:h-80 w-full z-0">
            <img
              src={bannerSrc}
              alt="Clinic banner"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_BANNER;
              }}
            />
            <div className="absolute inset-0 bg-gray-900/40" />
          </div>

          {/* Floating Card Container */}
          <div className="relative -mt-16 px-2 sm:px-6 z-10 flex justify-center">
            <div className="w-full max-w-6xl bg-white p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
              {/* Logo */}
              <div className="shrink-0 mx-auto md:mx-0 relative">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex items-center justify-center -mt-16 md:-mt-20">
                  <img
                    src={logoSrc}
                    alt="Clinic logo"
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_LOGO;
                    }}
                  />
                </div>
              </div>

              {/* Details Column */}
              <div className="flex-1 min-w-0 w-full text-center md:text-left pt-2 md:pt-1">
                {/* Title & Ratings */}
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 md:gap-5 mb-3 justify-center md:justify-start">
                  <h1
                    className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight max-w-full text-center md:text-left break-words"
                    style={stylePrimaryText}
                  >
                    {clinic.name && clinic.name.length > 26
                      ? clinic.name.slice(0, 26) + '…'
                      : clinic.name}
                  </h1>

                  {clinic.googleRating && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-bold whitespace-nowrap shadow-sm">
                      ⭐ {Number(clinic.googleRating).toFixed(1)} / 5
                      {typeof clinic.googleTotalReviews === 'number' && (
                        <span className="ml-1 font-medium text-yellow-700 opacity-80">
                          ({clinic.googleTotalReviews})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {/* Contact Info Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-center md:justify-start gap-x-8 gap-y-3 mb-6">
                  {clinic.phone && (
                    <a
                      href={`tel:${clinic.phone}`}
                      className="flex items-center gap-2 text-base font-semibold text-slate-700 hover:text-blue-600 transition-colors group"
                    >
                      <span className="p-1.5 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <svg
                          className="w-4 h-4"
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
                      </span>
                      {clinic.phone}
                    </a>
                  )}

                  {/* Address */}
                  <div className="flex items-start gap-2 text-base text-slate-600 text-left">
                    <span className="p-1.5 rounded-full bg-slate-100 text-slate-500 mt-0.5">
                      <svg
                        className="w-4 h-4 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </span>
                    <span
                      className="font-medium leading-snug"
                      title={clinic.address}
                    >
                      {clinic.address}
                    </span>
                  </div>

                  {(clinic.googleMapsUrl || clinic.googlePlaceId) && (
                    <a
                      href={
                        clinic.googleMapsUrl ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          clinic.name + ' ' + (clinic.city || '')
                        )}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-colors"
                    >
                      <span className="text-sky-500 text-sm">★</span>
                      <span>Google Maps &amp; reviews</span>
                    </a>
                  )}
                </div>

                {/* Description */}
                {description && (
                  <div className="w-full mt-5 pt-5 border-t border-gray-200/80">
                    <ExpandableText text={description} limit={200} />
                  </div>
                )}

                {/* Timings Badge */}
                {clinic.timings && (
                  <div className="flex justify-center md:justify-start mt-5">
                    <span
                      className="inline-flex items-center rounded-lg px-4 py-1.5 text-sm font-medium text-white shadow-md transition-transform hover:-translate-y-0.5"
                      style={{ backgroundColor: 'var(--color-action)' }}
                    >
                      <svg
                        className="w-4 h-4 mr-2"
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
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Doctors Section --- */}
        <div className="mt-12 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">👨‍⚕️</span>
              Available Specialists
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.length === 0 ? (
                <div className="col-span-3 text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500">
                  No doctors listed for this clinic yet.
                </div>
              ) : (
                doctors.map((doctor) => {
                  const avatarUrl = doctor.avatar
                    ? toFullUrl(doctor.avatar)
                    : null;

                  return (
                    <div
                      key={doctor.id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center text-center transition-all hover:shadow-xl group h-full justify-between"
                    >
                      <div className="flex flex-col items-center w-full">
                        <div className="w-28 h-28 rounded-full bg-gray-100 mb-4 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={doctor.name}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextSibling.style.display =
                                  'block';
                              }}
                            />
                          ) : null}
                          <span
                            className="hidden text-3xl"
                            style={{
                              display: avatarUrl ? 'none' : 'block',
                            }}
                          >
                            👨‍⚕️
                          </span>
                        </div>

                        <h3
                          className="font-extrabold text-xl text-gray-900 transition-colors"
                          style={stylePrimaryText}
                        >
                          Dr. {doctor.name}
                        </h3>
                        <p
                          className="font-semibold text-base mb-1"
                          style={styleSecondaryText}
                        >
                          {doctor.speciality?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          {doctor.experience} Yrs Experience
                        </p>

                        <div className="flex items-center gap-1.5 mb-5 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                          <svg
                            className="w-4 h-4 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-bold text-gray-800 text-sm">
                            {doctor.rating > 0 ? doctor.rating : 'New'}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({doctor.reviewCount || 0} reviews)
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/doctors/${doctor.id}/book`}
                        state={{ doctor: { ...doctor, clinicId: clinic.id } }}
                        className="w-full py-3 text-center text-white font-bold text-base rounded-xl transition-colors shadow-lg hover:opacity-90 mt-auto"
                        style={stylePrimaryBg}
                      >
                        Book Appointment
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
