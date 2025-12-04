import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';

export default function ClinicSettingsPage() {
  const [admin, setAdmin] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingClinic, setSavingClinic] = useState(false);
  const [savingGateway, setSavingGateway] = useState(false);
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    password: '',
  });

  const [clinicForm, setClinicForm] = useState({
    address: '',
    city: '',
    pincode: '',
    timings: '',
    details: '',
    logo: '',
    banner: '',
  });

  const [gatewayForm, setGatewayForm] = useState({
    provider: 'RAZORPAY',
    apiKey: '',
    secretKey: '',
    isActive: true,
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/profile');
      setAdmin(res.data.admin);
      setClinic(res.data.clinic);
      setProfileForm({
        name: res.data.admin.name || '',
        phone: res.data.admin.phone || '',
        password: '',
      });
      setClinicForm({
        address: res.data.clinic?.address || '',
        city: res.data.clinic?.city || '',
        pincode: res.data.clinic?.pincode || '',
        timings: res.data.clinic?.timings || '',
        details: res.data.clinic?.details || '',
        logo: res.data.clinic?.logo || '',
        banner: res.data.clinic?.banner || '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handleClinicChange = (e) =>
    setClinicForm({ ...clinicForm, [e.target.name]: e.target.value });

  const handleGatewayChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGatewayForm({
      ...gatewayForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setError('');
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
      };
      if (profileForm.password) {
        payload.password = profileForm.password;
      }
      const res = await api.patch('/admin/profile', payload);
      setAdmin(res.data.admin);
      setProfileForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const submitClinic = async (e) => {
    e.preventDefault();
    try {
      setSavingClinic(true);
      setError('');
      const res = await api.patch('/admin/clinic', clinicForm);
      setClinic(res.data.clinic);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update clinic');
    } finally {
      setSavingClinic(false);
    }
  };

  const submitGateway = async (e) => {
    e.preventDefault();
    try {
      setSavingGateway(true);
      setError('');
      await api.patch('/admin/clinic/gateway', gatewayForm);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update gateway');
    } finally {
      setSavingGateway(false);
    }
  };

  return (
    <ClinicAdminLayout>
      <div className="w-full px-3 sm:px-6">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight text-center sm:text-left"
          style={{ color: 'var(--color-primary)' }}
        >
          Settings
        </h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center sm:text-left">
            {error}
          </p>
        )}

        {loading ? (
          <Loader />
        ) : (
          <div className="space-y-6">
            {/* Admin Profile */}
            <section className="bg-white rounded-xl shadow p-4 sm:p-5">
              <h2 className="text-lg font-semibold mb-3">Admin Profile</h2>
              <p className="text-xs text-gray-500 mb-3">
                Update your name, phone, and password.
              </p>
              <form onSubmit={submitProfile} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Name
                    </label>
                    <input
                      name="name"
                      className="input w-full"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      className="input w-full bg-gray-100 cursor-not-allowed"
                      value={admin?.email || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Phone
                    </label>
                    <input
                      name="phone"
                      className="input w-full"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      New Password (optional)
                    </label>
                    <input
                      name="password"
                      type="password"
                      className="input w-full"
                      value={profileForm.password}
                      onChange={handleProfileChange}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </section>

            {/* Clinic Info */}
            <section className="bg-white rounded-xl shadow p-4 sm:p-5">
              <h2 className="text-lg font-semibold mb-3">Clinic Information</h2>
              <p className="text-xs text-gray-500 mb-3">
                Update your clinic address, timings, and branding.
              </p>
              <form onSubmit={submitClinic} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Clinic Name
                    </label>
                    <input
                      className="input w-full bg-gray-100 cursor-not-allowed"
                      value={clinic?.name || ''}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      City
                    </label>
                    <input
                      name="city"
                      className="input w-full"
                      value={clinicForm.city}
                      onChange={handleClinicChange}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Address
                    </label>
                    <input
                      name="address"
                      className="input w-full"
                      value={clinicForm.address}
                      onChange={handleClinicChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Pincode
                    </label>
                    <input
                      name="pincode"
                      className="input w-full"
                      value={clinicForm.pincode}
                      onChange={handleClinicChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Timings
                    </label>
                    <input
                      name="timings"
                      className="input w-full"
                      value={clinicForm.timings}
                      onChange={handleClinicChange}
                      placeholder="Mon–Sat 9 AM – 6 PM"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Details / Description
                    </label>
                    <textarea
                      name="details"
                      className="input w-full min-h-[80px]"
                      value={clinicForm.details}
                      onChange={handleClinicChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Logo URL
                    </label>
                    <input
                      name="logo"
                      className="input w-full"
                      value={clinicForm.logo}
                      onChange={handleClinicChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Banner URL
                    </label>
                    <input
                      name="banner"
                      className="input w-full"
                      value={clinicForm.banner}
                      onChange={handleClinicChange}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingClinic}
                    className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {savingClinic ? 'Saving...' : 'Save Clinic Info'}
                  </button>
                </div>
              </form>
            </section>

            {/* Payment Gateway */}
            <section className="bg-white rounded-xl shadow p-4 sm:p-5">
              <h2 className="text-lg font-semibold mb-3">Payment Gateway</h2>
              <p className="text-xs text-gray-500 mb-3">
                Configure your payment provider credentials.
              </p>
              <form onSubmit={submitGateway} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Provider
                    </label>
                    <select
                      name="provider"
                      className="input w-full"
                      value={gatewayForm.provider}
                      onChange={handleGatewayChange}
                    >
                      <option value="RAZORPAY">Razorpay</option>
                      <option value="STRIPE">Stripe</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-6 sm:mt-7">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={gatewayForm.isActive}
                      onChange={handleGatewayChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Active
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      API Key
                    </label>
                    <input
                      name="apiKey"
                      className="input w-full"
                      value={gatewayForm.apiKey}
                      onChange={handleGatewayChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Secret Key
                    </label>
                    <input
                      name="secretKey"
                      className="input w-full"
                      value={gatewayForm.secretKey}
                      onChange={handleGatewayChange}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingGateway}
                    className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {savingGateway ? 'Saving...' : 'Save Gateway'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </ClinicAdminLayout>
  );
}

