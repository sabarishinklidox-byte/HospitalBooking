import React, { useState, useRef, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'framer-motion';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

// --- SHINY TEXT COMPONENT (Single Play Logic) ---
const ShinyText = ({ text, speed = 2, color = '#b5b5b5', shineColor = '#ffffff', spread = 120, delay = 0 }) => {
  const progress = useMotionValue(0);
  const animationDuration = speed * 1000;
  const startTime = useRef(null);
  const [isFinished, setIsFinished] = useState(false);

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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Strength calculation logic
  const getStrength = (val) => {
    if (val.length === 0) return 0;
    if (val.length < 6) return 33;
    if (val.length < 10) return 66;
    return 100;
  };

  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (!token) return toast.error('Invalid or expired reset link');

    try {
      setLoading(true);
      await api.post('/public/reset-password', { token, password });
      toast.success('Password updated successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* LEFT SIDE: Brand Identity */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#002244] flex-col justify-center px-20 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-teal-500/5 rounded-full blur-[120px] animate-pulse" />
        
        <div className="relative z-10">
          <div className="mb-10">
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-teal-400 font-bold tracking-[0.4em] uppercase text-xs block mb-4"
            >
              Security Portal
            </motion.span>
            <h1 className="text-7xl lg:text-8xl font-black tracking-tighter leading-none flex items-center">
              <ShinyText text="Doc" speed={2.5} color="#2dd4bf" shineColor="#ffffff" delay={0.5} />
              <ShinyText text="Book" speed={2.5} color="#ffffff" shineColor="#38bdf8" delay={0.8} />
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="h-1.5 bg-teal-400 mt-8 rounded-full shadow-[0_0_20px_rgba(45,212,191,0.4)]" 
            />
          </div>
          <p className="text-2xl text-blue-100/60 leading-relaxed max-w-md font-medium italic">
            "Reset your credentials safely to regain access to your healthcare dashboard."
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Reset Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white relative">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">New Password</h2>
            <p className="text-slate-500 font-medium italic">Secure your account with a strong password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-teal-500/40 outline-none font-medium text-slate-700 transition-all"
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-600 text-[10px] font-black uppercase hover:text-[#003366] transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              
              {/* Strength Indicator */}
              <div className="px-1 pt-1">
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ 
                      width: `${strength}%`,
                      backgroundColor: strength < 40 ? "#ef4444" : strength < 70 ? "#f59e0b" : "#10b981"
                    }}
                    className="h-full" 
                  />
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
              <input 
                type="password" 
                required 
                value={confirm} 
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-teal-500/40 outline-none font-medium text-slate-700 transition-all"
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 rounded-2xl font-black text-white bg-[#003366] hover:bg-teal-600 shadow-[0_20px_40px_-10px_rgba(0,51,102,0.3)] hover:shadow-teal-500/20 transition-all duration-500 transform active:scale-[0.96] mt-4 uppercase tracking-[0.2em] text-xs"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <button 
            type="button" 
            onClick={() => navigate('/login')}
            className="mt-10 w-full text-center text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase hover:text-[#003366] transition-all"
          >
            ← Back to Login
          </button>
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