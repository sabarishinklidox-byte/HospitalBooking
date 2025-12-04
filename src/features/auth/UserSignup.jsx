import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import UserLayout from '../../layouts/UserLayout.jsx';

export default function UserSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      // CALLS: userSignup controller
      const res = await api.post('/user/signup', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      // Optional: keep user logged in immediately
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      alert('Account created successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-10">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-center text-[#0b3b5e] mb-2">
            Create Patient Account
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Sign up to book and manage your appointments.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="input w-full"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="input w-full"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="text"
                name="phone"
                className="input w-full"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="input w-full"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="input w-full"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-semibold text-white bg-[#0b3b5e] hover:bg-[#062739] transition disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#0b3b5e] underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </UserLayout>
  );
}
