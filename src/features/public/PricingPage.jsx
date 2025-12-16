import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ENDPOINTS } from "../../lib/endpoints";
/* ------------------ Animations ------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const doctorShake = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    rotate: [0, -10, 10, -8, 8, 0],
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
};

/* ------------------ Component ------------------ */

export default function PricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        const res = await api.get(ENDPOINTS.PUBLIC.PLANS);
        setPlans(res.data.filter(p => p.isActive && !p.deletedAt));
      } catch {
        toast.error('Failed to load plans');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ---------------- Top Bar ---------------- */}
        <div className="flex justify-between items-center mb-10">
          <div className="font-bold text-xl text-slate-800">Clinic SaaS</div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/login')}
              className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-md text-sm hover:bg-blue-50 transition"
            >
              Clinic Admin Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              Register Clinic
            </button>
          </div>
        </div>

        {/* ---------------- Heading + Doctor Shake ---------------- */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <motion.div
            variants={doctorShake}
            className="text-5xl mb-4 origin-bottom inline-block"
          >
            👨‍⚕️
          </motion.div>

          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything your clinic needs to manage appointments professionally.
          </p>
        </motion.div>

        {/* ---------------- Plans ---------------- */}
        {loading ? (
          <p className="text-center text-slate-500">Loading plans...</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-red-500">No plans available.</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid md:grid-cols-3 gap-8"
          >
            {plans.map(plan => (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl shadow-md p-7 border border-slate-200 hover:border-blue-500 transition"
              >
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">
                    {plan.currency} {Number(plan.priceMonthly)}
                  </span>
                  <span className="text-slate-500 text-sm"> / month</span>
                </div>

                <ul className="space-y-2 mb-8 text-sm">
                  <li>✅ Up to {plan.maxDoctors} doctors</li>
                  <li>✅ {plan.maxBookingsPerMonth} bookings / month</li>
                  <li className={plan.allowOnlinePayments ? 'text-emerald-700' : 'text-red-600'}>
                    {plan.allowOnlinePayments ? '✅' : '✕'} Online payments
                  </li>
                  <li className={plan.allowCustomBranding ? 'text-emerald-700' : 'text-red-600'}>
                    {plan.allowCustomBranding ? '✅' : '✕'} Custom branding
                  </li>
                  <li className={plan.enableReviews ? 'text-emerald-700' : 'text-red-600'}>
                    {plan.enableReviews ? '✅' : '✕'} Reviews & ratings
                  </li>
                  <li className={plan.enableBulkSlots ? 'text-emerald-700' : 'text-red-600'}>
                    {plan.enableBulkSlots ? '✅' : '✕'} Bulk slot creation
                  </li>
                  <li className={plan.enableExports ? 'text-emerald-700' : 'text-red-600'}>
                    {plan.enableExports ? '✅' : '✕'} Export reports
                  </li>
                  <li className={plan.enableAuditLogs ? 'text-emerald-700' : 'text-red-600'}>
                    {plan.enableAuditLogs ? '✅' : '✕'} Audit logs
                  </li>
                </ul>

                <button
                  onClick={() => navigate(`/register?planId=${plan.id}`)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
