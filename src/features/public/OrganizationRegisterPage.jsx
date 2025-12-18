// src/features/public/OrganizationRegisterPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';
import { setUser, setClinic } from "../auth/authSlice"// ✅ Import Redux actions

export default function OrganizationRegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ Initialize Redux dispatch

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [form, setForm] = useState({
    clinicName: '',
    clinicPhone: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    planId: '',
    ownerPassword: '',
  });

  const preselectedPlanId = searchParams.get('planId') || '';

  useEffect(() => {
    const loadPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await api.get(ENDPOINTS.PUBLIC.PLANS);
        const activePlans = res.data.filter(
          (p) => p.isActive && !p.deletedAt
        );
        setPlans(activePlans);

        if (preselectedPlanId && activePlans.length > 0) {
          const exists = activePlans.find((p) => p.id === preselectedPlanId);
          if (exists) {
            setForm((prev) => ({ ...prev, planId: preselectedPlanId }));
          }
        }
      } catch (err) {
        toast.error('Failed to load plans');
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, [preselectedPlanId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.clinicName || !form.clinicPhone) {
      toast.error('Clinic name and phone are required');
      return;
    }

    if (!form.planId) {
      toast.error('Please select a subscription plan');
      return;
    }

    if (!form.ownerPassword || form.ownerPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setRegistering(true);
    try {
      const res = await api.post(ENDPOINTS.PUBLIC.ORGANIZATION_REGISTER, form);
      
      // ✅ Store JWT token in localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('authToken', res.data.token);

      // ✅ Dispatch Redux actions to sync state
      dispatch(setUser(res.data.user));
      dispatch(setClinic(res.data.clinic));

      toast.success(`Welcome ${res.data.user.name}! Your clinic is ready.`);
      
      // ✅ Redirect to Clinic Admin Dashboard (already logged in)
      navigate('admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">
          Register Your Clinic / Organization
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Organization details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Clinic / Organization Name*
              </label>
              <input
                name="clinicName"
                className="input w-full"
                value={form.clinicName}
                onChange={handleChange}
                required
                placeholder="e.g. City Care Hospital"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Clinic Phone Number*
              </label>
              <input
                name="clinicPhone"
                type="tel"
                className="input w-full"
                value={form.clinicPhone}
                onChange={handleChange}
                required
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Owner Full Name*
              </label>
              <input
                name="ownerName"
                className="input w-full"
                value={form.ownerName}
                onChange={handleChange}
                required
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Owner Email*
              </label>
              <input
                type="email"
                name="ownerEmail"
                className="input w-full"
                value={form.ownerEmail}
                onChange={handleChange}
                required
                placeholder="owner@clinic.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Owner Phone
              </label>
              <input
                name="ownerPhone"
                type="tel"
                className="input w-full"
                value={form.ownerPhone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Owner Password*
              </label>
              <input
                type="password"
                name="ownerPassword"
                className="input w-full"
                value={form.ownerPassword}
                onChange={handleChange}
                required
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">
                Address Line
              </label>
              <input
                name="addressLine1"
                className="input w-full"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="Full street address"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                City
              </label>
              <input
                name="city"
                className="input w-full"
                value={form.city}
                onChange={handleChange}
                placeholder="Mumbai"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                State
              </label>
              <input
                name="state"
                className="input w-full"
                value={form.state}
                onChange={handleChange}
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                Pincode
              </label>
              <input
                name="pincode"
                className="input w-full"
                value={form.pincode}
                onChange={handleChange}
                placeholder="400001"
              />
            </div>
          </div>

          {/* Plan selection */}
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Choose Subscription Plan*
            </label>
            {loadingPlans ? (
              <p className="text-sm text-slate-500">Loading plans...</p>
            ) : plans.length === 0 ? (
              <p className="text-sm text-red-500">
                No active plans configured. Please contact support.
              </p>
            ) : (
              <select
                name="planId"
                className="input w-full mt-1"
                value={form.planId}
                onChange={handleChange}
                required
              >
                <option value="">Select a plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.currency} {p.priceMonthly} / month
                    {p.durationDays && ` · ${p.durationDays} days`}
                    {p.isTrial && ' · Trial'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loadingPlans || plans.length === 0 || registering}
            >
              {registering ? 'Registering...' : 'Register Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
