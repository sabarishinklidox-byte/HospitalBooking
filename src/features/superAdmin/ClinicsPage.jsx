import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import ClinicCard from '../superAdmin/ClinicCard.jsx'; // Import the new card
import api from "../../lib/api";
import { ENDPOINTS } from '../../lib/endpoints';

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  

 const fetchClinics = async () => {
  try {
    setLoading(true);
    setError('');
    const res = await api.get(ENDPOINTS.SUPER_ADMIN.CLINICS);
    setClinics(res.data || []);
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to load clinics');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchClinics();
}, []);
  return (
    <SuperAdminLayout>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Clinics Management
            </h1>
           
          </div>

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {clinics.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <p className="text-gray-500 mb-2">No clinics found.</p>
              <button 
                onClick={() => navigate('/super-admin/clinics/new')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Create your first clinic
              </button>
            </div>
          ) : (
            // ✅ GRID LAYOUT instead of Table
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((clinic) => (
                <ClinicCard 
                  key={clinic.id} 
                  clinic={clinic} 
                  onUpdate={fetchClinics} // Pass refresh function
                />
              ))}
            </div>
          )}
        </>
      )}
    </SuperAdminLayout>
  );
}
