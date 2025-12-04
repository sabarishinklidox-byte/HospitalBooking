// src/features/clinicAdmin/PatientHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import ClinicAdminLayout from '../../layouts/ClinicAdminLayout.jsx';
import Loader from '../../components/Loader.jsx';

export default function PatientHistoryPage() {
  const { userId } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/admin/patients/${userId}/history`);
      setPatient(res.data.user);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load patient history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  return (
    <ClinicAdminLayout>
      <div className="w-full px-3 sm:px-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-4">
              {patient?.avatar && (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {patient.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {patient.email} {patient.phone ? `• ${patient.phone}` : ''}
                </p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <p className="text-sm text-gray-500">
                No appointments found for this patient.
              </p>
            ) : (
              <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Doctor
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Clinic
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">
                        Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {a.date || a.slot?.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            {a.time || a.slot?.time}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {a.doctor?.name || '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {a.doctor?.speciality || ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {a.clinic?.name || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {a.payment
                            ? `₹${a.payment.amount} • ${a.payment.status}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </ClinicAdminLayout>
  );
}
