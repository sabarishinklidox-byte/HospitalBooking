// src/features/superAdmin/PlansPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';

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
    enableBulkSlots: true,
    enableExports: true,
    enableAuditLogs: true,
    enableGoogleReviews: false,
    isActive: true,
    // NEW
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
      enableGoogleReviews: !!plan.enableGoogleReviews,
      enableBulkSlots: plan.enableBulkSlots ?? true,
      enableExports: plan.enableExports ?? true,
      enableAuditLogs: plan.enableAuditLogs ?? true,
      isActive: plan.isActive ?? true,
      isTrial: plan.isTrial ?? false,
      durationDays: plan.durationDays ?? '',
      trialDays: plan.trialDays ?? '',
    });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        // EDIT EXISTING PLAN: send only safe fields
        const payload = {
          name: form.name,
          slug: form.slug,
          currency: form.currency,
          allowOnlinePayments: form.allowOnlinePayments,
          allowCustomBranding: form.allowCustomBranding,
          enableBulkSlots: form.enableBulkSlots,
          enableExports: form.enableExports,
          enableAuditLogs: form.enableAuditLogs,
          enableGoogleReviews: form.enableGoogleReviews,
          isActive: form.isActive,
          // leave price/limits/duration/trial fields out to avoid 400
        };

        await api.put(ENDPOINTS.SUPER_ADMIN.PLAN_BY_ID(editing), payload);
        toast.success('Plan updated');
      } else {
        // CREATE NEW PLAN: send full payload
        const payload = {
          ...form,
          priceMonthly: Number(form.priceMonthly),
          maxDoctors: Number(form.maxDoctors),
          maxBookingsPerMonth: Number(form.maxBookingsPerMonth),
          durationDays:
            form.durationDays === '' ? null : Number(form.durationDays),
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
      `${ENDPOINTS.SUPER_ADMIN.AUDIT_LOGS}?entity=PLAN&entityId=${
        plan.id
      }&entityName=${encodeURIComponent(plan.name)}`
    );
  };

  return (
    <SuperAdminLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Subscription Plans</h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 rounded-lg shadow mb-6 space-y-3"
        >
          <h2 className="font-semibold mb-2">
            {editing ? 'Edit Plan' : 'New Plan'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold">Name</label>
              <input
                name="name"
                className="input w-full"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Slug</label>
              <input
                name="slug"
                className="input w-full"
                value={form.slug}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Price (Monthly)</label>
              <input
                name="priceMonthly"
                type="number"
                className="input w-full"
                value={form.priceMonthly}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Currency</label>
              <input
                name="currency"
                className="input w-full"
                value={form.currency}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Max Doctors</label>
              <input
                name="maxDoctors"
                type="number"
                className="input w-full"
                value={form.maxDoctors}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">
                Max Bookings / Plan Period
              </label>
              <input
                name="maxBookingsPerMonth"
                type="number"
                className="input w-full"
                value={form.maxBookingsPerMonth}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="text-xs font-semibold">
                Plan Duration (days)
              </label>
              <input
                name="durationDays"
                type="number"
                className="input w-full"
                value={form.durationDays}
                onChange={handleChange}
                placeholder="15 = 15‑day plan, blank = monthly"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">
                Trial Days (optional)
              </label>
              <input
                name="trialDays"
                type="number"
                className="input w-full"
                value={form.trialDays}
                onChange={handleChange}
                placeholder="e.g. 7"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allowOnlinePayments"
                checked={form.allowOnlinePayments}
                onChange={handleChange}
              />
              Allow Online Payments
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="allowCustomBranding"
                checked={form.allowCustomBranding}
                onChange={handleChange}
              />
              Allow Custom Branding
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enableGoogleReviews"
                checked={form.enableGoogleReviews}
                onChange={handleChange}
              />
              Enable Google Reviews
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enableBulkSlots"
                checked={form.enableBulkSlots}
                onChange={handleChange}
              />
              Enable Bulk Slots
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enableExports"
                checked={form.enableExports}
                onChange={handleChange}
              />
              Enable Export PDF/Excel
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="enableAuditLogs"
                checked={form.enableAuditLogs}
                onChange={handleChange}
              />
              Enable Audit Logs
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isTrial"
                checked={form.isTrial}
                onChange={handleChange}
              />
              Trial plan
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-3">
            {editing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {editing ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>

        {/* Plans list */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-3">Existing Plans</h2>
          {loading ? (
            <p>Loading...</p>
          ) : plans.length === 0 ? (
            <p className="text-gray-500 text-sm">No plans yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Price</th>
                  <th className="text-left py-2">Doctors</th>
                  <th className="text-left py-2">Bookings / Period</th>
                  <th className="text-left py-2">Duration</th>
                  <th className="text-left py-2">Flags</th>
                  <th className="text-right py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">
                      {p.currency} {Number(p.priceMonthly)}
                    </td>
                    <td className="py-2">{p.maxDoctors}</td>
                    <td className="py-2">{p.maxBookingsPerMonth}</td>
                    <td className="py-2">
                      {p.durationDays ? `${p.durationDays} days` : 'Monthly'}
                      {p.isTrial && ' · Trial'}
                      {p.trialDays ? ` · ${p.trialDays}d trial` : ''}
                    </td>
                    <td className="py-2">
                      {p.allowOnlinePayments && (
                        <span className="mr-1">OnlinePay</span>
                      )}
                      {p.allowCustomBranding && (
                        <span className="mr-1">Branding</span>
                      )}
                      {p.enableGoogleReviews && (
                        <span className="mr-1">GoogleReviews</span>
                      )}
                      {p.enableBulkSlots && (
                        <span className="mr-1">BulkSlots</span>
                      )}
                      {p.enableExports && (
                        <span className="mr-1">Exports</span>
                      )}
                      {p.enableAuditLogs ? (
                        <span>AuditOn</span>
                      ) : (
                        <span>AuditOff</span>
                      )}
                    </td>
                    <td className="py-2 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleViewLog(p)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        disabled={!p.enableAuditLogs}
                      >
                        View Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
