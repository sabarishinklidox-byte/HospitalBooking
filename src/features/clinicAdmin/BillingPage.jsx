// src/features/admin/BillingPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import toast from 'react-hot-toast';
import { useAdminContext } from '../../context/AdminContext.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

export default function BillingPage() {
  const {
    clinic,
    plan: currentPlan,
    reloadAdmin,
    loading: ctxLoading,
  } = useAdminContext();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradingPlanId, setUpgradingPlanId] = useState(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.PUBLIC.PLANS);
      setPlans(res.data.filter((p) => p.isActive && !p.deletedAt));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleUpgrade = async (targetPlanId) => {
    if (!window.confirm('Switch to this plan for your clinic?')) return;
    setUpgradingPlanId(targetPlanId);
    try {
      await api.post(ENDPOINTS.ADMIN.SUBSCRIPTION_UPGRADE, {
        planId: targetPlanId,
      });
      await reloadAdmin(); // refresh admin + clinic + plan
      toast.success('Plan upgraded successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to upgrade plan');
    } finally {
      setUpgradingPlanId(null);
    }
  };

  if (ctxLoading || loading) {
    return (
      <ClinicAdminLayout>
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Loader />
        </div>
      </ClinicAdminLayout>
    );
  }

  return (
    <ClinicAdminLayout>
      <div className="mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription &amp; Billing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your subscription plan for {clinic?.name}.
          </p>
        </div>

        {/* Current plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Current Plan
          </h2>
          {currentPlan ? (
            <>
              <p className="text-gray-800 font-semibold">
                {currentPlan.name}{' '}
                <span className="text-sm text-gray-500">
                  ({currentPlan.currency}{' '}
                  {Number(currentPlan.priceMonthly)} / month)
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max {currentPlan.maxDoctors} doctors,{' '}
                {currentPlan.maxBookingsPerMonth} bookings per plan period.
                {currentPlan.durationDays
                  ? ` Duration: ${currentPlan.durationDays} days.`
                  : ' Duration: monthly.'}
                {currentPlan.isTrial && ' This is a trial plan.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No active plan linked.</p>
          )}
        </div>

        {/* Available plans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Available Plans
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentPlan && plan.id === currentPlan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 text-sm ${
                    isCurrent
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 shadow-sm'
                  }`}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {plan.currency} {Number(plan.priceMonthly)}
                    </span>
                    <span className="text-gray-500"> / month</span>
                  </p>

                  <ul className="space-y-1 mb-4 text-xs text-gray-600">
                    <li>• Up to {plan.maxDoctors} doctors</li>
                    <li>
                      • {plan.maxBookingsPerMonth} bookings per plan period
                    </li>
                    <li>
                      •{' '}
                      {plan.durationDays
                        ? `${plan.durationDays} day plan`
                        : 'Monthly plan'}
                      {plan.isTrial && ' · Trial'}
                    </li>
                    {plan.allowOnlinePayments && (
                      <li>• Online payments</li>
                    )}
                    {plan.allowCustomBranding && (
                      <li>• Custom branding</li>
                    )}
                    {plan.enableBulkSlots && (
                      <li>• Bulk slot creation</li>
                    )}
                    {plan.enableExports && (
                      <li>• Export bookings (Excel &amp; PDF)</li>
                    )}
                    {plan.enableAuditLogs && (
                      <li>• Admin audit logs</li>
                    )}
                  </ul>

                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2 rounded bg-gray-100 text-gray-500 text-xs font-semibold cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgradingPlanId === plan.id}
                      className="w-full py-2 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      {upgradingPlanId === plan.id
                        ? 'Upgrading...'
                        : 'Switch to this Plan'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ClinicAdminLayout>
  );
}
