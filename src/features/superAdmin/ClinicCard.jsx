import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

export default function ClinicCard({ clinic, onUpdate }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Toggle Active (Booking Access)
  const handleToggleStatus = async () => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          clinic.isActive ? 'DEACTIVATE' : 'ACTIVATE'
        } this clinic?`
      )
    )
      return;

    setLoading(true);
    try {
      const res = await api.patch(
        ENDPOINTS.SUPER_ADMIN.CLINIC_STATUS(clinic.id),
        { isActive: !clinic.isActive }
      );
      toast.success(res.data.message || 'Status updated');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. NEW: Toggle Public Visibility (Landing Page)
  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      // Direct API call as requested
      const res = await api.patch(
        `/super-admin/clinics/${clinic.id}/toggle-public`, 
        { isPublic: !clinic.isPublic }
      );
      toast.success(res.data.message || 'Visibility updated');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update visibility');
    } finally {
      setLoading(false);
    }
  };

  // 3. Toggle Audit Logs
  const handleToggleAudit = async () => {
    setLoading(true);
    try {
      const res = await api.patch(
        ENDPOINTS.SUPER_ADMIN.CLINIC_AUDIT_PERMISSION(clinic.id),
        { allowAuditView: !clinic.allowAuditView }
      );
      toast.success(res.data.message || 'Permission updated');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        '⚠️ Are you sure? This deletes ALL data for this clinic permanently.'
      )
    )
      return;

    setLoading(true);
    try {
      await api.delete(ENDPOINTS.SUPER_ADMIN.CLINIC_BY_ID(clinic.id));
      toast.success('Clinic deleted successfully');
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete clinic');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/visit/${clinic.id}`;
    setLoading(true);
    try {
      await navigator.clipboard.writeText(link);
      await api.post(ENDPOINTS.SUPER_ADMIN.CLINIC_LINK_CLICK(clinic.id));
      toast.success('Clinic link copied!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to copy or track click:', err);
      toast.error('Failed to copy link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Status Strip */}
      <div
        className={`h-1.5 w-full ${
          clinic.isActive
            ? 'bg-gradient-to-r from-green-400 to-green-500'
            : 'bg-gradient-to-r from-red-400 to-red-500'
        }`}
      />

      <div className="p-5 flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate leading-tight">
              {clinic.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-gray-500 text-sm">
              <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{clinic.city || 'No City'}</span>
            </div>
          </div>

          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${clinic.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {clinic.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Slug</p>
            <p className="text-sm font-mono text-gray-700 truncate font-medium">{clinic.slug}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
            <p className="text-xs text-blue-500 font-medium uppercase tracking-wider mb-0.5">Clicks</p>
            <p className="text-sm font-mono text-blue-700 font-bold">{clinic.linkClicks ?? 0}</p>
          </div>
        </div>

        {/* Toggles Section */}
        <div className="space-y-3 mb-2">
          
          {/* 1. Booking Access */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Booking Access</span>
            <button
              onClick={handleToggleStatus}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${clinic.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${clinic.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* ✅ 2. NEW: Landing Page Visibility */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Show on Landing</span>
            <button
              onClick={handleTogglePublic}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${clinic.isPublic ? 'bg-purple-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${clinic.isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* 3. Audit Logs */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Audit Logs</span>
            <button
              onClick={handleToggleAudit}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${clinic.allowAuditView ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${clinic.allowAuditView ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 border-t border-gray-100 p-3 grid grid-cols-3 gap-2">
        <button
          onClick={handleCopyLink}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${copied ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'}`}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>

        <button
          onClick={() => navigate(`/super-admin/clinics/${clinic.id}/edit`)}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          Edit
        </button>

        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
