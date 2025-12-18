import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SuperAdminLayout from "../../layouts/SuperAdminLayout.jsx";
import Loader from "../../components/Loader.jsx";
import Modal from "../../components/Modal.jsx";
import CreateClinicAdminForm from "./CreateClinicAdminForm.jsx";
import api from "../../lib/api";
import { toast } from "react-hot-toast";
import { ENDPOINTS } from "../../lib/endpoints";

const INITIAL_CLINIC_FORM = {
  name: "",
  phone: "", // ✅ NEW: Added phone field
  logo: "",
  banner: "",
  address: "",
  city: "",
  pincode: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  timings: "",
  details: "",
  isActive: true,
  allowAuditView: false,

  // plan selection
  planId: "",
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ clinics: 0, admins: 0, doctors: 0 });
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals & forms
  const [clinicModalOpen, setClinicModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [clinicForm, setClinicForm] = useState(INITIAL_CLINIC_FORM);
  const [clinicSaving, setClinicSaving] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, banner: false });

  // plans state
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  const navigate = useNavigate();

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === clinicForm.planId),
    [plans, clinicForm.planId]
  );

  const auditAllowedByPlan = selectedPlan ? !!selectedPlan.enableAuditLogs : true;

  const getList = (res) => (Array.isArray(res.data) ? res.data : res.data.data || []);

  const fetchStats = async () => {
    try {
      setError("");
      setLoading(true);

      const [clinicsRes, adminsRes, analyticsRes] = await Promise.all([
        api.get(`${ENDPOINTS.SUPER_ADMIN.CLINICS}?limit=1000`),
        api.get(`${ENDPOINTS.SUPER_ADMIN.ADMINS}?limit=1000`),
        api.get(ENDPOINTS.SUPER_ADMIN.ANALYTICS),
      ]);

      const clinicsList = getList(clinicsRes);
      const adminsList = getList(adminsRes);

      const totalDoctors = clinicsList.reduce(
        (sum, clinic) => sum + Number(clinic.doctorCount || clinic.doctors?.length || 0),
        0
      );

      setStats({
        clinics: clinicsList.length,
        admins: adminsList.length,
        doctors: totalDoctors,
      });

      setAnalytics({
        totalUsers: analyticsRes.data.totalUsers,
        totalBookings: analyticsRes.data.totalBookings,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);

      // Your listPublicPlans returns array directly
      const res = await api.get(ENDPOINTS.SUPER_ADMIN.PLANS);
      const list = res.data || [];
      const active = list.filter((p) => p.isActive !== false);

      setPlans(active);

      // auto set default planId (only if empty)
      setClinicForm((prev) => ({
        ...prev,
        planId: prev.planId || active?.[0]?.id || "",
      }));
    } catch (err) {
      console.error("Load plans error", err);
      toast.error("Failed to load plans");
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // If plan changes and audit is not allowed, force checkbox off
  useEffect(() => {
    if (selectedPlan && !auditAllowedByPlan && clinicForm.allowAuditView) {
      setClinicForm((prev) => ({ ...prev, allowAuditView: false }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicForm.planId]);

  const handleClinicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClinicForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClinicFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading((prev) => ({ ...prev, [field]: true }));

      const fd = new FormData();
      fd.append("file", file);

      const res = await api.post(ENDPOINTS.SUPER_ADMIN.CLINIC_UPLOAD, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setClinicForm((prev) => ({ ...prev, [field]: res.data.url }));
      toast.success(`${field === "logo" ? "Logo" : "Banner"} uploaded`);
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Failed to upload image");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const openClinicModal = async () => {
    setClinicModalOpen(true);
    // load plans when opening modal (so dropdown is always fresh)
    if (plans.length === 0) await fetchPlans();
  };

  const handleCreateClinic = async (e) => {
    e.preventDefault();
    setClinicSaving(true);

    // ✅ Added phone to validation
    if (!clinicForm.name || !clinicForm.phone || !clinicForm.city || !clinicForm.address || !clinicForm.pincode) {
      toast.error("Please fill all required fields (*)");
      setClinicSaving(false);
      return;
    }

    if (!clinicForm.planId) {
      toast.error("Please select a plan.");
      setClinicSaving(false);
      return;
    }

    try {
      await api.post(ENDPOINTS.SUPER_ADMIN.CLINICS, clinicForm);
      toast.success("Clinic Created Successfully!");
      setClinicForm(INITIAL_CLINIC_FORM);
      setClinicModalOpen(false);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create clinic");
    } finally {
      setClinicSaving(false);
    }
  };

  const handleAdminCreated = (data) => {
    const email = data.email || data.credentials?.email || "Unknown Email";
    toast.success(`Admin Created: ${email}`);
    fetchStats();
    setAdminModalOpen(false);
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="py-20">
          <Loader />
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="w-full px-4 sm:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-[#003366] tracking-tight">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1 font-medium">System Overview & Management</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        {/* TOP STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Total Clinics
                </p>
                <h2 className="text-4xl font-black text-[#003366]">{stats.clinics}</h2>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-2xl">🏥</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Clinic Admins
                </p>
                <h2 className="text-4xl font-black text-[#003366]">{stats.admins}</h2>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl text-2xl">👨‍💼</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Total Doctors
                </p>
                <h2 className="text-4xl font-black text-[#003366]">{stats.doctors}</h2>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-2xl">🩺</div>
            </div>
          </div>
        </div>

        {/* GLOBAL ANALYTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Total Users
              </p>
              <h2 className="text-3xl font-black text-[#003366]">{analytics.totalUsers}</h2>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-2xl">👥</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Total Bookings
              </p>
              <h2 className="text-3xl font-black text-[#003366]">{analytics.totalBookings}</h2>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl text-2xl">📅</div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <button
            onClick={openClinicModal}
            className="flex-1 py-4 px-6 bg-[#003366] text-white font-bold rounded-xl shadow-lg hover:bg-[#002244] transition-all flex items-center justify-center gap-2"
          >
            <span>🏥</span> Create New Clinic
          </button>
          <button
            onClick={() => setAdminModalOpen(true)}
            className="flex-1 py-4 px-6 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <span>👤</span> Create Clinic Admin
          </button>
        </div>

        {/* CREATE CLINIC MODAL */}
        <Modal isOpen={clinicModalOpen} onClose={() => setClinicModalOpen(false)} title="Add New Clinic">
          <form onSubmit={handleCreateClinic} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                Basic Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Plan */}
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Select Plan*
                  </label>
                  <select
                    name="planId"
                    className="input w-full"
                    value={clinicForm.planId}
                    onChange={handleClinicChange}
                    required
                    disabled={loadingPlans}
                  >
                    {loadingPlans && <option value="">Loading plans...</option>}
                    {!loadingPlans && plans.length === 0 && <option value="">No active plans</option>}
                    {!loadingPlans &&
                      plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.currency || "INR"} {p.priceMonthly ?? 0})
                        </option>
                      ))}
                  </select>

                  {selectedPlan && (
                    <p className="mt-1 text-xs text-gray-500">
                      Max Doctors: {selectedPlan.maxDoctors ?? "—"} · Max Bookings/Period:{" "}
                      {selectedPlan.maxBookings ?? "—"}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Clinic Name*</label>
                  <input
                    name="name"
                    className="input w-full"
                    value={clinicForm.name}
                    onChange={handleClinicChange}
                    required
                    placeholder="e.g. City Care Hospital"
                  />
                </div>
                
                {/* ✅ Added Phone Number Field */}
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Phone Number*</label>
                  <input
                    name="phone"
                    type="tel"
                    className="input w-full"
                    value={clinicForm.phone}
                    onChange={handleClinicChange}
                    required
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>

                {/* Logo */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Logo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleClinicFileUpload(e, "logo")} />
                  {uploading.logo && <p className="mt-1 text-xs text-gray-400">Uploading logo...</p>}
                  {clinicForm.logo && (
                    <img src={clinicForm.logo} alt="Logo preview" className="h-10 mt-2 rounded border object-contain" />
                  )}
                </div>

                {/* Banner */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Banner</label>
                  <input type="file" accept="image/*" onChange={(e) => handleClinicFileUpload(e, "banner")} />
                  {uploading.banner && <p className="mt-1 text-xs text-gray-400">Uploading banner...</p>}
                  {clinicForm.banner && (
                    <img src={clinicForm.banner} alt="Banner preview" className="h-16 mt-2 rounded border object-cover" />
                  )}
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Address*</label>
                  <input
                    name="address"
                    className="input w-full"
                    value={clinicForm.address}
                    onChange={handleClinicChange}
                    required
                    placeholder="Full Street Address"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">City*</label>
                  <input
                    name="city"
                    className="input w-full"
                    value={clinicForm.city}
                    onChange={handleClinicChange}
                    required
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Pincode*</label>
                  <input
                    name="pincode"
                    className="input w-full"
                    value={clinicForm.pincode}
                    onChange={handleClinicChange}
                    required
                    placeholder="400001"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Timings (Optional)</label>
                  <input
                    name="timings"
                    className="input w-full"
                    value={clinicForm.timings}
                    onChange={handleClinicChange}
                    placeholder="Mon-Sat: 9am - 9pm"
                  />
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                Bank Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Bank Name</label>
                  <input
                    name="bankName"
                    className="input w-full"
                    value={clinicForm.bankName}
                    onChange={handleClinicChange}
                    placeholder="HDFC Bank"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Account Number</label>
                  <input
                    name="accountNumber"
                    className="input w-full"
                    value={clinicForm.accountNumber}
                    onChange={handleClinicChange}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">IFSC Code</label>
                  <input
                    name="ifscCode"
                    className="input w-full"
                    value={clinicForm.ifscCode}
                    onChange={handleClinicChange}
                    placeholder="HDFC0001234"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-sm font-bold text-[#003366] uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                Settings & Description
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">About Clinic</label>
                  <textarea
                    name="details"
                    rows="3"
                    className="input w-full"
                    value={clinicForm.details}
                    onChange={handleClinicChange}
                    placeholder="Brief description..."
                  />
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={clinicForm.isActive}
                      onChange={handleClinicChange}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Status</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                    <input
                      type="checkbox"
                      name="allowAuditView"
                      checked={clinicForm.allowAuditView}
                      onChange={handleClinicChange}
                      disabled={!auditAllowedByPlan}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow Admin to View Logs</span>
                  </label>
                </div>

                {!auditAllowedByPlan && selectedPlan && (
                  <div className="text-xs text-gray-500">
                    Audit logs are disabled for this selected plan.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 bg-white border-t border-gray-100 pb-2">
              <button
                type="submit"
                disabled={clinicSaving}
                className="btn-primary w-full py-3 bg-[#003366] text-white font-bold rounded-xl shadow-lg hover:bg-[#002244] transition-all disabled:opacity-50"
              >
                {clinicSaving ? "Creating Clinic..." : "Create Clinic"}
              </button>
            </div>
          </form>
        </Modal>

        {/* CREATE ADMIN MODAL */}
        <Modal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} title="Create Clinic Admin">
          <CreateClinicAdminForm onCreated={handleAdminCreated} onError={toast.error} />
        </Modal>
      </div>
    </SuperAdminLayout>
  );
}
