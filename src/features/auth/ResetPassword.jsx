// src/features/auth/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token'); // from ?token=...

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    try {
      setLoading(true);
      // match backend route: /api/reset-password
      await api.post('/public/reset-password', { token, password });
      toast.success('Password reset successful. Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Reset password
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-md hover:shadow-lg transition-all disabled:opacity-70"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-4 w-full text-sm text-center text-[#003366] hover:underline"
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
