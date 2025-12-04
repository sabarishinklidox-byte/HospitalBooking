import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';

const DEFAULT_DOCTOR_IMAGE = "/default-doctor.jpg"; // Must be in /public folder

export default function ClinicPublicPage() {
  const { clinicId } = useParams();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clinicRes = await api.get(`/public/clinics/${clinicId}`);
        setClinic(clinicRes.data);

        const docRes = await api.get(`/public/clinics/${clinicId}/doctors`);
        setDoctors(docRes.data);
      } catch (err) {
        setError('Clinic not found. Please check the link.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clinicId]);

  if (loading) return <UserLayout><Loader /></UserLayout>;
  if (error) return <UserLayout><div className="p-10 text-center text-red-500">{error}</div></UserLayout>;
  if (!clinic) return null;

  return (
    <UserLayout>
      {/* Clinic Banner */}
      <div className="bg-[#0b3b5e] text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
           <h1 className="text-3xl md:text-4xl font-bold mb-2">{clinic.name}</h1>
           <p className="opacity-90">{clinic.address}, {clinic.city}</p>
        </div>
      </div>

      {/* Doctors List */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Specialists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border p-5 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden">
                <img
                  src={doctor.avatar || DEFAULT_DOCTOR_IMAGE}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = DEFAULT_DOCTOR_IMAGE; }}
                />
              </div>
              <h3 className="font-bold text-lg">{doctor.name}</h3>
              <p className="text-[#0b3b5e] font-medium text-sm">{doctor.speciality}</p>
              
              {/* ✅ FIXED LINK: Points to the booking page with correct doctor data */}
              <Link
                to={`/doctors/${doctor.id}/book`}
                state={{ doctor: { ...doctor, clinicId: clinic.id } }}
                className="mt-4 w-full py-2.5 text-center bg-[#0b3b5e] text-white font-semibold rounded-lg hover:bg-[#092c46]"
              >
                Book Visit
              </Link>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}
