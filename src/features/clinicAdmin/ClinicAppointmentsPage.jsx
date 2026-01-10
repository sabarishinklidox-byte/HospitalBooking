import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import Loader from "../../components/Loader.jsx";
import RescheduleAppointmentModal from "../clinicAdmin/RescheduleAppointmentModal.jsx";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import { ENDPOINTS } from "../../lib/endpoints";

export default function ClinicAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForReschedule, setSelectedForReschedule] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  });

  const canPrev = page > 1;
  const canNext = page < (pagination.totalPages || 1);

  const fetchAppointments = async (pageArg = page) => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN.APPOINTMENTS, {
        params: { page: pageArg, limit }, // ✅ real pagination params
      });

      const rawData = res.data?.data || [];
      const safeAppointments = rawData.map((a) => ({
        ...a,

        doctorSpecialization:
          a.doctorSpecialization?.name ||
          a.doctorSpecialization ||
          a.doctor?.speciality?.name ||
          "Unknown",

        doctorName: a.doctorName || a.doctor?.name || "Unknown Doctor",
        patientName: a.patientName || a.patient?.name || "Unknown Patient",
        patientPhone: a.patientPhone || a.patient?.phone || "",

        dateFormatted: a.dateFormatted || "N/A",
        timeFormatted: a.timeFormatted || "N/A",

        // payment fields (must come from API to be accurate)
        bookingSource: a.bookingSource || null,
        paymentMode: a.paymentMode || null,
        amountPaid: a.amountPaid ?? a.amount ?? 0,
        paymentStatus: a.paymentStatus || "UNPAID",
      }));

      setAppointments(safeAppointments);

      const pg = res.data?.pagination;
      if (pg) {
        setPagination(pg);
        setPage(pg.page || pageArg);
      } else {
        // fallback if API doesn't send pagination for some reason
        setPagination((p) => ({ ...p, page: pageArg }));
      }
    } catch (e) {
      console.error("load admin appointments error", e);
      setAppointments([]);
      setPagination({ total: 0, page: 1, limit, totalPages: 1 });
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (apptId, status) => {
    try {
      await api.patch(ENDPOINTS.ADMIN.APPOINTMENT_STATUS(apptId), { status });
      fetchAppointments(page);
    } catch (e) {
      console.error("update status error", e);
    }
  };

  useEffect(() => {
    fetchAppointments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAppointments(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const pageLabel = useMemo(() => {
    const total = pagination.total || 0;
    const totalPages = pagination.totalPages || 1;
    return { total, totalPages };
  }, [pagination.total, pagination.totalPages]);

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
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500">
            View, reschedule and update appointment status.
          </p>
        </div>

        {/* Card container like booking page */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Table wrapper: horizontal scroll on mobile */}
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-700">
                  <th className="px-4 py-3 text-left font-semibold">Patient</th>
                  <th className="px-4 py-3 text-left font-semibold">Doctor</th>
                  <th className="px-4 py-3 text-left font-semibold">Date / Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {appointments.map((a) => {
                  const doctorId = a.doctorId || a.doctor?.id || a.doctor_id;
                  const canReschedule = ["PENDING", "CONFIRMED"].includes(a.status);
                  const canMark = ["PENDING", "CONFIRMED"].includes(a.status);

                  return (
                    <tr key={a.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{a.patientName}</div>
                        {a.patientPhone ? (
                          <div className="text-xs text-gray-500">{a.patientPhone}</div>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{a.doctorName}</div>
                        <div className="text-[11px] text-gray-500">
                          {a.doctorSpecialization}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-800">
                        {a.dateFormatted} · {a.timeFormatted}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          {a.status}
                        </span>
                      </td>

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
                                doctorName: a.doctorName,
                                doctorSpeciality: a.doctorSpecialization || "Unknown",
                                patientName: a.patientName || "Unknown",
                                patientPhone: a.patientPhone || "",
                                bookingSource: a.bookingSource || null,
                                paymentMode: a.paymentMode || null,
                                amountPaid: a.amountPaid ?? a.amount ?? 0,
                                paymentStatus: a.paymentStatus || "UNPAID",
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

                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="border-t bg-white px-4 py-3 flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{pageLabel.total}</span> • Page{" "}
              <span className="font-semibold">{page}</span> /{" "}
              <span className="font-semibold">{pageLabel.totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>

              <button
                className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                disabled={!canNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <RescheduleAppointmentModal
          open={!!selectedForReschedule}
          onClose={() => setSelectedForReschedule(null)}
          appointment={selectedForReschedule}
          onRescheduled={() => {
            setSelectedForReschedule(null);
            fetchAppointments(page);
          }}
        />
      </div>
    </ClinicAdminLayout>
  );
}
