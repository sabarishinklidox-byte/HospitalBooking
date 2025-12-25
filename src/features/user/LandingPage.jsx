// src/features/user/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import UserLayout from "../../layouts/UserLayout.jsx";
import { ENDPOINTS } from "../../lib/endpoints";

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200";
const DEFAULT_LOGO =
  "https://cdn-icons-png.flaticon.com/128/4521/4521401.png";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Helper Functions ---

// 1. Format Timings
const formatClinicTimings = (timings) => {
  if (!timings) return "Timings not available";
  if (typeof timings === "string") return timings;
  if (Array.isArray(timings)) return timings.join(" • ");
  if (typeof timings === "object") {
    return Object.values(timings).filter(Boolean).join(" • ");
  }
  return "Timings not available";
};

// 2. Format Description (Handle Object or String)
const formatClinicDescription = (details) => {
  if (!details || typeof details !== "string" || details.trim() === "") {
    return "This clinic provides multi-specialty outpatient care, diagnostics, and appointment-based consultations.";
  }
  return details;
};

// 3. Safe URL Generator (Fixes Localhost vs IP issues)
const toFullUrl = (url) => {
  if (!url) return null;
  
  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.includes("localhost") && window.location.hostname !== "localhost") {
      return url.replace("localhost", window.location.hostname);
    }
    return url;
  }

  const origin = API_BASE_URL 
    ? API_BASE_URL.replace(/\/api\/?$/, "") 
    : "http://localhost:5003";
  
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${cleanPath}`;
};

// 4. Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.35, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchClinics = async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(ENDPOINTS.PUBLIC.CLINICS, {
        params: {
          q: q || undefined,
          _t: Date.now(),
        },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.clinics || [];

      setClinics(list);
    } catch (err) {
      console.error("Clinic fetch error:", err);
      setError("Failed to load clinics. Please refresh the page.");
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
      {/* --- Hero Section --- */}
      <motion.section
        className="bg-white pt-10 pb-16 text-center px-4"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-sky-950 mb-4">
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
            className="w-full px-4 py-3 rounded-full border border-gray-300 shadow-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          />
        </div>
      </motion.section>

      {/* --- Clinics Grid Section --- */}
      <section className="bg-gray-50 py-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 border-l-4 border-sky-900 pl-4 flex items-center gap-2">
            <span className="text-xl">🏥</span>
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
                const logoSrc = toFullUrl(clinic.logo) || DEFAULT_LOGO;
                
                const rating = clinic.googleRating ? Number(clinic.googleRating) : null;
                const totalReviews = clinic.googleTotalReviews ? Number(clinic.googleTotalReviews) : 0;
                const timings = formatClinicTimings(clinic.timings);
                const description = formatClinicDescription(clinic.details);

                return (
                  <motion.button
                    key={clinic.id}
                    custom={idx}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/clinics/${clinic.id}`)}
                    className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {/* 1. Banner Image Area */}
                    <div className="relative h-44 w-full overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={banner}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={clinic.name}
                        onError={(e) => { e.currentTarget.src = DEFAULT_BANNER; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                      {/* Floating Logo */}
                      <div className="absolute -bottom-6 left-6 p-1 bg-white rounded-xl shadow-md border border-gray-100 z-10">
                        <img
                          src={logoSrc}
                          className="w-14 h-14 object-contain rounded-lg bg-white"
                          alt="logo"
                          onError={(e) => { e.currentTarget.src = DEFAULT_LOGO; }}
                        />
                      </div>
                    </div>

                    {/* 2. Content Area */}
                    <div className="flex flex-col flex-1 p-6 pt-9">
                      
                      {/* Name & Rating */}
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="min-w-0">
                          <h3 
                            className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-sky-700 transition-colors" 
                            title={clinic.name}
                          >
                            {clinic.name}
                          </h3>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">
                            {clinic.city || "City Not Listed"}
                          </p>
                        </div>
                        
                        {rating && rating > 0 && (
                          <div className="flex flex-col items-end shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 whitespace-nowrap">
                              ⭐ {rating.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {totalReviews > 0 ? `${totalReviews} reviews` : "New"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Location (Fixed height) */}
                      <div className="mb-2 min-h-[20px]">
                        <p className="text-sm text-slate-600 line-clamp-1 font-medium" title={clinic.address}>
                          📍 {clinic.address}
                        </p>
                      </div>

                      {/* ✅ ADDED: Description (Below Location) */}
                    

                      {/* Info Details */}
                      <div className="space-y-2 mb-6 border-t border-gray-100 pt-3">
                         {clinic.phone && clinic.phone !== "0000000000" && (
                           <div className="flex items-center gap-2 text-sm text-slate-600">
                             <span className="text-sky-500">📞</span>
                             <span className="font-medium hover:underline hover:text-sky-700">
                               {clinic.phone}
                             </span>
                           </div>
                         )}
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="text-sky-500">⏰</span>
                            <span className="line-clamp-1">{timings}</span>
                         </div>
                      </div>

                      {/* Footer / CTA */}
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                         <span className="text-sm font-bold text-sky-700 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                           View Specialists <span>→</span>
                         </span>
                         
                         {clinic.googleRatingUrl && (
                           <a 
                             href={clinic.googleRatingUrl}
                             onClick={(e) => e.stopPropagation()}
                             target="_blank"
                             rel="noreferrer"
                             className="text-xs text-slate-400 hover:text-sky-600 hover:underline flex items-center gap-1"
                           >
                             Google Review ↗
                           </a>
                         )}
                      </div>

                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </UserLayout>
  );
}
