// src/features/superAdmin/PlansPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';
import { FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const emptyForm = {
    name: '',
    slug: '',
    priceMonthly: 0,
    currency: 'INR',
    maxDoctors: 1,
    maxBookingsPerMonth: 100,
    allowOnlinePayments: false,
    allowCustomBranding: false,
    
    // Feature Flags
    enableReviews: true,        // ✅ RESTORED: Internal Website Reviews
    enableGoogleReviews: false, // Google API Ratings
    allowEmbedReviews: false,   // Embed Code Widget
    
    enableBulkSlots: true,
    enableExports: true,
    enableAuditLogs: true,
    isActive: true,
    isTrial: false,
    durationDays: '',
    trialDays: '',
  };

  const [form, setForm] = useState(emptyForm);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.SUPER_ADMIN.PLANS);
      setPlans(res.data);
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (!editing && name === 'name' && !prev.slug) {
        next.slug = value
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }

      return next;
    });
  };

  const handleEdit = (plan) => {
    setEditing(plan.id);
    setForm({
      ...emptyForm,
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      maxDoctors: Number(plan.maxDoctors),
      maxBookingsPerMonth: Number(plan.maxBookingsPerMonth),
      allowOnlinePayments: !!plan.allowOnlinePayments,
      allowCustomBranding: !!plan.allowCustomBranding,
      
      // Load Review Flags
      enableReviews: plan.enableReviews ?? true,             // ✅ RESTORED
      enableGoogleReviews: !!plan.enableGoogleReviews,
      allowEmbedReviews: !!plan.allowEmbedReviews,
      
      enableBulkSlots: plan.enableBulkSlots ?? true,
      enableExports: plan.enableExports ?? true,
      enableAuditLogs: plan.enableAuditLogs ?? true,
      isActive: plan.isActive ?? true,
      isTrial: plan.isTrial ?? false,
      durationDays: plan.durationDays ?? '',
      trialDays: plan.trialDays ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload = {
          name: form.name,
          slug: form.slug,
          currency: form.currency,
          allowOnlinePayments: form.allowOnlinePayments,
          allowCustomBranding: form.allowCustomBranding,
          
          enableReviews: form.enableReviews,             // ✅ RESTORED
          enableGoogleReviews: form.enableGoogleReviews,
          allowEmbedReviews: form.allowEmbedReviews,
          
          enableBulkSlots: form.enableBulkSlots,
          enableExports: form.enableExports,
          enableAuditLogs: form.enableAuditLogs,
          isActive: form.isActive,
        };
        await api.put(ENDPOINTS.SUPER_ADMIN.PLAN_BY_ID(editing), payload);
        toast.success('Plan updated');
      } else {
        const payload = {
          ...form,
          priceMonthly: Number(form.priceMonthly),
          maxDoctors: Number(form.maxDoctors),
          maxBookingsPerMonth: Number(form.maxBookingsPerMonth),
          durationDays: form.durationDays === '' ? null : Number(form.durationDays),
          trialDays: form.trialDays === '' ? null : Number(form.trialDays),
        };
        await api.post(ENDPOINTS.SUPER_ADMIN.PLANS, payload);
        toast.success('Plan created');
      }

      await loadPlans();
      handleCancelEdit();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save plan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await api.delete(ENDPOINTS.SUPER_ADMIN.PLAN_BY_ID(id));
      toast.success('Plan deleted');
      await loadPlans();
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  const handleViewLog = (plan) => {
    navigate(
      `${ENDPOINTS.SUPER_ADMIN.AUDIT_LOGS}?entity=PLAN&entityId=${plan.id}&entityName=${encodeURIComponent(plan.name)}`
    );
  };

  return (
    <SuperAdminLayout>
      <div className="w-full mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Subscription Plans</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* LEFT: Form Section */}
          <div className="xl:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-6">
              <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">
                {editing ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ... (Name, Slug, Price, Currency, MaxDocs, Bookings fields - SAME AS BEFORE) ... */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Plan Name</label>
                  <input
                    name="name"
                    className="input w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Starter Plan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Slug (URL)</label>
                  <input
                    name="slug"
                    className="input w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 font-mono text-sm"
                    value={form.slug}
                    onChange={handleChange}
                    required
                    placeholder="e.g. starter-plan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                        <input
                            name="priceMonthly"
                            type="number"
                            className="input w-full border border-gray-300 rounded px-3 py-2"
                            value={form.priceMonthly}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Currency</label>
                        <input
                            name="currency"
                            className="input w-full border border-gray-300 rounded px-3 py-2"
                            value={form.currency}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Docs</label>
                        <input
                            name="maxDoctors"
                            type="number"
                            className="input w-full border border-gray-300 rounded px-3 py-2"
                            value={form.maxDoctors}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bookings/Mo</label>
                        <input
                            name="maxBookingsPerMonth"
                            type="number"
                            className="input w-full border border-gray-300 rounded px-3 py-2"
                            value={form.maxBookingsPerMonth}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Duration (Days)</label>
                        <input
                            name="durationDays"
                            type="number"
                            className="input w-full border border-gray-300 rounded px-3 py-2"
                            value={form.durationDays}
                            onChange={handleChange}
                            placeholder="Blank=Month"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trial Days</label>
                        <input
                            name="trialDays"
                            type="number"
                            className="input w-full border border-gray-300 rounded px-3 py-2"
                            value={form.trialDays}
                            onChange={handleChange}
                            placeholder="Optional"
                        />
                    </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Features & Flags</p>
                  {[
                    { key: 'allowOnlinePayments', label: 'Online Payments' },
                    { key: 'allowCustomBranding', label: 'Custom Branding' },
                    { key: 'enableBulkSlots', label: 'Bulk Slots' },
                    { key: 'enableExports', label: 'Export Data' },
                    { key: 'enableAuditLogs', label: 'Audit Logs' },
                    { key: 'isTrial', label: 'Is Trial Plan' },
                    { key: 'isActive', label: 'Is Active' },
                  ].map((field) => (
                    <label key={field.key} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        name={field.key}
                        checked={form[field.key]}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{field.label}</span>
                    </label>
                  ))}

                  {/* Reviews Section Separator */}
                  <div className="pt-2 mt-2 border-t border-dashed border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Review Systems</p>
                    
                    {/* 1. Internal Reviews */}
                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            name="enableReviews"
                            checked={form.enableReviews}
                            onChange={handleChange}
                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Internal Website Reviews</span>
                    </label>

                    {/* 2. Google Ratings */}
                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            name="enableGoogleReviews"
                            checked={form.enableGoogleReviews}
                            onChange={handleChange}
                            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Google Place ID & Ratings</span>
                    </label>

                    {/* 3. Embed Widget */}
                    <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            name="allowEmbedReviews"
                            checked={form.allowEmbedReviews}
                            onChange={handleChange}
                            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700">Embed Code Widget</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 mt-2">
                  {editing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#0b3b5e] text-white font-semibold rounded hover:bg-[#092c46] transition-colors shadow-sm"
                  >
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Table Section */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Plan Name</th>
                      <th className="px-6 py-4 font-semibold">Pricing</th>
                      <th className="px-6 py-4 font-semibold">Limits</th>
                      <th className="px-6 py-4 font-semibold">Features</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading plans...</td></tr>
                    ) : plans.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No plans found. Create one to get started.</td></tr>
                    ) : (
                      plans.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                          {/* ... Name, Price, Limits columns (SAME AS BEFORE) ... */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{p.slug}</div>
                            <div className="mt-2 flex gap-1 flex-wrap">
                                {p.isTrial && <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">Trial</span>}
                                {!p.isActive && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">Inactive</span>}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-800 text-lg">
                                {p.currency} {Number(p.priceMonthly).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                                {p.durationDays ? `per ${p.durationDays} days` : 'per Month'}
                            </div>
                            {p.trialDays && (
                                <div className="text-xs text-green-600 mt-1 font-medium">
                                    + {p.trialDays} days free
                                </div>
                            )}
                          </td>

                          <td className="px-6 py-4">
                             <div className="text-sm text-gray-700">
                                <span className="font-semibold">{p.maxDoctors}</span> Doctors
                             </div>
                             <div className="text-sm text-gray-700 mt-1">
                                <span className="font-semibold">{p.maxBookingsPerMonth}</span> Bookings
                             </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                                {p.allowOnlinePayments && <Badge label="Payments" color="blue" />}
                                {p.allowCustomBranding && <Badge label="Branding" color="purple" />}
                                
                                {/* ✅ REVIEW BADGES */}
                                {p.enableReviews && <Badge label="Internal-Rev" color="purple" />}
                                {p.enableGoogleReviews && <Badge label="G-Ratings" color="green" />}
                                {p.allowEmbedReviews && <Badge label="Embed-Widget" color="teal" />}

                                {p.enableBulkSlots && <Badge label="Bulk Slots" color="gray" />}
                                {p.enableExports && <Badge label="Exports" color="gray" />}
                                {p.enableAuditLogs && <Badge label="Audit" color="indigo" />}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(p)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit Plan"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewLog(p)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                disabled={!p.enableAuditLogs}
                                title="View Audit Logs"
                              >
                                <FiFileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete Plan"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

// Simple Badge Component for cleanliness
function Badge({ label, color }) {
    const colors = {
        blue: "bg-blue-100 text-blue-800",
        purple: "bg-purple-100 text-purple-800",
        green: "bg-green-100 text-green-800",
        teal: "bg-teal-100 text-teal-800",
        indigo: "bg-indigo-100 text-indigo-800",
        gray: "bg-gray-100 text-gray-700",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border border-transparent ${colors[color] || colors.gray}`}>
            {label}
        </span>
    );
}
