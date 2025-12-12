import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';
import { setUser } from '../../features/auth/authSlice';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password && formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match.');
    return;
  }

  const payload = {
    name: formData.name,
    phone: formData.phone,
  };
  if (formData.password) payload.password = formData.password;

  try {
    setLoading(true);

    const res = await toast.promise(
      api.patch(ENDPOINTS.USER.PROFILE, payload),
      {
        loading: 'Saving your changes...',
        success: 'Profile updated successfully!',
        error: (err) =>
          err.response?.data?.error || 'Failed to update profile.',
      }
    );

    dispatch(setUser(res.data));
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
  } catch {
    // handled by toast.promise
  } finally {
    setLoading(false);
  }
};


  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#003366] mb-8">Account Settings</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT COLUMN: User Avatar / Info Card */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center h-full">
              <div className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
                👨‍💼
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
              <div className="w-full border-t border-gray-100 pt-4 mt-auto">
                <p className="text-xs text-gray-400">
                  Member since {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Form Inputs */}
          <div className="md:col-span-2 space-y-6">
            {/* Card 1: Personal Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <span className="bg-blue-50 p-2 rounded-lg text-blue-600">👤</span>
                <h3 className="text-lg font-bold text-gray-800">Personal Details</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Security */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <span className="bg-purple-50 p-2 rounded-lg text-purple-600">🔒</span>
                <h3 className="text-lg font-bold text-gray-800">Security</h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 italic">
                  Leave blank to keep your current password.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#003366] text-white font-bold rounded-xl shadow-lg hover:bg-[#002244] transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </UserLayout>
  );
}
