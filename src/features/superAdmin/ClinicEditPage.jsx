import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SuperAdminLayout from "../../layouts/SuperAdminLayout.jsx";
import Loader from "../../components/Loader.jsx";
import api from "../../lib/api";
import { toast } from "react-hot-toast";
import { ENDPOINTS } from "../../lib/endpoints";

const INITIAL_FORM = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  timings: "",
  details: "",
  isActive: true,
  allowAuditView: false,
};

export default function EditClinicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true);
        const res = await api.get(ENDPOINTS.SUPER_ADMIN.CLINIC_BY_ID(id));
        const data = res.data;

        setForm({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          pincode: data.pincode || "",
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          ifscCode: data.ifscCode || "",
          timings: typeof data.timings === 'string' ? data.timings : JSON.stringify(data.timings) || "",
          details: data.details || "",
          isActive: data.isActive ?? true,
          allowAuditView: data.allowAuditView ?? false,
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load clinic details");
        navigate("/super-admin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.patch(ENDPOINTS.SUPER_ADMIN.CLINIC_BY_ID(id), form);
      toast.success("Clinic updated successfully");
      navigate("/super-admin/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update clinic");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-extrabold text-[#003366] mb-8">Edit Clinic</h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-6">
          
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="label">Clinic Name *</label>
              <input
                name="name"
                className="input w-full border p-2 rounded"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="label">Phone Number *</label>
              <input
                name="phone"
                className="input w-full border p-2 rounded"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-span-2">
              <label className="label">Address *</label>
              <input
                name="address"
                className="input w-full border p-2 rounded"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">City *</label>
              <input
                name="city"
                className="input w-full border p-2 rounded"
                value={form.city}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Pincode *</label>
              <input
                name="pincode"
                className="input w-full border p-2 rounded"
                value={form.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Bank Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Bank Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label">Bank Name</label>
                <input
                  name="bankName"
                  className="input w-full border p-2 rounded"
                  value={form.bankName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Account Number</label>
                <input
                  name="accountNumber"
                  className="input w-full border p-2 rounded"
                  value={form.accountNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">IFSC Code</label>
                <input
                  name="ifscCode"
                  className="input w-full border p-2 rounded"
                  value={form.ifscCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Settings */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Description / Details</label>
                <textarea
                  name="details"
                  rows="3"
                  className="input w-full border p-2 rounded"
                  value={form.details}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-medium text-gray-700">Active Status</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowAuditView"
                    checked={form.allowAuditView}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <span className="font-medium text-gray-700">Allow Admin Logs</span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/super-admin/dashboard")}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 bg-[#003366] text-white rounded-lg font-bold hover:bg-[#002244] shadow-md disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </SuperAdminLayout>
  );
}
