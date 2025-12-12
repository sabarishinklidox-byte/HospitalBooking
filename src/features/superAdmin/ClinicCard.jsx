import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

export default function ClinicCard({ clinic, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${clinic.isActive ? 'DEACTIVATE' : 'ACTIVATE'} this clinic?`)) return;
    setLoading(true);
    try {
      const res = await api.patch(ENDPOINTS.SUPER_ADMIN.CLINIC_STATUS(clinic.id), { isActive: !clinic.isActive });
      toast.success(res.data.message || 'Status updated');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAudit = async () => {
    setLoading(true);
    try {
      const res = await api.patch(ENDPOINTS.SUPER_ADMIN.CLINIC_AUDIT_PERMISSION(clinic.id), { allowAuditView: !clinic.allowAuditView });
      toast.success(res.data.message || 'Permission updated');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('⚠️ Are you sure? This deletes ALL data for this clinic permanently.')) return;
    try {
      // ✅ Use CLINIC_BY_ID for the delete operation
      await api.delete(ENDPOINTS.SUPER_ADMIN.CLINIC_BY_ID(clinic.id)); 
      toast.success('Clinic deleted successfully');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete clinic');
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/visit/${clinic.id}`;
    try {
      await navigator.clipboard.writeText(link);
      const res = await api.post(ENDPOINTS.SUPER_ADMIN.CLINIC_LINK_CLICK(clinic.id));
      console.log('Click incremented:', res.data);
      toast.success('Clinic link copied!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to copy or track click:', err);
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{clinic.name}</h3>
          <p className="text-sm text-gray-500">{clinic.city || 'No City'}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${clinic.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {clinic.isActive ? 'ACTIVE' : 'INACTIVE'}
        </span>
      </div>
      <p className="mb-2 text-[10px] text-gray-400 font-mono">ID: {clinic.slug} · 👆 Clicks: {clinic.linkClicks ?? 0}</p>
      <div className="space-y-3 bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Booking Access</span>
          <button onClick={handleToggleStatus} disabled={loading} className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${clinic.isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${clinic.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Audit Logs View</span>
          <button onClick={handleToggleAudit} disabled={loading} className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${clinic.allowAuditView ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${clinic.allowAuditView ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
      <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
        <button onClick={handleCopyLink} className="flex-1 text-xs font-medium py-2 rounded border border-gray-200 hover:bg-gray-50 text-gray-600">
          {copied ? '✓ Copied' : '🔗 Copy Link'}
        </button>
        <button onClick={() => navigate(`/super-admin/clinics/${clinic.id}/edit`)} className="flex-1 text-center text-xs font-medium py-2 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100">
          Edit
        </button>
        <button onClick={handleDelete} className="flex-1 text-xs font-medium py-2 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
          Delete
        </button>
      </div>
    </div>
  );
}
