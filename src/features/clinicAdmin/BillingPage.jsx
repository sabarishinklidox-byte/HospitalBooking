  // src/features/admin/BillingPage.jsx
  import React, { useEffect, useState } from 'react';
  import api from '../../lib/api';
  import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
  import Loader from '../../components/Loader.jsx';
  import toast from 'react-hot-toast';
  import { useAdminContext } from '../../context/AdminContext.jsx';
  import { ENDPOINTS } from '../../lib/endpoints';

  const calculateTimeLeft = (startDate, durationDays) => {
    if (!startDate || !durationDays) return null;
    const start = new Date(startDate);
    const expiryDate = new Date(start);
    expiryDate.setDate(start.getDate() + durationDays);
    const now = new Date();
    const difference = expiryDate - now;

    if (difference <= 0) return { expired: true, expiryDate };

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    return {
      expired: false,
      days,
      hours,
      minutes,
      expiryDate: expiryDate.toLocaleDateString() + ' ' + expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  export default function BillingPage() {
    const { clinic, plan: currentPlan, reloadAdmin, loading: ctxLoading } = useAdminContext();
    const currentSubscription = clinic?.subscription;
    const isExpiredStatus = currentSubscription?.status === 'EXPIRED';

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [upgradingPlanId, setUpgradingPlanId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
      if (currentSubscription?.startDate && currentSubscription?.durationDays) {
        const updateTimer = () => {
          setTimeLeft(calculateTimeLeft(currentSubscription.startDate, currentSubscription.durationDays));
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
      }
    }, [currentSubscription]);

    const isExpiredNow = isExpiredStatus || timeLeft?.expired;

    const loadPlans = async () => {
      setLoading(true);
      try {
        const res = await api.get(ENDPOINTS.PUBLIC.PLANS);
        let plansData = res.data?.plans || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setPlans(plansData.filter((p) => p.isActive && !p.deletedAt));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => { loadPlans(); }, []);

    const handleUpgrade = async (targetPlanId) => {
      if (!window.confirm(`Switch to this plan for ${clinic?.name}?`)) return;
      setUpgradingPlanId(targetPlanId);
      try {
        const { data } = await api.post(ENDPOINTS.ADMIN.SUBSCRIPTION_UPGRADE, { planId: targetPlanId });
        if (data.requiresPayment) {
          const options = {
            key: data.payment.key,
            amount: data.payment.amount,
            currency: data.payment.currency,
            order_id: data.payment.razorpayOrderId,
            name: 'Hospital Booking SaaS',
            description: `Upgrade to ${data.plan.name}`,
            handler: async (response) => {
              await api.post(ENDPOINTS.ADMIN.PAYMENT_VERIFY_PLAN, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('✅ Plan activated!');
              await reloadAdmin();
            },
            prefill: { 
              name: clinic?.name, 
              email: clinic?.email || clinic?.subscription?.admin?.email || '', 
              contact: clinic?.phone || '' 
            },
            theme: { color: '#003366' } // Back to original Navy
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          toast.success(data.message || 'Plan upgraded!');
          await reloadAdmin();
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Upgrade failed');
      } finally {
        setUpgradingPlanId(null);
      }
    };

    if (ctxLoading || loading) {
      return (
        <ClinicAdminLayout>
          <div className="w-full h-[60vh] flex items-center justify-center"><Loader /></div>
        </ClinicAdminLayout>
      );
    }

    return (
      <ClinicAdminLayout>
        <div className="mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your subscription plan for {clinic?.name}.</p>
          </div>

          {/* TIME REMAINING CARD */}
          {currentPlan && currentSubscription && (
            <div className={`rounded-xl shadow-sm border p-6 mb-8 flex flex-col md:flex-row items-center justify-between transition-colors duration-500 ${isExpiredNow ? 'bg-red-50 border-red-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'}`}>
              <div>
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isExpiredNow ? 'text-red-700' : 'text-blue-900'}`}>
                  {isExpiredNow ? <>⚠️ Plan Expired</> : <>⏳ Time Remaining</>}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Started: {new Date(currentSubscription.startDate).toLocaleDateString()}</p>
                {!isExpiredNow && timeLeft && <p className="text-sm text-gray-600">Expires on: <strong>{timeLeft.expiryDate}</strong></p>}
              </div>
              <div className="mt-4 md:mt-0">
                {!isExpiredNow && timeLeft ? (
                  <div className="flex gap-3 text-center">
                    {[ {v: timeLeft.days, l: 'Days'}, {v: timeLeft.hours, l: 'Hours'}, {v: timeLeft.minutes, l: 'Mins'} ].map(i => (
                      <div key={i.l} className="bg-white p-3 rounded-lg shadow-sm w-20 border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">{i.v}</div>
                        <div className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">{i.l}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => document.getElementById('plans-grid')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition-colors animate-pulse">
                    Renew / Upgrade Now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* CURRENT DETAILS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Current Plan Details</h2>
            {currentPlan ? (
              <>
                <p className="text-gray-800 font-semibold text-lg">
                  {currentPlan.name} <span className="text-base text-gray-500 font-normal">({currentPlan.currency} {Number(currentPlan.priceMonthly)} / {currentPlan.durationDays ? `${currentPlan.durationDays} days` : 'month'})</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">Limits: Max {currentPlan.maxDoctors} doctors, {currentPlan.maxBookingsPerMonth} bookings/period.</p>
                <p className="text-sm text-gray-500">Type: {currentPlan.durationDays ? `${currentPlan.durationDays} days` : 'Monthly'} {currentPlan.isTrial && ' (Trial Mode)'}</p>
              </>
            ) : <p className="text-sm text-gray-500">No active plan linked.</p>}
          </div>

          {/* PLANS GRID */}
          <div id="plans-grid" className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Available Plans</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const isCurrent = currentPlan && plan.id === currentPlan.id;
                const isCurrentAndActive = isCurrent && !isExpiredNow;
                const trialDays = plan.trialDays || (plan.durationDays && plan.isTrial ? plan.durationDays : 0);

                return (
                  <div key={plan.id} className={`flex flex-col rounded-lg border p-5 text-sm transition-all h-full ${isCurrent ? 'border-blue-500 ring-2 ring-blue-200/50 shadow-lg bg-blue-50/50' : 'border-gray-200 shadow-sm hover:shadow-md'}`}>
                    {trialDays > 0 && (
                      <div className="mb-4 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                        <span className="text-xs font-bold text-emerald-800">+{trialDays} Days FREE Trial</span>
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-blue-600">{plan.currency} {Number(plan.priceMonthly)}</p>
                      <p className="text-xs text-gray-500 lowercase">per {plan.durationDays ? `${plan.durationDays} days` : 'month'}</p>
                    </div>

                    <ul className="space-y-2 mb-6 text-gray-600 flex-grow">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>Up to {plan.maxDoctors} doctors</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>{plan.maxBookingsPerMonth} bookings / period</li>
                      {plan.enableGoogleReviews && <li className="flex items-center gap-2 text-green-700 font-medium"><span className="text-green-500 font-bold">✓</span> Google Ratings & Reviews</li>}
                      {plan.allowOnlinePayments && <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>Online payments</li>}
                    </ul>

                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgradingPlanId === plan.id || isCurrentAndActive}
                      className={`w-full py-3 rounded bg-[#003366] text-white text-xs font-bold uppercase tracking-wide hover:bg-[#002244] transition-colors mt-auto disabled:opacity-50`}
                    >
                      {upgradingPlanId === plan.id ? 'Processing...' : isCurrentAndActive ? 'Active Plan' : 'Switch to Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ClinicAdminLayout>
    );
  }