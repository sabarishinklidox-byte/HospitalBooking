import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import Loader from '../../components/Loader.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

export default function ClinicsManagementPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.SUPER_ADMIN.CLINICS);
      setClinics(res.data);
    } catch (err) {
      console.error('Failed to load clinics', err);
      toast.error('Failed to load clinics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleToggleActive = async (clinicId, currentStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          currentStatus ? 'Deactivate' : 'Activate'
        } this clinic?`
      )
    )
      return;

    try {
      await api.patch(ENDPOINTS.SUPER_ADMIN.CLINIC_STATUS(clinicId), {
        isActive: !currentStatus,
      });
      toast.success('Status updated');
      fetchClinics();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleToggleAudit = async (clinicId, currentStatus) => {
    try {
      await api.patch(
        ENDPOINTS.SUPER_ADMIN.CLINIC_AUDIT_PERMISSION(clinicId),
        { allowAuditView: !currentStatus }
      );
      toast.success('Permission updated');
      fetchClinics();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleClinicClick = async (clinicId) => {
    try {
      const res = await api.post(
        ENDPOINTS.SUPER_ADMIN.CLINIC_LINK_CLICK(clinicId)
      );
      setClinics((prev) =>
        prev.map((c) =>
          c.id === clinicId ? { ...c, linkClicks: res.data.linkClicks } : c
        )
      );
    } catch (err) {
      console.error(
        'Failed to track click:',
        err.response?.data || err.message
      );
    }
  };

  const handleCopyLink = async (clinic) => {
    const link = `${window.location.origin}/visit/${clinic.id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Clinic link copied!');
      handleClinicClick(clinic.id);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteClinic = async (clinicId) => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this clinic?'
      )
    )
      return;

    try {
      await api.delete(ENDPOINTS.SUPER_ADMIN.CLINIC_BY_ID(clinicId));
      toast.success('Clinic deleted');
      fetchClinics();
    } catch (err) {
      console.error('Delete failed', err.response?.data || err.message);
      toast.error(err.response?.data?.error || 'Failed to delete clinic');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            🏥 Clinics Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage all registered clinics and their permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clinics.map((clinic) => (
          <div
            key={clinic.id}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4 transition-all hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <button
                  type="button"
                  onClick={() => handleClinicClick(clinic.id)}
                  className="font-bold text-lg text-gray-900 hover:text-[#003366] text-left"
                >
                  {clinic.name}
                </button>
                <p className="text-xs text-gray-500 mt-1">{clinic.city}</p>
              </div>

              <span
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                  clinic.isActive
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {clinic.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">
                  Booking Access
                </span>
                <button
                  onClick={() =>
                    handleToggleActive(clinic.id, clinic.isActive)
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    clinic.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      clinic.isActive ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">
                  Audit Logs View
                </span>
                <button
                  onClick={() =>
                    handleToggleAudit(clinic.id, clinic.allowAuditView)
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    clinic.allowAuditView ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      clinic.allowAuditView ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono border-t border-gray-100 pt-2 mt-2">
              <span>ID: {clinic.slug}</span>
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-bold">
                👆 Clicks: {clinic.linkClicks ?? 0}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={() => handleCopyLink(clinic)}
                className="py-2 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                🔗 Copy Link
              </button>

              <button
                onClick={() =>
                  navigate(`/super-admin/clinics/${clinic.id}/edit`)
                }
                className="py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100"
              >
                Edit
              </button>

              <button
                onClick={() => handleDeleteClinic(clinic.id)}
                className="py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {clinics.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">
              No clinics found. Click "Add New Clinic" to create one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
