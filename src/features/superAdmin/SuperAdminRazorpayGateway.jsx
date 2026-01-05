
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SuperAdminLayout from "../../layouts/SuperAdminLayout.jsx";
import Loader from "../../components/Loader.jsx";
import api from "../../lib/api.js";
import { toast } from "react-hot-toast";      // 🔥 ADD
import { ENDPOINTS } from "../../lib/endpoints.js";  // 🔥 ADD


  // Your code is perfect below...


export default function SuperAdminRazorpayGateway() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gateway, setGateway] = useState(null);
  const [form, setForm] = useState({
    apiKey: '',
    secret: '',
    webhookSecret: '',
    isActive: true,
  });
  const [error, setError] = useState('');

  // Fetch gateway config
  useEffect(() => {
    fetchGateway();
  }, []);

  const fetchGateway = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(ENDPOINTS.SUPER_ADMIN.GATEWAY_RAZORPAY);
      setGateway(data);
      
      if (data.configured) {
        setForm(prev => ({
          ...prev,
          apiKey: data.gateway.apiKey || '',
          isActive: data.gateway.isActive,
        }));
      }
    } catch (err) {
      console.error('Fetch gateway error:', err);
      toast.error('Failed to load Razorpay settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.apiKey.trim() || !form.secret.trim()) {
      toast.error('Key ID and Secret are required');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post(ENDPOINTS.SUPER_ADMIN.GATEWAY_RAZORPAY, form);
      toast.success(data.message);
      
      // Clear secrets after save
      setForm(prev => ({ ...prev, secret: '', webhookSecret: '' }));
      await fetchGateway(); // Refresh data
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to save';
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate super admin Razorpay? Clinics cannot purchase plans.')) return;

    try {
      await api.delete(ENDPOINTS.SUPER_ADMIN.GATEWAY_RAZORPAY);
      toast.success('Razorpay deactivated');
      await fetchGateway();
    } catch (err) {
      toast.error('Deactivate failed');
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader />
        </div>
      </SuperAdminLayout>
    );
  }

  const isConfigured = gateway?.configured;

  return (
    <SuperAdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Razorpay Gateway</h1>
            <p className="mt-1 text-lg text-gray-600">
              Configure super admin Razorpay to receive clinic subscription payments
            </p>
          </div>
          
          {isConfigured && (
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              form.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {form.isActive ? 'Active' : 'Inactive'}
            </div>
          )}
        </div>

        {/* Status Card */}
        {isConfigured ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-800">Razorpay Active</h3>
                <p className="text-green-700">Clinics can purchase plans. Payments go to your Razorpay account.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-gray-500">Key ID</div>
                <div className="font-mono font-semibold">{gateway.gateway.apiKey}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-gray-500">Secret</div>
                <div>{gateway.gateway.secretMasked}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-gray-500">Status</div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  gateway.gateway.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {gateway.gateway.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-yellow-800">Not Configured</h3>
                <p className="text-yellow-700">Configure Razorpay to enable clinic subscriptions</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">Configuration</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razorpay Key ID <span className="text-red-500">*</span>
                </label>
                <input
                  name="apiKey"
                  type="text"
                  value={form.apiKey}
                  onChange={handleInputChange}
                  placeholder="rzp_test_xxxxxxxxxx"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  From Razorpay Dashboard → Settings → API Keys
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Secret <span className="text-red-500">*</span>
                </label>
                <input
                  name="secret"
                  type="password"
                  value={form.secret}
                  onChange={handleInputChange}
                  placeholder={isConfigured ? "Leave blank to keep existing" : "secret_xxxxxxxxxx"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!isConfigured}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret
              </label>
              <input
                name="webhookSecret"
                type="password"
                value={form.webhookSecret}
                onChange={handleInputChange}
                placeholder="whsec_xxxxxxxxxx (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                From Razorpay Dashboard → Webhooks
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-3 block text-sm font-medium text-gray-700">
                Enable Razorpay (allow clinics to purchase plans)
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" pathLength="1" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : isConfigured ? 'Update Settings' : 'Configure Razorpay'}
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleDeactivate}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Deactivate
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </SuperAdminLayout>
  );
}
