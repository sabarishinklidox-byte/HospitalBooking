// src/features/auth/UserLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Ensure useLocation is imported
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from './authSlice';
import UserLayout from '../../layouts/UserLayout.jsx';

export default function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location state
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    
    if (loginUser.fulfilled.match(result)) {
      // ✅ FIX: Check if we have a "from" location
      const fromPath = location.state?.from?.pathname;
      const savedDoctor = location.state?.doctor;

      if (fromPath) {
        // Redirect BACK to the Booking Page (with doctor data)
        navigate(fromPath, { 
          replace: true,
          state: { doctor: savedDoctor } // Pass doctor back so booking page doesn't crash
        });
      } else {
        // Default redirect if just logging in normally
        navigate('/my-appointments', { replace: true });
      }
    }
  };

  return (
    <UserLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-center text-[#0b3b5e] mb-2">Patient Login</h1>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" required className="input w-full" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required className="input w-full" value={formData.password} onChange={handleChange} />
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white bg-[#0b3b5e] hover:bg-[#062739] transition disabled:opacity-60">
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            New here? <Link to="/signup" className="font-semibold text-[#0b3b5e] underline">Create an account</Link>
          </p>
        </div>
      </div>
    </UserLayout>
  );
}
