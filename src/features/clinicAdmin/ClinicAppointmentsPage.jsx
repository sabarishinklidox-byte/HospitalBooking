// src/features/clinicAdmin/ClinicAppointmentsPage.jsx
import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import Loader from "../../components/Loader.jsx";
import RescheduleAppointmentModal from "../clinicAdmin/RescheduleAppointmentModal.jsx";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import { ENDPOINTS } from '../../lib/endpoints';
export default function ClinicAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForReschedule, setSelectedForReschedule] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN.APPOINTMENTS, { params: { limit: 20 } });
      setAppointments(res.data.data || []);
    } catch (e) {
      console.error("load admin appointments error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <ClinicAdminLayout>
        <div className="w-full h-[60vh] flex items-center justify-center">
          <Loader />
        </div>
      </ClinicAdminLayout>
    );
  }

  return (
    <ClinicAdminLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Appointments</h1>
        <p className="text-sm text-gray-500 mb-4">
          View and reschedule appointments for your clinic.
        </p>

        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Patient</th>
              <th className="px-4 py-3 text-left">Doctor</th>
              <th className="px-4 py-3 text-left">Date / Time</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => {
              // doctorId now comes from API (doctorId), but we keep fallbacks
              const doctorId = a.doctorId || a.doctor?.id || a.doctor_id;

              return (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-3">{a.patientName}</td>
                  <td className="px-4 py-3">
                    {a.doctorName || a.doctor?.name}
                    <div className="text-[11px] text-gray-500">
                      {a.doctorSpecialization || a.doctor?.speciality}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {a.dateFormatted} · {a.timeFormatted}
                  </td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="px-3 py-1 text-xs font-semibold rounded-md bg-[#0b3b5e] text-white hover:bg-[#0a324f]"
                      onClick={() => {
                        if (!doctorId) {
                          console.warn("No doctorId for appointment", a.id, a);
                          return;
                        }
                        setSelectedForReschedule({
                          id: a.id,
                          doctorId,
                          doctorName: a.doctorName || a.doctor?.name,
                          doctorSpeciality:
                            a.doctorSpecialization || a.doctor?.speciality,
                          date: a.dateFormatted,
                          time: a.timeFormatted,
                        });
                      }}
                    >
                      Reschedule
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <RescheduleAppointmentModal
          open={!!selectedForReschedule}
          onClose={() => setSelectedForReschedule(null)}
          appointment={selectedForReschedule}
          clinicId={undefined} // replace with real clinicId if your slots API needs it
          onRescheduled={() => {
            setSelectedForReschedule(null);
            fetchAppointments();
          }}
        />
      </div>
    </ClinicAdminLayout>
  );
}
