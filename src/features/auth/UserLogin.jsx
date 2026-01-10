import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';
import { loginUser, clearError } from "./authSlice";
import { toast } from "react-hot-toast";

// --- SHINY TEXT COMPONENT (Single Play Logic) ---
const ShinyText = ({ text, speed = 2, color = '#b5b5b5', shineColor = '#ffffff', spread = 120, delay = 0 }) => {
  const progress = useMotionValue(0);
  const animationDuration = speed * 1000;
  const startTime = React.useRef(null);
  const [isFinished, setIsFinished] = React.useState(false);

  useAnimationFrame(time => {
    if (isFinished) return;
    if (startTime.current === null) startTime.current = time + (delay * 1000);
    if (time < startTime.current) return;

    const elapsed = time - startTime.current;
    const p = Math.min((elapsed / animationDuration) * 100, 100);
    progress.set(p);
    if (p >= 100) setIsFinished(true);
  });

  const backgroundPosition = useTransform(progress, [0, 100], ["150% center", "-50% center"]);

  const gradientStyle = {
    backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 40%, ${shineColor} 50%, ${color} 60%, ${color} 100%)`,
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block'
  };

  return <motion.span style={{ ...gradientStyle, backgroundPosition }}>{text}</motion.span>;
};

export default function UserLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const origin = location.state?.from?.pathname || location.state?.from || "/";

  useEffect(() => {
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate(origin, { replace: true });
    }
  }, [user, origin, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginUser(form));
  };

  return (
<div className="min-h-screen flex bg-[#f8fafc] font-sans overflow-hidden">
  {/* LEFT SIDE: Brand Identity */}
  <div className="hidden lg:flex lg:w-1/2 bg-[#001a33] flex-col justify-center px-16 xl:px-24 relative overflow-hidden">
  
  {/* Dynamic Background */}
  <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-sky-600/20 rounded-full blur-[120px] animate-pulse" />
  <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-teal-500/10 rounded-full blur-[100px]" />
  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#38bdf8 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

  <div className="relative z-10">
    <div className="mb-12">
      
      {/* ✅ FIXED: BIG Logo - NO borders, centered */}
     

      {/* Typography */}
      <div className="space-y-2">
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 font-bold tracking-widest uppercase text-sm">
          <span className="w-2 h-2 bg-sky-400 rounded-full mr-2 animate-ping" />
          Secure Enterprise Access
        </span>
        
       <h1 className="text-6xl xl:text-[5.5rem] font-black tracking-tighter leading-[1.0] flex flex-col items-start">
  {/* First Line: Inklidox */}
  <div className="relative inline-block overflow-visible pb-1">
    <ShinyText 
      text="Inklidox" 
      speed={3} 
      color="#38bdf8" 
      shineColor="#ffffff" 
    />
  </div>

  {/* Second Line: Bookings */}
  <div className="relative inline-block overflow-visible mt-[-0.1em]">
    <ShinyText 
      text="Bookings" 
      speed={3} 
      color="#ffffff" 
      shineColor="#38bdf8" 
      delay={0.8} 
    />
  </div>
</h1>
      </div>
      
      {/* Divider */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 140 }}
        transition={{ delay: 1.2, duration: 1.2 }}
        className="h-1.5 bg-gradient-to-r from-sky-400 via-teal-400 to-transparent mt-12 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.4)]" 
      />
    </div>

    {/* Quote */}
    <p className="text-xl xl:text-2xl text-slate-200/90 leading-relaxed max-w-lg font-light bg-white/5 backdrop-blur-sm px-6 py-5 rounded-2xl border border-white/10 shadow-xl">
      "Manage your appointments and medical records in one professional dashboard."
    </p>
  </div>
</div>

      {/* RIGHT SIDE: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Patient Login</h2>
            <p className="text-slate-500 font-medium italic">Sign in to continue your care.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm p-4 rounded-r-xl flex items-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={form.email} 
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
                placeholder="you@example.com" 
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs font-black text-[#003366] hover:text-teal-600 transition-colors uppercase tracking-widest">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  value={form.password} 
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#003366] text-[10px] font-black uppercase hover:text-teal-600 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-white bg-[#003366] hover:bg-teal-600 shadow-[0_15px_30px_-10px_rgba(0,51,102,0.4)] hover:shadow-teal-500/30 transition-all duration-500 transform active:scale-[0.97] mt-4 uppercase tracking-widest text-sm"
            >
              {loading ? "Verifying..." : "Sign In to Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-500">
            New to DocBook? {' '}
            <Link to="/signup" className="text-[#003366] hover:text-teal-600 transition-all underline underline-offset-4 decoration-2 decoration-teal-500/20 hover:decoration-teal-500">
              Create Free Account
            </Link>
          </p>

          {/* Role Login Divider */}
          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Switch Portal</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* LARGE PORTAL BUTTONS */}
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/doctor/login" 
              target="_blank" 
              className="group flex flex-col items-center justify-center py-5 px-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-teal-500 hover:bg-teal-50 transition-all duration-300 shadow-sm"
            >
              <span className="text-sm font-black text-slate-800 group-hover:text-teal-700 tracking-wide uppercase">Doctor Portal</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Provider Login</span>
            </Link>

            <Link 
              to="/super-admin/login" 
              target="_blank" 
              className="group flex flex-col items-center justify-center py-5 px-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-[#003366] hover:bg-blue-50 transition-all duration-300 shadow-sm"
            >
              <span className="text-sm font-black text-slate-800 group-hover:text-[#003366] tracking-wide uppercase">Admin Portal</span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">System Management</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1.2s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}