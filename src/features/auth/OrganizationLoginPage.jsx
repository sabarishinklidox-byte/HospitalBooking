// src/features/auth/OrganizationLoginPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { loginUser } from '../../store/authSlice'; // your existing thunk

export default function OrganizationLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(location.search);
  const planIdFromQuery = searchParams.get('planId');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user;

        if (user.role !== 'ADMIN') {
          toast.error('Only clinic admins can log in here');
          return;
        }

        if (planIdFromQuery) {
          // came from pricing for upgrade
          navigate(`/admin/upgrade-plan?planId=${planIdFromQuery}`, {
            replace: true,
          });
        } else {
          // normal org login
          navigate('/admin/dashboard', { replace: true });
        }
      } else {
        toast.error(resultAction.payload || 'Login failed');
      }
    } catch (err) {
      toast.error('Login error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">
          Organization / Clinic Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              type="email"
              className="input w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
