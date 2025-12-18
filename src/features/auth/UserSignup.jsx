import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import { loginUser } from './authSlice';

export default function UserSignup() {
  const navigate = useNavigate();
  const location = useLocation();        // contains state.from from booking page
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // 1) Signup
      await api.post('/user/signup', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      // 2) Auto-login
      const loginResult = await dispatch(
        loginUser({ email: form.email, password: form.password })
      );

      if (loginResult.meta.requestStatus === 'rejected') {
        toast.success('Account created! Please log in.');
        // keep from-state when going to login
        navigate('/login', { state: location.state });
        return;
      }

      toast.success('Account created and logged in!');

      // 3) Go back where user came from (booking page)
      const origin = location.state?.from?.pathname || '/';
      navigate(origin, { replace: true });

    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE */}
     <div className="hidden lg:flex lg:w-1/2 bg-[#003366] flex-col justify-center px-12 relative overflow-hidden">
  {/* Content */}
  <div className="relative z-10 text-white">
    <h1 className="text-5xl font-extrabold mb-6">Welcome to MediCare</h1>
    <p className="text-lg text-blue-100 leading-relaxed mb-8">
      Join thousands of patients managing their health appointments with ease.
    </p>

    <div className="flex gap-4">
      {[
        { value: "10K+", label: "Patients" },
        { value: "500+", label: "Top Doctors" },
        { value: "100+", label: "Cities" },
      ].map((item, i) => (
        <div
          key={i}
          className="bg-white/10 p-4 rounded-lg backdrop-blur-sm"
        >
          <h3 className="font-bold text-xl">{item.value}</h3>
          <p className="text-sm opacity-80">{item.label}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Backdrop blobs */}
  <div className="absolute top-[-15%] right-[-15%] w-[30rem] h-[30rem] bg-blue-500/20 rounded-full blur-3xl" />
  <div className="absolute bottom-[-15%] left-[-15%] w-[30rem] h-[30rem] bg-purple-500/20 rounded-full blur-3xl" />
</div>


      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500 mt-2">Sign up to book your first appointment</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="+1 234 567 890"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              state={location.state}  // keep { from, doctor } when going to login
              className="font-bold text-[#003366] hover:underline"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
