import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import Modal from '../../components/Modal.jsx';
import CreateClinicAdminForm from './CreateClinicAdminForm.jsx';

const INITIAL_CLINIC_FORM = {
  name: '',
  address: '',
  city: '',
  pincode: '',
  accountNumber: '',
  ifscCode: '',
  bankName: '',
  timings: '',
  details: '',
};

export default function SuperAdminDashboard() {
  const [totalClinics, setTotalClinics] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [clinicModalOpen, setClinicModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Clinic form
  const [clinicForm, setClinicForm] = useState(INITIAL_CLINIC_FORM);
  const [clinicSaving, setClinicSaving] = useState(false);
  const [lastCreatedSlug, setLastCreatedSlug] = useState('');

  // Admin success banner
  const [adminSuccess, setAdminSuccess] = useState('');

  const fetchStats = async () => {
    try {
      setError('');
      setLoading(true);
      const [clinicsRes, adminsRes] = await Promise.all([
        api.get('/super-admin/clinics'),
        api.get('/super-admin/admins'),
      ]);
      setTotalClinics(clinicsRes.data.length || 0);
      setTotalAdmins(adminsRes.data.length || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClinicChange = (e) =>
    setClinicForm({ ...clinicForm, [e.target.name]: e.target.value });

  const handleCreateClinic = async (e) => {
    e.preventDefault();
    setError('');
    setLastCreatedSlug('');
    setClinicSaving(true);

    if (!clinicForm.name || !clinicForm.address || !clinicForm.city || !clinicForm.pincode) {
      setError('Name, address, city, and pincode are required.');
      setClinicSaving(false);
      return;
    }

    try {
      const res = await api.post('/super-admin/clinics', clinicForm);
      setLastCreatedSlug(res.data.slug || '');
      setClinicForm(INITIAL_CLINIC_FORM);
      setClinicModalOpen(false);
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create clinic');
    } finally {
      setClinicSaving(false);
    }
  };

  const handleAdminCreated = (data) => {
    setAdminSuccess(`Admin created! Email: ${data.credentials.email}`);
    fetchStats();
    // optional: close modal automatically
    setAdminModalOpen(false);
    setTimeout(() => setAdminSuccess(''), 6000);
  };

  const handleAdminError = (msg) => {
    setError(msg);
  };

    return (
    <SuperAdminLayout>
      <div className="w-full px-3 sm:px-6">
        {loading ? (
          <Loader />
        ) : (
          <>
            <h1
              className="text-2xl sm:text-3xl font-bold mb-6 tracking-tight text-center sm:text-left"
              style={{ color: 'var(--color-primary)' }}
            >
              Super Admin Dashboard
            </h1>

            {error && (
              <p className="mb-4 text-sm text-red-600 text-center sm:text-left">
                {error}
              </p>
            )}

            {lastCreatedSlug && (
              <p className="mb-4 text-sm text-green-600 text-center sm:text-left">
                Clinic created with slug: <strong>{lastCreatedSlug}</strong>
              </p>
            )}

            {adminSuccess && (
              <p className="mb-4 text-sm text-green-600 text-center sm:text-left">
                {adminSuccess}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div
                className="p-4 sm:p-6 rounded-xl shadow-lg bg-white border-l-4"
                style={{ borderColor: 'var(--color-secondary)' }}
              >
                <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
                  Total Clinics
                </h2>
                <p
                  className="text-3xl sm:text-5xl font-extrabold mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {totalClinics}
                </p>
              </div>

              <div
                className="p-4 sm:p-6 rounded-xl shadow-lg bg-white border-l-4"
                style={{ borderColor: 'var(--color-action)' }}
              >
                <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase">
                  Total Clinic Admins
                </h2>
                <p
                  className="text-3xl sm:text-5xl font-extrabold mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {totalAdmins}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <button
                className="btn-primary w-full sm:flex-1 py-2.5 sm:py-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-primary)' }}
                type="button"
                onClick={() => setClinicModalOpen(true)}
              >
                Create New Clinic
              </button>
              <button
                className="btn-primary w-full sm:flex-1 py-2.5 sm:py-3 rounded-lg"
                style={{ backgroundColor: 'var(--color-action)' }}
                type="button"
                onClick={() => setAdminModalOpen(true)}
              >
                Create Clinic Admin
              </button>
            </div>

            {/* Clinic Modal */}
            <Modal
              isOpen={clinicModalOpen}
              onClose={() => setClinicModalOpen(false)}
              title="Create Clinic"
            >
              <form
                onSubmit={handleCreateClinic}
                className="w-full max-w-md mx-auto"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Clinic Name*
                    </label>
                    <input
                      name="name"
                      className="input w-full"
                      value={clinicForm.name}
                      onChange={handleClinicChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      City*
                    </label>
                    <input
                      name="city"
                      className="input w-full"
                      value={clinicForm.city}
                      onChange={handleClinicChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Address*
                    </label>
                    <input
                      name="address"
                      className="input w-full"
                      value={clinicForm.address}
                      onChange={handleClinicChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Pincode*
                    </label>
                    <input
                      name="pincode"
                      className="input w-full"
                      value={clinicForm.pincode}
                      onChange={handleClinicChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Account Number
                    </label>
                    <input
                      name="accountNumber"
                      className="input w-full"
                      value={clinicForm.accountNumber}
                      onChange={handleClinicChange}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      IFSC Code
                    </label>
                    <input
                      name="ifscCode"
                      className="input w-full"
                      value={clinicForm.ifscCode}
                      onChange={handleClinicChange}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Bank Name
                    </label>
                    <input
                      name="bankName"
                      className="input w-full"
                      value={clinicForm.bankName}
                      onChange={handleClinicChange}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Timings
                    </label>
                    <input
                      name="timings"
                      className="input w-full"
                      value={clinicForm.timings}
                      onChange={handleClinicChange}
                      placeholder="Mon–Fri 9AM–6PM"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">
                      Details
                    </label>
                    <textarea
                      name="details"
                      className="input w-full"
                      rows={3}
                      value={clinicForm.details}
                      onChange={handleClinicChange}
                      placeholder="A brief description of the clinic."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={clinicSaving}
                    className="btn-primary w-full py-2.5 sm:py-3 rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    {clinicSaving ? 'Saving...' : 'Create Clinic'}
                  </button>
                </div>
              </form>
            </Modal>

            {/* Admin Modal */}
            <Modal
              isOpen={adminModalOpen}
              onClose={() => setAdminModalOpen(false)}
              title="Create Clinic Admin"
            >
              <div className="w-full max-w-md mx-auto">
                <CreateClinicAdminForm
                  onCreated={handleAdminCreated}
                  onError={handleAdminError}
                />
              </div>
            </Modal>
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}
