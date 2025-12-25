// src/features/admin/BillingPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import toast from 'react-hot-toast';
import { useAdminContext } from '../../context/AdminContext.jsx';
import { ENDPOINTS } from '../../lib/endpoints';

// --- HELPER: Calculate Exact Time Remaining ---
const calculateTimeLeft = (startDate, durationDays) => {
  if (!startDate || !durationDays) return null;

  const start = new Date(startDate);
  const expiryDate = new Date(start);
  expiryDate.setDate(start.getDate() + durationDays);

  const now = new Date();
  const difference = expiryDate - now;

  // Check if expired
  if (difference <= 0) return { expired: true, expiryDate };

  // Calculate units
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((difference / 1000 / 60) % 60);

  return {
    expired: false,
    days,
    hours,
    minutes,
    expiryDate: expiryDate.toLocaleDateString() + ' ' + expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export default function BillingPage() {
  const {
    clinic,
    plan: currentPlan,
    reloadAdmin,
    loading: ctxLoading,
  } = useAdminContext();

  // Get the subscription object directly from the clinic data
  const currentSubscription = clinic?.subscription;

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradingPlanId, setUpgradingPlanId] = useState(null);
  
  // State for the countdown timer
  const [timeLeft, setTimeLeft] = useState(null);

  // --- EFFECT: Update Timer Every Minute ---
  useEffect(() => {
    if (currentSubscription?.startDate && currentSubscription?.durationDays) {
      const updateTimer = () => {
        const left = calculateTimeLeft(currentSubscription.startDate, currentSubscription.durationDays);
        setTimeLeft(left);
      };

      updateTimer(); // Run immediately
      const interval = setInterval(updateTimer, 60000); // Update every 60 seconds

      return () => clearInterval(interval);
    }
  }, [currentSubscription]);

  // --- FUNCTION: Load Available Plans ---
  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.PUBLIC.PLANS);
      
      let plansData = [];
      if (Array.isArray(res.data)) {
        plansData = res.data;
      } else if (res.data && Array.isArray(res.data.plans)) {
        plansData = res.data.plans;
      } else if (res.data && Array.isArray(res.data.data)) {
        plansData = res.data.data;
      } else {
        console.error('No valid plans array:', res.data);
        setPlans([]);
        return;
      }
      
      setPlans(plansData.filter((p) => p.isActive && !p.deletedAt));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // --- FUNCTION: Upgrade Plan ---
  const handleUpgrade = async (targetPlanId) => {
    if (!window.confirm('Switch to this plan for your clinic?')) return;
    setUpgradingPlanId(targetPlanId);
    try {
      await api.post(ENDPOINTS.ADMIN.SUBSCRIPTION_UPGRADE, {
        planId: targetPlanId,
      });
      await reloadAdmin(); // refresh admin + clinic + plan context
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

        {/* --- NEW SECTION: LIVE COUNTDOWN TIMER --- */}
        {currentPlan && timeLeft && (
          <div className={`rounded-xl shadow-sm border p-6 mb-8 flex flex-col md:flex-row items-center justify-between transition-colors duration-500 ${
            timeLeft.expired ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
          }`}>
            <div>
              <h2 className={`text-lg font-bold flex items-center gap-2 ${timeLeft.expired ? 'text-red-700' : 'text-blue-900'}`}>
                {timeLeft.expired ? (
                  <>⚠️ Plan Expired</>
                ) : (
                  <>⏳ Time Remaining</>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Started on: {new Date(currentSubscription.startDate).toLocaleDateString()}
              </p>
              {!timeLeft.expired && (
                <p className="text-sm text-gray-600">
                  Expires on: <strong>{timeLeft.expiryDate}</strong>
                </p>
              )}
            </div>

            <div className="mt-4 md:mt-0">
               {!timeLeft.expired ? (
                 <div className="flex gap-3 text-center">
                    <div className="bg-white p-3 rounded-lg shadow-sm w-20 border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{timeLeft.days}</div>
                      <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Days</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm w-20 border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{timeLeft.hours}</div>
                      <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Hours</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm w-20 border border-blue-100">
                       <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes}</div>
                       <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Mins</div>
                    </div>
                 </div>
               ) : (
                 <button 
                   onClick={() => document.getElementById('plans-grid').scrollIntoView({ behavior: 'smooth' })}
                   className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition-colors animate-pulse"
                 >
                   Renew / Upgrade Now
                 </button>
               )}
            </div>
          </div>
        )}

        {/* Current plan details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Current Plan Details
          </h2>
          {currentPlan ? (
            <>
              <p className="text-gray-800 font-semibold text-lg">
                {currentPlan.name}{' '}
                <span className="text-base text-gray-500 font-normal">
                  ({currentPlan.currency} {Number(currentPlan.priceMonthly)} / month)
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Limits: Max {currentPlan.maxDoctors} doctors, {currentPlan.maxBookingsPerMonth} bookings/mo.
              </p>
              <p className="text-sm text-gray-500">
                Type: {currentPlan.durationDays ? `${currentPlan.durationDays} days` : 'Monthly'}
                {currentPlan.isTrial && ' (Trial Mode)'}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No active plan linked.</p>
          )}
        </div>

        {/* Available plans */}
        <div id="plans-grid" className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Available Plans
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = currentPlan && plan.id === currentPlan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 text-sm transition-all ${
                    isCurrent
                      ? 'border-blue-500 shadow-md bg-blue-50/30'
                      : 'border-gray-200 shadow-sm hover:shadow-md'
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

                  <ul className="space-y-1.5 mb-6 text-xs text-gray-600 mt-4">
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        Up to {plan.maxDoctors} doctors
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {plan.maxBookingsPerMonth} bookings / period
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        {plan.durationDays ? `${plan.durationDays} day plan` : 'Monthly plan'}
                        {plan.isTrial && ' · Trial'}
                    </li>

                    {plan.enableGoogleReviews && (
                      <li className="flex items-center gap-2 text-green-700 font-medium">
                        <span className="text-green-500">✓</span> Google Ratings & Reviews
                      </li>
                    )}
                    
                    {/* Extra Features */}
                    {plan.allowOnlinePayments && <li>• Online payments</li>}
                    {plan.enableExports && <li>• Export data</li>}
                  </ul>

                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded bg-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wide cursor-default border border-gray-200"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgradingPlanId === plan.id}
                      className="w-full py-2.5 rounded bg-[#003366] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#002244] disabled:opacity-60 transition-colors"
                    >
                      {upgradingPlanId === plan.id
                        ? 'Processing...'
                        : 'Switch to Plan'}
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
