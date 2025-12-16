import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import toast from 'react-hot-toast';
import { ENDPOINTS } from '../../lib/endpoints';
import { CreditCard, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { useAdminContext } from '../../context/AdminContext.jsx';
import UpgradeNotice from '../../components/UpgradeNotice.jsx';

export default function ClinicSettingsPage() {
  const { plan, loading: planLoading } = useAdminContext() || {};

  const [admin, setAdmin] = useState(null);
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);

  // Admin profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    password: '',
  });

  // Clinic form (branding + Google reviews config, NOT rating)
  const [clinicForm, setClinicForm] = useState({
    address: '',
    city: '',
    pincode: '',
    timings: '',
    details: '',
    logoFile: null,
    bannerFile: null,
    googlePlaceId: '',
    googleMapsUrl: '',
    googleReviewsEmbedCode: '',
  });

  // Gateway State (Stripe)
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: '',
    secretKey: '',
    isActive: false,
  });
  const [isGatewayConfigured, setIsGatewayConfigured] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      // 1. Profile & clinic (and plan)
      const res = await api.get(ENDPOINTS.ADMIN.PROFILE);
      const { admin, clinic } = res.data;

      setAdmin(admin);
      setClinic(clinic);

      if (admin) {
        setProfileForm({
          name: admin.name || '',
          phone: admin.phone || '',
          password: '',
        });
      }

      if (clinic) {
        setClinicForm((prev) => ({
          ...prev,
          address: clinic.address || '',
          city: clinic.city || '',
          pincode: clinic.pincode || '',
          timings: clinic.timings || '',
          details: clinic.details || '',
          googlePlaceId: clinic.googlePlaceId || '',
          googleMapsUrl: clinic.googleMapsUrl || '',
          googleReviewsEmbedCode: clinic.googleReviewsEmbedCode || '',
        }));
      }

      // 2. Stripe config
      try {
        const gwRes = await api.get(ENDPOINTS.ADMIN.GATEWAY_STRIPE);
        if (gwRes.data.apiKey) {
          setStripeConfig((prev) => ({
            ...prev,
            publishableKey: gwRes.data.apiKey,
            isActive: gwRes.data.isActive,
          }));
          setIsGatewayConfigured(true);
        }
      } catch (e) {
        console.warn('Gateway config not found (first time setup)');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handleClinicChange = (e) =>
    setClinicForm({ ...clinicForm, [e.target.name]: e.target.value });

  const handleBrandingFileChange = (field) => (e) => {
    const file = e.target.files?.[0] || null;
    setClinicForm((prev) => ({ ...prev, [field]: file }));
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    const payload = { name: profileForm.name, phone: profileForm.phone };
    if (profileForm.password) payload.password = profileForm.password;

    await toast.promise(
      api.patch(ENDPOINTS.ADMIN.PROFILE, payload).then((res) => {
        setAdmin(res.data.admin);
        setProfileForm((prev) => ({ ...prev, password: '' }));
      }),
      {
        loading: 'Updating profile...',
        success: 'Profile updated successfully!',
        error: (err) =>
          err.response?.data?.error || 'Failed to update profile',
      }
    );
  };

  const submitClinic = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('address', clinicForm.address || '');
    formData.append('city', clinicForm.city || '');
    formData.append('pincode', clinicForm.pincode || '');
    formData.append('timings', clinicForm.timings || '');
    formData.append('details', clinicForm.details || '');

    // Google config fields as simple text
    formData.append('googlePlaceId', clinicForm.googlePlaceId || '');
    formData.append('googleMapsUrl', clinicForm.googleMapsUrl || '');
    formData.append(
      'googleReviewsEmbedCode',
      clinicForm.googleReviewsEmbedCode || ''
    );

    if (clinicForm.logoFile) formData.append('logo', clinicForm.logoFile);
    if (clinicForm.bannerFile) formData.append('banner', clinicForm.bannerFile);

    await toast.promise(
      api
        .patch(ENDPOINTS.ADMIN.CLINIC_SETTINGS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((res) => setClinic(res.data.clinic)),
      {
        loading: 'Saving clinic details...',
        success: 'Clinic details saved!',
        error: 'Failed to save clinic details',
      }
    );
  };

  const submitGateway = async (e) => {
    e.preventDefault();
    setGatewayLoading(true);
    try {
      await api.post(ENDPOINTS.ADMIN.GATEWAY_STRIPE, {
        publishableKey: stripeConfig.publishableKey,
        secretKey: stripeConfig.secretKey,
        isActive: stripeConfig.isActive,
      });
      toast.success('Payment Gateway Updated Successfully!');
      setIsGatewayConfigured(true);
      setStripeConfig((prev) => ({ ...prev, secretKey: '' }));
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'Failed to update gateway settings'
      );
    } finally {
      setGatewayLoading(false);
    }
  };

  const handleRefreshGoogleRating = async () => {
    try {
      setRefreshLoading(true);
      const res = await api.post(ENDPOINTS.ADMIN.CLINIC_GOOGLE_RATING_REFRESH);
      const updatedClinic = res.data.clinic;
      setClinic((prev) => ({ ...prev, ...updatedClinic }));
      toast.success('Google rating refreshed from live data.');
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'Failed to refresh Google rating.'
      );
    } finally {
      setRefreshLoading(false);
    }
  };

  // Use clinic name + full address to auto-fetch Place ID & rating URL
