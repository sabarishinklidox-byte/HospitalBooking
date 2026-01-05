import React, { useEffect, useState } from 'react';
import SuperAdminLayout from '../../layouts/SuperAdminLayout';
import api from '../../lib/api';
import { ENDPOINTS } from '../../lib/endpoints';
import Loader from '../../components/Loader';

export default function RevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await api.get(ENDPOINTS.SUPER_ADMIN.REVENUE);
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch revenue');
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  if (loading) return <SuperAdminLayout><Loader /></SuperAdminLayout>;

  return (
    <SuperAdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Platform Revenue</h1>
        <p className="text-gray-500">Combined earnings from Registrations and Upgrades.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase">Total Revenue</p>
          <p className="text-3xl font-bold text-[#003366]">₹{data?.summary.totalRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase">Registration Fees</p>
          <p className="text-3xl font-bold text-emerald-600">₹{data?.summary.registrationRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase">Upgrade Fees</p>
          <p className="text-3xl font-bold text-blue-600">₹{data?.summary.upgradeRevenue}</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Clinic</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Payment ID</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">{t.clinic}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    t.type === 'REGISTRATION' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold">₹{t.amount}</td>
                <td className="px-6 py-4 text-xs font-mono text-gray-400">{t.ref}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SuperAdminLayout>
  );
}