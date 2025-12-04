// src/features/user/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { setUser } from '../../features/auth/authSlice'; // To update user name in navbar

export default function UserProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Pre-fill form with user data from Redux or fetch
    if (user) {
      setFormData((prev) => ({ ...prev, name: user.name, phone: user.phone || '' }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await api.patch('/user/profile', payload);
      
      // Update user state in Redux so navbar shows new name
      dispatch(setUser(res.data));
      
      setSuccess('Profile updated successfully!');
      // Clear password fields after success
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input w-full"
            />
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-6">
            <p className="text-sm text-gray-500">Leave password fields blank if you don't want to change your password.</p>
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input w-full"
                placeholder="Min. 6 characters"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input w-full"
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary px-6 py-2.5"
              disabled={loading}
            >
              {loading ? <Loader size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
