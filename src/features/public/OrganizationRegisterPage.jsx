import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';
import { setUser, setClinic } from '../auth/authSlice';
import { FiCheckCircle, FiChevronDown, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function OrganizationRegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [registering, setRegistering] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 3;

  const [form, setForm] = useState({
    clinicName: '',
    clinicPhone: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    // Address
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
    // Bank Details (New)
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    planId: '',
  });

  const preselectedPlanId = searchParams.get('planId') || '';

  useEffect(() => {
    const loadPlans = async () => {
      setLoadingPlans(true);
      setPlans([]);

      try {
        const res = await api.get(ENDPOINTS.PUBLIC.PLANS);

        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || res.data?.plans || res.data?.items || []);

        const activePlans = list.filter((p) => p.isActive !== false);

        setPlans(activePlans);

        if (preselectedPlanId) {
          const planExists = activePlans.some((p) => p.id === preselectedPlanId);
          if (planExists) {
            setForm((prev) => ({ ...prev, planId: preselectedPlanId }));
          }
        }
      } catch (err) {
        console.error('Plans load error:', err);
        toast.error('Failed to load plans');
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, [preselectedPlanId]);

  const handleChange = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.clinicName.trim()) return 'Clinic Name is required';
      if (!form.clinicPhone.trim()) return 'Clinic Phone is required';
    }
    if (step === 2) {
      if (!form.ownerName.trim()) return 'Owner Name is required';
      if (!form.ownerEmail.trim()) return 'Owner Email is required';
      if (!form.ownerPassword || form.ownerPassword.length < 6) {
        return 'Password must be 6+ chars';
      }
    }
    return null;
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) return toast.error(error);
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.planId) return toast.error('Please select a plan');

    setRegistering(true);
    try {
      const res = await api.post(ENDPOINTS.PUBLIC.ORGANIZATION_REGISTER, form);
      const { token, user, clinic } = res.data;

      localStorage.setItem('token', token);

      if (user) dispatch(setUser(user));
      if (clinic) dispatch(setClinic(clinic));

      toast.success(`Welcome ${user?.name || 'Admin'}!`);
      window.location.replace('/admin/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      {/* Left Panel – scrolls with page, no sticky */}
      <div className="hidden lg:flex w-1/3 bg-[#003366] text-white flex-col p-12 relative overflow-hidden min-h-screen">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Brand */}
          <div className="mb-10">
            <div
              className="text-2xl font-bold flex items-center gap-2 cursor-pointer select-none hover:opacity-90 transition-opacity"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lg font-bold">
                D
              </div>
              <span>DocBook</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold leading-tight mb-4">
              Start your clinic journey.
            </h2>
            <p className="text-blue-200 text-lg">
              Register in 3 steps. Choose a plan and go live today.
            </p>
          </div>

          {/* Features */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur-sm mb-6">
            <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-4">
              What you get
            </p>

            <div className="space-y-3 text-sm">
              <FeatureRow
                title="Online appointment booking"
                subtitle="Slots, confirmations, reschedules."
              />
              <FeatureRow
                title="Doctors, roles & access control"
                subtitle="Clinic admin, doctor, patient access."
              />
              <FeatureRow
                title="Notifications & email alerts"
                subtitle="Booking/reschedule alerts to staff."
              />
              <FeatureRow
                title="Billing & subscription plans"
                subtitle="Plan-based feature control."
              />
            </div>
          </div>

          {/* Footer text only */}
          <div className="mt-auto pt-6 text-xs text-blue-200 leading-relaxed">
            By continuing, you agree to the platform terms and privacy policy.
          </div>
        </div>
      </div>

      {/* Right Panel – cleaner layout, smaller card */}
      <div className="w-full lg:w-2/3 flex flex-col min-h-screen">
        <div className="px-4 py-10 sm:px-8 lg:px-12 w-full flex justify-center">
          <div className="w-full max-w-2xl">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Step {currentStep} of {TOTAL_STEPS}</span>
                <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}% Completed</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#003366] h-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-7 lg:p-8">
              <h1 className="text-2xl font-bold text-[#003366] mb-6">
                {currentStep === 1 && 'Clinic Details'}
                {currentStep === 2 && 'Owner Details'}
                {currentStep === 3 && 'Billing & Address'}
              </h1>

              <form onSubmit={handleSubmit}>
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <InputField
                      label="Clinic Name"
                      name="clinicName"
                      placeholder="e.g. City Care Hospital"
                      value={form.clinicName}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                    <InputField
                      label="Clinic Phone"
                      name="clinicPhone"
                      placeholder="+91 99442 54475"
                      value={form.clinicPhone}
                      onChange={handleChange}
                      required
                      type="tel"
                    />
                    <InputField
                      label="City"
                      name="city"
                      placeholder="Coimbatore"
                      value={form.city}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <InputField
                      label="Full Name"
                      name="ownerName"
                      placeholder="John Doe"
                      value={form.ownerName}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                    <InputField
                      label="Email Address"
                      name="ownerEmail"
                      placeholder="admin@clinic.com"
                      value={form.ownerEmail}
                      onChange={handleChange}
                      required
                      type="email"
                    />
                    <InputField
                      label="Mobile Number"
                      name="ownerPhone"
                      placeholder="+91 99442 54475"
                      value={form.ownerPhone}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Create Password"
                      name="ownerPassword"
                      placeholder="Minimum 6 characters"
                      value={form.ownerPassword}
                      onChange={handleChange}
                      required
                      type="password"
                    />
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Address */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase border-b pb-1 mb-4">
                        Location
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="Address Line"
                          name="addressLine1"
                          placeholder="Street, building, landmark"
                          value={form.addressLine1}
                          onChange={handleChange}
                          className="md:col-span-2"
                        />
                        <InputField
                          label="State"
                          name="state"
                          placeholder="Tamil Nadu"
                          value={form.state}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Pincode"
                          name="pincode"
                          placeholder="641001"
                          value={form.pincode}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Bank */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase border-b pb-1 mb-4">
                        Bank Details (Optional)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                          label="Bank Name"
                          name="bankName"
                          placeholder="HDFC Bank"
                          value={form.bankName}
                          onChange={handleChange}
                          className="md:col-span-2"
                        />
                        <InputField
                          label="Account Number"
                          name="accountNumber"
                          placeholder="123456789012"
                          value={form.accountNumber}
                          onChange={handleChange}
                        />
                        <InputField
                          label="IFSC Code"
                          name="ifscCode"
                          placeholder="HDFC0001234"
                          value={form.ifscCode}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Plan */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Select Plan <span className="text-red-500">*</span>
                      </label>
                      {loadingPlans ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                          Loading plans...
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            name="planId"
                            value={form.planId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white appearance-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] cursor-pointer pr-10"
                            required
                          >
                            <option value="" disabled>
                              -- Select Subscription Plan --
                            </option>
                            {plans.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} — {p.currency || 'INR'} {p.priceMonthly || p.price}/mo
                              </option>
                            ))}
                          </select>
                          <FiChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-500 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <FiArrowLeft className="w-5 h-5" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 rounded-xl font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ml-auto"
                    >
                      Next Step <FiArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={registering || loadingPlans}
                      className="px-8 py-3 rounded-xl font-bold text-white bg-[#4CAF50] hover:bg-[#388E3C] shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
                    >
                      {registering ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Register Now <FiCheckCircle className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Support line under card */}
            <p className="mt-4 text-xs text-slate-500 text-center">
              Need help? Email support@docbook.app or call +91-98765-43210.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const InputField = ({ label, className = '', required, ...props }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
      required={required}
      {...props}
    />
  </div>
);

const FeatureRow = ({ title, subtitle }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-bold">
      ✓
    </div>
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-blue-200 text-xs mt-0.5">{subtitle}</div>
    </div>
  </div>
);

const TrustRow = ({ text }) => (
  <div className="flex items-center gap-2">
    <span className="w-2 h-2 rounded-full bg-emerald-300" />
    {text}
  </div>
);
