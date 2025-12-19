import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';
import { setUser, setClinic } from "../auth/authSlice";
import { FiPhone, FiMail, FiCheckCircle, FiShield, FiChevronDown, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

export default function OrganizationRegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [registering, setRegistering] = useState(false);
  
  // Multi-step State
  const [currentStep, setCurrentStep] = useState(1);
  const TOTAL_STEPS = 3;

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

  // Load Plans
  useEffect(() => {
    const loadPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await api.get(ENDPOINTS.PUBLIC.PLANS);
        const activePlans = res.data.filter((p) => p.isActive && !p.deletedAt);
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

  // Validation per step
  const validateStep = (step) => {
      if (step === 1) {
          if (!form.clinicName) return "Clinic Name is required";
          if (!form.clinicPhone) return "Clinic Phone is required";
      }
      if (step === 2) {
          if (!form.ownerName) return "Owner Name is required";
          if (!form.ownerEmail) return "Owner Email is required";
          if (!form.ownerPassword || form.ownerPassword.length < 6) return "Password must be 6+ chars";
      }
      return null;
  };

  const nextStep = () => {
      const error = validateStep(currentStep);
      if (error) {
          toast.error(error);
          return;
      }
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const prevStep = () => {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.planId) return toast.error('Please select a plan');

    setRegistering(true);
    try {
      const res = await api.post(ENDPOINTS.PUBLIC.ORGANIZATION_REGISTER, form);
      
      // 1. Store Token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('authToken', res.data.token);

      // 2. Update Redux (Optional, but good practice)
      dispatch(setUser(res.data.user));
      dispatch(setClinic(res.data.clinic));

      toast.success(`Welcome ${res.data.user.name}!`);

      // 3. FIX: Force a hard reload to prevent Auth Guard loops
      // Use replace() to prevent going back to register page
      window.location.replace('/admin/dashboard'); 

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Registration failed');
      setRegistering(false); // Only stop loading if error. If success, we are reloading anyway.
    }
  };
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      
      {/* ---------------- LEFT PANEL (Sticky Sidebar) ---------------- */}
      <div className="hidden lg:flex w-1/3 bg-[#003366] text-white flex-col p-12 relative overflow-hidden h-screen sticky top-0">
        
        {/* Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#87CEEB] rounded-full mix-blend-overlay filter blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#4CAF50] rounded-full mix-blend-overlay filter blur-3xl opacity-10 pointer-events-none"></div>

        {/* Brand */}
        <div className="relative z-10 mb-auto">
          <div className="text-2xl font-bold mb-10 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
             <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center text-lg font-bold">D</div>
            <span className="group-hover:opacity-80 transition-opacity">
               DocBook<span className="text-[#87CEEB]"></span>
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-6 leading-tight">
            Start your professional journey.
          </h2>
          <p className="text-blue-200 mb-8">
            Create your account in 3 simple steps.
          </p>

          <ul className="space-y-4">
            {[
             
              "24/7 CUSTOMER SUPPORT",
              "Automated Reminders",
              "Multi-Doctor Support"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-blue-100">
                <FiCheckCircle className="text-[#4CAF50] flex-shrink-0" /> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Support Section (Bottom) */}
        <div className="relative z-10 bg-[#004080] rounded-xl p-6 border border-white/10 mt-10">
          <h4 className="font-bold text-[#87CEEB] mb-2 text-sm uppercase tracking-wider">Need Help?</h4>
          <p className="text-sm text-blue-100 mb-4">Our team is here to help you setup.</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <FiPhone className="text-white" />
              </div>
              <span>+91 98765 43210</span>
               <span>
info@inklidox.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT PANEL: Multi-Step Form ---------------- */}
      <div className="w-full lg:w-2/3 flex flex-col h-screen overflow-y-auto">
        <div className="flex-grow p-4 md:p-12 max-w-2xl mx-auto w-full flex flex-col justify-center">
            
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 flex justify-between items-center">
             <div className="text-xl font-bold text-[#003366]">DOCBOOK</div>
             <button onClick={() => navigate('/')} className="text-sm text-slate-500">Back</button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
             <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Step {currentStep} of {TOTAL_STEPS}</span>
                <span>{Math.round((currentStep / TOTAL_STEPS) * 100)}% Completed</span>
             </div>
             <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-[#003366] h-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                ></div>
             </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-[#003366] mb-6">
                {currentStep === 1 && "Clinic Details"}
                {currentStep === 2 && "Admin Owner Details"}
                {currentStep === 3 && "Plan & Address"}
            </h1>

            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Clinic Info */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fadeIn">
                  <InputField label="Clinic Name" name="clinicName" placeholder="e.g. City Care Hospital" value={form.clinicName} onChange={handleChange} required autoFocus />
                  <InputField label="Clinic Phone" name="clinicPhone" placeholder="+91..." value={form.clinicPhone} onChange={handleChange} required type="tel" />
                  <InputField label="City" name="city" placeholder="City" value={form.city} onChange={handleChange} />
                </div>
              )}

              {/* STEP 2: Owner Info */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-fadeIn">
                   <InputField label="Full Name" name="ownerName" placeholder="John Doe" value={form.ownerName} onChange={handleChange} required autoFocus />
                   <InputField label="Email Address" name="ownerEmail" placeholder="admin@clinic.com" value={form.ownerEmail} onChange={handleChange} required type="email" />
                   <InputField label="Mobile Number" name="ownerPhone" placeholder="+91..." value={form.ownerPhone} onChange={handleChange} />
                   <InputField label="Create Password" name="ownerPassword" placeholder="Min 6 chars" value={form.ownerPassword} onChange={handleChange} required type="password" />
                </div>
              )}

              {/* STEP 3: Plan & Address */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                   {/* Address */}
                   <div className="grid grid-cols-2 gap-4">
                      <InputField label="Address Line" name="addressLine1" placeholder="Street" value={form.addressLine1} onChange={handleChange} className="col-span-2" />
                      <InputField label="State" name="state" placeholder="State" value={form.state} onChange={handleChange} />
                      <InputField label="Pincode" name="pincode" placeholder="Zip" value={form.pincode} onChange={handleChange} />
                   </div>

                   {/* Plan Dropdown */}
                   <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Select Plan*</label>
                       {loadingPlans ? (
                          <div className="text-sm text-slate-500">Loading...</div>
                       ) : (
                          <div className="relative">
                             <select
                                name="planId"
                                value={form.planId}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white appearance-none focus:ring-2 focus:ring-[#003366] cursor-pointer"
                                required
                             >
                                <option value="" disabled>-- Select Subscription --</option>
                                {plans.map((p) => (
                                   <option key={p.id} value={p.id}>
                                      {p.name} — {p.currency} {p.priceMonthly}/mo {p.isTrial ? '(Trial)' : ''}
                                   </option>
                                ))}
                             </select>
                             <FiChevronDown className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                          </div>
                       )}
                   </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                 {currentStep > 1 ? (
                    <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition flex items-center gap-2"
                    >
                        <FiArrowLeft /> Back
                    </button>
                 ) : (
                    <div></div> // Spacer
                 )}

                 {currentStep < TOTAL_STEPS ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-3 rounded-lg font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-md hover:shadow-lg transition flex items-center gap-2"
                    >
                        Next Step <FiArrowRight />
                    </button>
                 ) : (
                    <button
                        type="submit"
                        disabled={registering}
                        className="px-8 py-3 rounded-lg font-bold text-white bg-[#4CAF50] hover:bg-[#388E3C] shadow-md hover:shadow-lg transition disabled:opacity-70 flex items-center gap-2"
                    >
                        {registering ? 'Creating...' : 'Register Now'} <FiCheckCircle />
                    </button>
                 )}
              </div>

            </form>
          </div>
        </div>
        
        {/* Footer Text */}
        <div className="p-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} INKLIDOX. Secure & Private.
        </div>
      </div>
    </div>
  );
}

// Reusable Input
const InputField = ({ label, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
      {...props}
    />
  </div>
);
