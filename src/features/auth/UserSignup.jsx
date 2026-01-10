import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { loginUser } from './authSlice';

// --- SHINY TEXT COMPONENT (Single Play Logic) ---
const ShinyText = ({ text, speed = 2, color = '#b5b5b5', shineColor = '#ffffff', spread = 120, delay = 0 }) => {
  const progress = useMotionValue(0);
  const animationDuration = speed * 1000;
  const startTime = useRef(null);
  const [isFinished, setIsFinished] = useState(false);

  useAnimationFrame(time => {
    if (isFinished) return;
    
    // Account for delay
    if (startTime.current === null) {
      startTime.current = time + (delay * 1000);
    }
    
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

// --- COUNTUP COMPONENT ---
const CountUp = memo(({ end, label, delay = 0 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const endVal = parseInt(end.replace(/\D/g, ''));
      const duration = 2000;
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setCount(Math.floor(progress * endVal));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [end, delay]);

  return (
    <div className="flex flex-col">
      <span className="text-3xl font-black text-white leading-none">
        {count.toLocaleString()}{end.includes('+') ? '+' : ''}
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-bold mt-2">{label}</span>
    </div>
  );
});

export default function UserSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    try {
      setLoading(true);
      await api.post('/user/signup', form);
      const res = await dispatch(loginUser({ email: form.email, password: form.password }));
      
      if (res.meta.requestStatus === 'rejected') {
        toast.success('Account created! Please log in.');
        return navigate('/login', { state: location.state });
      }
      toast.success('Welcome to DocBook!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
 <div className="min-h-screen flex bg-[#001a33] font-sans overflow-x-hidden">
  {/* LEFT SIDE: Brand & Info */}
  <div className="hidden lg:flex lg:w-1/2 bg-[#001a33] flex-col justify-center px-8 xl:px-24 relative overflow-hidden border-r border-white/5">
    
    {/* Background Accents - Matching Login Page Colors */}
    <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-sky-600/10 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-5%] left-[-5%] w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-[100px]" />

    <div className="relative z-10 w-full max-w-xl">
      <div className="mb-8">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-teal-400 font-bold tracking-[0.3em] uppercase text-xs block mb-4"
        >
          Welcome to
        </motion.span>
        
        {/* Adjusted sizes for responsiveness: text-5xl on small laptops, 7xl on desktops */}
        <h1 className="text-5xl xl:text-7xl font-black tracking-tighter leading-[1.1] flex flex-col">
          <ShinyText 
            text="Inklidox" 
            speed={2} 
            color="#38bdf8" 
            shineColor="#ffffff" 
            delay={0.5} 
          />
          <ShinyText 
            text="Bookings" 
            speed={2} 
            color="#ffffff" 
            shineColor="#38bdf8" 
            delay={0.8} 
          />
        </h1>
        
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="h-1.5 bg-gradient-to-r from-teal-400 to-sky-500 mt-6 rounded-full shadow-[0_0_20px_rgba(45,212,191,0.4)]" 
        />
      </div>

      {/* Hero Subtext - Reduced font size slightly for better fit */}
      <p className="text-lg xl:text-xl text-blue-100/70 leading-relaxed mb-12 font-medium italic border-l-2 border-teal-500/30 pl-6">
        "Join India's premium healthcare network. Connect with world-class specialists in clicks."
      </p>

      {/* Stats Section - Responsive Grid */}
      <div className="grid grid-cols-3 gap-4 xl:gap-8">
        <div className="flex flex-col">
          <CountUp end="50K+" className="text-2xl xl:text-3xl font-bold text-white" />
          <span className="text-teal-400/60 text-xs uppercase tracking-widest font-bold mt-1">Patients</span>
        </div>
        <div className="flex flex-col">
          <CountUp end="500+" className="text-2xl xl:text-3xl font-bold text-white" />
          <span className="text-teal-400/60 text-xs uppercase tracking-widest font-bold mt-1">Doctors</span>
        </div>
        <div className="flex flex-col">
          <CountUp end="100+" className="text-2xl xl:text-3xl font-bold text-white" />
          <span className="text-teal-400/60 text-xs uppercase tracking-widest font-bold mt-1">Cities</span>
        </div>
      </div>
    </div>
  </div>

      {/* RIGHT SIDE: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md py-10">
          <div className="mb-10 space-y-2">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 font-medium italic">Join the medical revolution.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">Full Name</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
                placeholder="John Doe" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">Email Address</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
                placeholder="john@example.com" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all outline-none font-medium text-slate-800"
                placeholder="+91 00000 00000" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1 relative">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" required value={form.password} onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none font-medium text-slate-800"
                    placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#003366] text-[10px] font-black uppercase hover:text-teal-600 transition-colors">
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 ml-1">Confirm</label>
                <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none font-medium text-slate-800"
                  placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-white bg-[#003366] hover:bg-teal-600 shadow-[0_15px_30px_-10px_rgba(0,51,102,0.4)] hover:shadow-teal-500/30 transition-all duration-500 transform active:scale-[0.97] mt-4 uppercase tracking-widest text-sm"
            >
              {loading ? "Processing..." : "Create My Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-500">
            Already have an account? {' '}
            <Link to="/login" className="text-[#003366] hover:text-teal-600 transition-all underline underline-offset-4 decoration-2 decoration-teal-500/20 hover:decoration-teal-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}