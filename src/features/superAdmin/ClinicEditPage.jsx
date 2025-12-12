import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import SuperAdminLayout from '../../layouts/SuperAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import { toast } from 'react-hot-toast'; 
import { ENDPOINTS } from '../../lib/endpoints';

const INITIAL_FORM = {
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

export default function ClinicEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchClinic = async () => {
    try {
      setLoading(true);
      // FIX: Use the correct endpoint function: CLINIC_BY_ID(id)
      const res = await api.get(ENDPOINTS.SUPER_ADMIN.CLINIC_BY_ID(id)); 
      const clinic = res.data;

      if (!clinic) {
        toast.error('Clinic not found');
        navigate(ENDPOINTS.SUPER_ADMIN.CLINICS);
        return;
      }

      setForm({
        name: clinic.name || '',
        address: clinic.address || '',
        city: clinic.city || '',
        pincode: clinic.pincode || '',
        accountNumber: clinic.accountNumber || '',
        ifscCode: clinic.ifscCode || '',
        bankName: clinic.bankName || '',
        // Ensure timings is converted back to a string for the input field
        timings:
          typeof clinic.timings === 'object'
            ? JSON.stringify(clinic.timings)
            : clinic.timings || '',
        details: clinic.details || '',
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load clinic');
      navigate(ENDPOINTS.SUPER_ADMIN.CLINICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinic();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!form.name || !form.address || !form.city || !form.pincode) {
      toast.error('Name, address, city, and pincode are required');
      setSaving(false);
      return;
    }

    try {
      // FIX: Use the correct endpoint function for PATCH as well
      await api.patch(ENDPOINTS.SUPER_ADMIN.CLINIC_BY_ID(id), form);
      toast.success('Clinic updated successfully!');
      navigate(ENDPOINTS.SUPER_ADMIN.CLINICS);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update clinic');
      setSaving(false);
    }
  };


  if (loading) return (
    <SuperAdminLayout>
      <Loader />
    </SuperAdminLayout>
  );

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Edit Clinic
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Info */}
            <div className="md:col-span-2 border-b pb-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Clinic Name*</label>
              <input name="name" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">City*</label>
              <input name="city" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={form.city} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Address*</label>
              <input name="address" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={form.address} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Pincode*</label>
              <input name="pincode" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={form.pincode} onChange={handleChange} required />
            </div>

            {/* Bank Details */}
            <div className="md:col-span-2 border-b pb-2 mb-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-700">Bank Details (Optional)</h3>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Account Number</label>
              <input name="accountNumber" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={form.accountNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">IFSC Code</label>
              <input name="ifscCode" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={form.ifscCode} onChange={handleChange} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Bank Name</label>
              <input name="bankName" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={form.bankName} onChange={handleChange} />
            </div>

            {/* Extra Info */}
            <div className="md:col-span-2 border-b pb-2 mb-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-700">Additional Info</h3>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Timings</label>
              <input name="timings" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" value={form.timings} onChange={handleChange} placeholder="Mon–Fri 9AM–6PM" />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-gray-700">Details</label>
              <textarea name="details" className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={form.details} onChange={handleChange} placeholder="Brief description" />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/super-admin/clinics')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
}