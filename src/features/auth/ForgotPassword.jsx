// src/features/auth/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // match your backend route: /api/forgot-password
      await api.post('/public/forgot-password', { email });
      toast.success('If an account exists, a reset link has been sent.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Forgot password
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-bold text-white bg-[#003366] hover:bg-[#002244] shadow-md hover:shadow-lg transition-all disabled:opacity-70"
          >
            {loading ? 'Sending link...' : 'Send reset link'}
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
