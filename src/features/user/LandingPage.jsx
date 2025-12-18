// src/features/user/LandingPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "../../lib/api";
import UserLayout from "../../layouts/UserLayout.jsx";
import Loader from "../../components/Loader.jsx";
import { ENDPOINTS } from "../../lib/endpoints";

const PRIMARY_COLOR = "#0056b3";
const ACCENT_COLOR = "#00bcd4";
const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200";
const DEFAULT_LOGO =
  "https://cdn-icons-png.flaticon.com/128/4521/4521401.png";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ;

const formatClinicTimings = (timings) => {
  if (!timings) return "Timings not available";
  if (typeof timings === "string") return timings;
  if (Array.isArray(timings)) return timings.join(" • ");
  if (typeof timings === "object") {
    return Object.values(timings).filter(Boolean).join(" • ");
  }
  return "Timings not available";
};

const toFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

// simple variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.4, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const doctorsSectionRef = useRef(null);

  const fetchClinics = async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(ENDPOINTS.PUBLIC.CLINICS, {
        params: { q: q || undefined },
      });
      setClinics(res.data);
    } catch (err) {
      setError(
        "Failed to load clinics. Please check your network connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchClinics(search);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (!selectedClinic) return;
    const fetchDoctors = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(
          ENDPOINTS.PUBLIC.CLINIC_DOCTORS(selectedClinic.id)
        );
        setDoctors(res.data);

        if (doctorsSectionRef.current) {
          doctorsSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } catch {
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [selectedClinic]);

  const handleClinicSelect = async (clinic) => {
    setSelectedClinic(clinic);
    try {
      await api.get(`/public/clinics/${clinic.id}`);
    } catch (err) {
      console.error("Failed to track clinic click", err);
    }
  };

  return (
    <UserLayout>
      {/* HERO */}
      <motion.div
        className="bg-white pt-10 pb-16 text-center relative px-4"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[100px] -z-10 opacity-30"
          style={{ backgroundColor: ACCENT_COLOR }}
        ></div>

        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#003366] tracking-tighter mb-4 leading-snug"
          custom={0}
          variants={fadeUp}
        >
          Find Your Care Center
        </motion.h1>
        <motion.p
          className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
          custom={1}
          variants={fadeUp}
        >
          Select a <strong>trusted clinic</strong> below to view available
          specialists and book your appointment instantly.
        </motion.p>

        {/* Search box */}
        <motion.div
          className="mt-6 max-w-xl mx-auto"
          custom={2}
          variants={fadeUp}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clinics by name, address, city, or pincode..."
            className="w-full px-4 py-3 rounded-full border border-gray-300 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </motion.div>
      </motion.div>

      {error && (
        <motion.div
          className="max-w-xl mx-auto bg-red-100 text-red-700 p-4 rounded-xl text-center mb-12 shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* CLINIC CARDS */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-[#003366] pl-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            🏥 Choose a Clinic Location
          </motion.h2>

          {clinics.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.06 },
                },
              }}
            >
              {clinics.map((clinic, idx) => {
                const isSelected = selectedClinic?.id === clinic.id;
                const bannerSrc =
                  toFullUrl(clinic.banner || clinic.bannerUrl) ||
                  DEFAULT_BANNER;
                const logoSrc =
                  toFullUrl(clinic.logo || clinic.logoUrl) || DEFAULT_LOGO;
                const ratingUrl = clinic.googleMapsUrl || null;

                return (
                  <motion.button
                    key={clinic.id}
                    onClick={() => handleClinicSelect(clinic)}
                    variants={fadeUp}
                    custom={idx}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative group text-left rounded-2xl overflow-hidden transition-all duration-300 ${
                      isSelected
                        ? "border-4 border-white shadow-2xl ring-4 ring-[#003366] scale-[1.02] bg-[#003366]"
                        : "border-2 border-gray-100 shadow-xl bg-white hover:border-[#003366]/20"
                    }`}
                  >
                    <div className="h-32 w-full overflow-hidden relative bg-gray-100">
                      <img
                        src={bannerSrc}
                        alt="Clinic Banner"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_BANNER;
                        }}
                      />
                      <div
                        className={`absolute inset-0 ${
                          isSelected
                            ? "bg-[#003366]/70"
                            : "bg-black/30 group-hover:bg-black/40"
                        } transition-colors`}
                      ></div>
                      {isSelected && (
                        <motion.div
                          className="absolute top-4 right-4 bg-white text-[#00366] rounded-full p-2 shadow-xl"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </motion.div>
                      )}
                    </div>

                    <div
                      className={`p-6 relative ${
                        isSelected ? "text-white" : "bg-white"
                      }`}
                    >
                      <div className="absolute -top-10 left-6 p-1 bg-white rounded-xl shadow-lg">
                        <img
                          src={logoSrc}
                          alt="Logo"
                          className="w-16 h-16 object-contain rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LOGO;
                          }}
                        />
                      </div>

                      <div className="mt-8">
                        <h3
                          className={`font-extrabold text-2xl mb-1 ${
                            isSelected ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {clinic.name}
                        </h3>

                        {(clinic.googleRating || ratingUrl) && (
                          <div className="flex items-center gap-2 mb-3">
                            {clinic.googleRating && (
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                                <span className="mr-1">⭐</span>
                                <span>
                                  {Number(clinic.googleRating).toFixed(1)} / 5
                                </span>
                                {typeof clinic.googleTotalReviews ===
                                  "number" && (
                                  <span className="ml-1">
                                    ({clinic.googleTotalReviews} reviews)
                                  </span>
                                )}
                              </div>
                            )}

                            {ratingUrl && (
                              <span
                                role="link"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    ratingUrl,
                                    "_blank",
                                    "noopener"
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(
                                      ratingUrl,
                                      "_blank",
                                      "noopener"
                                    );
                                  }
                                }}
                                className={`text-[11px] font-semibold underline underline-offset-2 cursor-pointer ${
                                  isSelected
                                    ? "text-blue-200"
                                    : "text-blue-600"
                                }`}
                                title="Write review on Google"
                              >
                                Write review on Google
                              </span>
                            )}
                          </div>
                        )}

                        {/* ✅ ADDED: Phone Number */}
                        {clinic.phone && (
                          <p
                            className={`text-sm flex items-center gap-2 mb-4 ${
                              isSelected ? "text-blue-200" : "text-gray-600"
                            }`}
                          >
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
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              ></path>
                            </svg>
                            <a
                              href={`tel:${clinic.phone}`}
                              className={`font-semibold hover:underline ${
                                isSelected
                                  ? "text-blue-100"
                                  : "text-blue-600"
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {clinic.phone}
                            </a>
                          </p>
                        )}

                        <p
                          className={`text-sm flex items-start gap-2 mb-4 ${
                            isSelected ? "text-blue-200" : "text-gray-500"
                          }`}
                        >
                          <svg
                            className="w-4 h-4 mt-0.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                          </svg>
                          <span>
                            {clinic.address}, {clinic.city}
                          </span>
                        </p>

                        <div
                          className={`pt-4 border-t ${
                            isSelected
                              ? "border-white/30"
                              : "border-gray-100"
                          } text-sm space-y-3`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                isSelected ? "text-blue-300" : "text-gray-400"
                              }
                            >
                              🕒
                            </span>
                            <span
                              className={`font-medium ${
                                isSelected ? "text-white" : "text-gray-700"
                              }`}
                            >
                              {formatClinicTimings(clinic.timings)}
                            </span>
                          </div>
                          {clinic.details && (
                            <p
                              className={`line-clamp-2 leading-relaxed ${
                                isSelected
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {clinic.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-10 text-gray-500 text-lg">
              {loading ? "Loading hospital selections..." : "No clinics found."}
            </div>
          )}
        </div>
      </div>

      {/* DOCTORS LIST SECTION */}
      <div
        ref={doctorsSectionRef}
        className="max-w-7xl mx-auto px-4 py-20"
      >
        <div className="flex flex-col md:flex-row items-baseline gap-3 mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Meet Our Specialists
          </h2>
          <p className="text-xl text-gray-600">
            at <strong>{selectedClinic?.name || "Selected Clinic"}</strong>
          </p>
        </div>

        {loading && selectedClinic ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : doctors.length === 0 ? (
          <motion.div
            className="text-center py-20 bg-white rounded-3xl border-4 border-dashed border-gray-200 max-w-3xl mx-auto shadow-inner"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-6xl block mb-4">🩺</span>
            <p className="text-xl text-gray-600 font-semibold">
              No doctors listed for this location yet.
            </p>
            <p className="text-gray-400 mt-2">
              Please select another clinic above or check back later.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.06 },
              },
            }}
          >
            {doctors.map((doctor, idx) => (
              <motion.div
                key={doctor.id}
                variants={fadeUp}
                custom={idx}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:border-[#003366]/30 transition-all duration-300 p-8 flex flex-col items-center text-center group"
              >
                <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center mb-6 overflow-hidden border-4 border-white shadow-xl group-hover:shadow-blue-300/50 group-hover:scale-105 transition-transform duration-500">
                  {doctor.avatar ? (
                    <img
                      src={toFullUrl(doctor.avatar)}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className="text-4xl font-extrabold text-[#003366] uppercase"
                    style={{ display: doctor.avatar ? "none" : "flex" }}
                  >
                    {doctor.name.charAt(0)}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-gray-900 mb-1 group-hover:text-[#0056b3] transition-colors">
                  {doctor.name}
                </h3>

                <p
                  className="text-sm text-white font-bold px-4 py-1 rounded-full mb-4 shadow-md"
                  style={{ backgroundColor: ACCENT_COLOR }}
                >
                  {doctor.speciality}
                </p>

                <div className="w-full border-t border-gray-100 my-4"></div>

                <div className="grid grid-cols-2 w-full text-center mb-6 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                      Experience
                    </p>
                    <p className="font-extrabold text-lg text-[#003366] mt-1">
                      {doctor.experience || 1}+ Years
                    </p>
                  </div>
                  <div className="border-l border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                      Rating
                    </p>
                    <div className="flex items-center justify-center gap-1 text-yellow-500 font-extrabold text-lg mt-1">
                      <span>★</span> {doctor.rating || "New"}
                    </div>
                  </div>
                </div>

                <motion.a
                  href={`/doctors/${doctor.id}/book`}
                  whileHover={{ y: -2, boxShadow: "0 12px 24px rgba(0,0,0,0.18)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-[#0056b3] text-white rounded-xl font-bold text-lg hover:bg-[#00408f] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center"
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    transition: "transform 0.3s, background-color 0.3s",
                  }}
                >
                  Book Appointment
                </motion.a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </UserLayout>
  );
}