const handleAutoFillGooglePlace = async () => {
  const query = clinicForm.googlePlaceId.trim(); // user text

  // Require at least 3 words (name + city/area)
  const parts = query.split(/\s+/).filter(Boolean);
  if (parts.length < 3) {
    toast.error(
      'Type clinic name + city + area/road, exactly as on Google Maps.'
    );
    return;
  }

  try {
    setPlaceSearchLoading(true);
    const res = await api.get(ENDPOINTS.PUBLIC.GOOGLE_PLACE_ID,{ params: { query } });
    const { placeId, address } = res.data;

    setClinicForm((prev) => ({
      ...prev,
      googlePlaceId: placeId,
      googleMapsUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
      address: prev.address || address || prev.address,
    }));

    toast.success('Matched clinic on Google and auto-filled fields.');
  } catch (err) {
    toast.error(
      err.response?.data?.error ||
        'Clinic not found. Please copy the exact name + address from Google Maps.'
    );
  } finally {
    setPlaceSearchLoading(false);
  }
};



  if (loading || planLoading) {
    return (
      <ClinicAdminLayout>
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Loader />
        </div>
      </ClinicAdminLayout>
    );
  }

  const canUseGoogleReviews = !!plan?.enableGoogleReviews;

  return (
    <ClinicAdminLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 border-b border-gray-100 pb-5">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>⚙️</span> Settings
          </h1>
          <p className="text-gray-500 mt-2 ml-1">
            Manage your account, clinic information, and payment setup.
          </p>
        </div>

        <div className="grid gap-10">
          {/* Admin Profile */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Admin Profile
                </h2>
                <p className="text-xs text-gray-500">
                  Login credentials and personal info.
                </p>
              </div>
              <span className="text-2xl">👤</span>
            </div>

            <form onSubmit={submitProfile} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Full Name
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
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Email (Read-only)
                  </label>
                  <input
                    className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={admin?.email || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    className="input w-full"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    New Password (Optional)
                  </label>
                  <input
                    name="password"
                    type="password"
                    className="input w-full"
                    value={profileForm.password}
                    onChange={handleProfileChange}
                    placeholder="••••••"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 font-bold bg-[#0b3b5e] hover:bg-[#092c46] text-white rounded-lg transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </section>

          {/* Clinic Info + Branding + Google Reviews */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Clinic Details
                </h2>
                <p className="text-xs text-gray-500">
                  This information is visible to patients.
                </p>
              </div>
              <span className="text-2xl">🏥</span>
            </div>

            <form onSubmit={submitClinic} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Clinic Name
                  </label>
                  <input
                    className="input w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={clinic?.name || ''}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    City
                  </label>
                  <input
                    name="city"
                    className="input w-full"
                    value={clinicForm.city}
                    onChange={handleClinicChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Full Address
                  </label>
                  <input
                    name="address"
                    className="input w-full"
                    value={clinicForm.address}
                    onChange={handleClinicChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
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
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Operating Hours
                  </label>
                  <input
                    name="timings"
                    className="input w-full"
                    value={clinicForm.timings}
                    onChange={handleClinicChange}
                    placeholder="e.g. Mon-Sat 9AM-6PM"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    About Clinic
                  </label>
                  <textarea
                    name="details"
                    className="input w-full min-h-[100px]"
                    value={clinicForm.details}
                    onChange={handleClinicChange}
                  />
                </div>

                {/* Branding section */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-gray-800">Branding</h3>

                  {!plan?.allowCustomBranding && (
                    <UpgradeNotice
                      feature="Custom logo & banner branding"
                      planName={plan?.name}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Logo Image
                      </label>
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        disabled={!plan?.allowCustomBranding}
                        className={`block w-full text-sm border rounded-lg file:mr-3 file:px-3 file:py-1.5 file:border-0 file:rounded-md file:bg-gray-100 file:text-gray-700 ${
                          !plan?.allowCustomBranding
                            ? 'bg-gray-100 cursor-not-allowed'
                            : ''
                        }`}
                        onChange={handleBrandingFileChange('logoFile')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Banner Image
                      </label>
                      <input
                        type="file"
                        name="banner"
                        accept="image/*"
                        disabled={!plan?.allowCustomBranding}
                        className={`block w-full text-sm border rounded-lg file:mr-3 file:px-3 file:py-1.5 file:border-0 file:rounded-md file:bg-gray-100 file:text-gray-700 ${
                          !plan?.allowCustomBranding
                            ? 'bg-gray-100 cursor-not-allowed'
                            : ''
                        }`}
                        onChange={handleBrandingFileChange('bannerFile')}
                      />
                    </div>
                  </div>
                </div>

                {/* Google Reviews section */}
                <div className="md:col-span-2 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">
                        Google Rating
                      </h3>
                      {typeof clinic?.googleRating === 'number' && (
                        <p className="text-xs text-gray-600 mt-1">
                          Current live rating:{' '}
                          <span className="font-semibold">
                            ⭐ {clinic.googleRating.toFixed(1)} / 5
                          </span>
                          {typeof clinic?.googleTotalReviews === 'number' &&
                            ` (${clinic.googleTotalReviews} reviews)`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {canUseGoogleReviews && (
                        <button
                          type="button"
                          onClick={handleRefreshGoogleRating}
                          disabled={refreshLoading || !clinicForm.googlePlaceId}
                          className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white disabled:opacity-60"
                        >
                          {refreshLoading
                            ? 'Refreshing...'
                            : 'Refresh from Google'}
                        </button>
                      )}
                      {!canUseGoogleReviews && (
                        <UpgradeNotice
                          feature="Google rating badge"
                          planName={plan?.name}
                        />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Enter your Google Place ID and rating link. The star rating
                    is pulled automatically from Google and shown on your public
                    page.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Google Place ID
                      </label>
                      <input
                        name="googlePlaceId"
                        className="input w-full"
                        value={clinicForm.googlePlaceId}
                        onChange={handleClinicChange}
                        disabled={!canUseGoogleReviews}
                        placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                      />
                      {canUseGoogleReviews && (
                        <button
                          type="button"
                          onClick={handleAutoFillGooglePlace}
                          disabled={placeSearchLoading}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <Search size={12} />
                          {placeSearchLoading
                            ? 'Searching on Google...'
                            : 'Search & auto-fill from name + address'}
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Google Maps URL (Rating page)
                      </label>
                      <input
                        name="googleMapsUrl"
                        className="input w-full"
                        value={clinicForm.googleMapsUrl}
                        onChange={handleClinicChange}
                        disabled={!canUseGoogleReviews}
                        placeholder="https://search.google.com/local/writereview?placeid=..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Embed Code (Optional)
                    </label>
                    <textarea
                      name="googleReviewsEmbedCode"
                      className="input w-full min-h-[80px]"
                      value={clinicForm.googleReviewsEmbedCode}
                      onChange={handleClinicChange}
                      disabled={!canUseGoogleReviews}
                      placeholder="<iframe ...></iframe>"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      Paste an embed snippet from your Google reviews widget
                      provider (optional).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="py-2.5 px-6 font-bold bg-[#0b3b5e] hover:bg-[#092c46] text-white rounded-lg transition-colors"
                >
                  Save Clinic Info
                </button>
              </div>
            </form>
          </section>

          {/* Payment Gateway (Stripe) */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                  <CreditCard className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Payment Gateway
                  </h2>
                  <p className="text-xs text-gray-500">
                    Configure Stripe to accept online payments.
                  </p>
                </div>
              </div>
              {isGatewayConfigured ? (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  <CheckCircle size={14} /> ACTIVE
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                  <AlertCircle size={14} /> SETUP REQ.
                </span>
              )}
            </div>

            <form onSubmit={submitGateway} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Provider
                  </label>
                  <select
                    className="input w-full bg-gray-50 text-gray-500 cursor-not-allowed"
                    value="STRIPE"
                    disabled
                  >
                    <option value="STRIPE">Stripe Payments</option>
                  </select>
                </div>

                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={stripeConfig.isActive}
                        onChange={(e) =>
                          setStripeConfig((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                      />
                      <div
                        className={`block w-10 h-6 rounded-full transition-colors ${
                          stripeConfig.isActive ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      ></div>
                      <div
                        className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          stripeConfig.isActive ? 'translate-x-4' : ''
                        }`}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      Enable Online Payments
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Publishable Key (pk_test_...)
                  </label>
                  <input
                    type="text"
                    className="input w-full font-mono text-sm"
                    value={stripeConfig.publishableKey}
                    onChange={(e) =>
                      setStripeConfig((prev) => ({
                        ...prev,
                        publishableKey: e.target.value,
                      }))
                    }
                    placeholder="pk_test_..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Secret Key (sk_test_...)
                  </label>
                  <input
                    type="password"
                    className="input w-full font-mono text-sm"
                    value={stripeConfig.secretKey}
                    onChange={(e) =>
                      setStripeConfig((prev) => ({
                        ...prev,
                        secretKey: e.target.value,
                      }))
                    }
                    placeholder={
                      isGatewayConfigured
                        ? '••••••••••••••••••••'
                        : 'sk_test_...'
                    }
                    required={!isGatewayConfigured}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={gatewayLoading}
                  className="py-2.5 px-6 font-bold bg-[#0b3b5e] hover:bg-[#092c46] text-white rounded-lg transition-colors disabled:opacity-70"
                >
                  {gatewayLoading ? 'Updating...' : 'Update Gateway'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </ClinicAdminLayout>
  );
}
