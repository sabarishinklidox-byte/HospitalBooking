import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import Loader from "../../components/Loader.jsx";
import RescheduleAppointmentModal from "../clinicAdmin/RescheduleAppointmentModal.jsx";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import { ENDPOINTS } from "../../lib/endpoints";

export default function ClinicAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForReschedule, setSelectedForReschedule] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN.APPOINTMENTS, { params: { limit: 20 } });
      setAppointments(res.data?.data || []);
    } catch (e) {
      console.error("load admin appointments error", e);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (apptId, status) => {
    try {
      await api.patch(ENDPOINTS.ADMIN.APPOINTMENT_STATUS(apptId), { status });
      fetchAppointments();
    } catch (e) {
      console.error("update status error", e);
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
          View, reschedule and update appointment status.
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
              const doctorId = a.doctorId || a.doctor?.id || a.doctor_id;
              const canReschedule = ["PENDING", "CONFIRMED"].includes(a.status);
              const canMark = ["PENDING", "CONFIRMED"].includes(a.status);

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
                    <div className="flex justify-end gap-2 flex-wrap">
                      <button
                        className="px-3 py-1 text-xs font-semibold rounded-md bg-[#0b3b5e] text-white hover:bg-[#0a324f] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canReschedule}
                        onClick={() => {
                          if (!doctorId) {
                            console.warn("No doctorId for appointment", a.id, a);
                            return;
                          }
                          setSelectedForReschedule({
                            id: a.id,
                            doctorId,
                            doctorName: a.doctorName || a.doctor?.name,
                            doctorSpeciality: a.doctorSpecialization || a.doctor?.speciality,
                            date: a.dateFormatted,
                            time: a.timeFormatted,
                          });
                        }}
                      >
                        Reschedule
                      </button>

                      <button
                        className="px-3 py-1 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canMark}
                        onClick={() => updateStatus(a.id, "COMPLETED")}
                      >
                        Completed
                      </button>

                      <button
                        className="px-3 py-1 text-xs font-semibold rounded-md bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canMark}
                        onClick={() => updateStatus(a.id, "NO_SHOW")}
                      >
                        No-show
                      </button>
                    </div>

                    {!canReschedule && (
                      <div className="text-[10px] text-gray-400 mt-1">
                        Reschedule only for Pending/Confirmed
                      </div>
                    )}
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
          onRescheduled={() => {
            setSelectedForReschedule(null);
            fetchAppointments();
          }}
        />
      </div>
    </ClinicAdminLayout>
  );
}
