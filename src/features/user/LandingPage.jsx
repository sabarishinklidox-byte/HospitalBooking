import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import UserLayout from "../../layouts/UserLayout.jsx";
import Loader from "../../components/Loader.jsx";

// Fallback image (Use public folder path or external URL)
const DEFAULT_DOCTOR_IMAGE = "/default-doctor.jpg"; 

export default function LandingPage() {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await api.get("/public/clinics");
        setClinics(res.data);
        if (res.data.length > 0) setSelectedClinic(res.data[0]);
      } catch (err) {
        setError("Failed to load clinics.");
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    if (!selectedClinic) return;
    const fetchDoctors = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/public/clinics/${selectedClinic.id}/doctors`);
        setDoctors(res.data);
      } catch (err) {
        setError("Failed to load doctors for this clinic.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [selectedClinic]);

  return (
    <UserLayout>
      <div className="text-center mb-12 mt-6">
        <h1 className="text-4xl lg:text-5xl font-extrabold text-[#0b3b5e] tracking-tight">
          Find the Right Doctor, Anytime
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 leading-relaxed">
          Book appointments with trusted specialists across top clinics.
        </p>
      </div>

      {error && <p className="text-center text-red-500 my-4">{error}</p>}

      {clinics.length > 1 && (
        <div className="mb-10 flex justify-center">
          <select
            onChange={(e) =>
              setSelectedClinic(clinics.find((c) => c.id === e.target.value))
            }
            value={selectedClinic?.id || ""}
            className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm w-full max-w-xs focus:ring-2 focus:ring-[#0b3b5e] focus:outline-none"
          >
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name} – {clinic.city}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors available for this clinic.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 flex flex-col items-center text-center border border-gray-100"
            >
              <div className="w-24 h-24 rounded-full bg-[#0b3b5e] flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-md">
                 <img
                   src={doctor.avatar || DEFAULT_DOCTOR_IMAGE}
                   alt={doctor.name}
                   className="w-full h-full object-cover"
                   onError={(e) => { e.currentTarget.src = DEFAULT_DOCTOR_IMAGE; }}
                 />
              </div>

              <h3 className="text-xl font-bold text-[#0b3b5e] mb-1">{doctor.name}</h3>
              <p className="text-sm text-gray-600 font-medium">{doctor.speciality}</p>
              <p className="text-xs text-gray-500 mt-1 mb-5">{doctor.experience || 0} years of experience</p>

              {/* ✅ FIXED LINK: Passes doctor state correctly */}
              <Link
                to={`/doctors/${doctor.id}/book`}
                state={{ doctor: { ...doctor, clinicId: selectedClinic?.id } }}
                className="mt-auto w-full py-3 bg-[#0b3b5e] text-white rounded-lg font-semibold hover:bg-[#092e48] transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </UserLayout>
  );
}
