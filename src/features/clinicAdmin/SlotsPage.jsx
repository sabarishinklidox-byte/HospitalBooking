import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import ClinicAdminLayout from "../../layouts/ClinicAdminLayout.jsx";
import Loader from "../../components/Loader.jsx";
import Modal from "../../components/Modal.jsx";
import BulkSlotCreator from "./BulkSlotCreator";
import toast from "react-hot-toast";
import { ENDPOINTS } from "../../lib/endpoints";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const today = new Date().toISOString().split("T")[0];

const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":");
  const date = new Date();
  date.setHours(Number(h));
  date.setMinutes(Number(m));
  date.setSeconds(0);
  return date;
};

const formatTime = (date) => {
  if (!date) return "";
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  // Filters
  const [doctorId, setDoctorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState(null);

  // Form
  const [form, setForm] = useState({
    doctorId: "",
    date: today,
    time: "",
    duration: "30",
    price: "500",
    paymentMode: "ONLINE",
    kind: "APPOINTMENT",
  });

  const fetchDoctors = async () => {
    try {
      const res = await api.get(ENDPOINTS.ADMIN.DOCTORS);
      const activeDoctors = (res.data || []).filter((doc) => doc.isActive);
      setDoctors(activeDoctors);
      if (activeDoctors.length > 0 && !doctorId) {
        setDoctorId(activeDoctors[0].id);
      }
    } catch {
      toast.error("Failed to load doctors");
    }
  };

  const fetchSlots = async (opts) => {
    const targetPage = opts?.page ?? page;

    if (!doctorId || !selectedDate) {
      setSlots([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.ADMIN.SLOTS, {
        params: { doctorId, date: selectedDate, page: targetPage, limit },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      const pag = res.data?.pagination || {
        page: targetPage,
        limit,
        total: data.length,
        totalPages: 1,
      };


      setSlots(data);
      setPagination(pag);
      setPage(pag.page);
    } catch {
      toast.error("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    fetchSlots({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, selectedDate]);

  // Open create modal
  const openCreateModal = () => {
    setEditingSlotId(null);
    setForm({
      doctorId,
      date: selectedDate,
      time: "",
      duration: "30",
      price: "500",
      paymentMode: "ONLINE",
      kind: "APPOINTMENT",
    });
    setModalOpen(true);
  };

  const handleEditSlot = (slot) => {
    const kind = slot.kind || "APPOINTMENT";
    const paymentMode = kind === "BREAK" ? "FREE" : slot.paymentMode || "ONLINE";
    const price = kind === "BREAK" ? "0" : String(slot.price ?? 0);

    setEditingSlotId(slot.id);
    setForm({
      doctorId: slot.doctorId,
      date: slot.date.split("T")[0],
      time: slot.time,
      duration: String(slot.duration),
      price,
      paymentMode,
      kind,
    });
    setModalOpen(true);
  };

  const handleCreateOrUpdateSlot = async (e) => {
    e.preventDefault();

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (form.date < todayStr) {
      return toast.error("Cannot create slots for past dates.");
    }

    if (form.date === todayStr && form.time) {
      const [h, m] = form.time.split(":").map(Number);
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      if (h < currentH || (h === currentH && m <= currentM)) {
        return toast.error("Cannot create slots for past time.");
      }
    }

    const isBreak = form.kind === "BREAK";

    const payload = {
      ...form,
      duration: Number(form.duration),
      price: isBreak ? 0 : Number(form.price || 0),
      paymentMode: isBreak ? "FREE" : form.paymentMode,
    };

    const promise = editingSlotId
      ? api.put(ENDPOINTS.ADMIN.SLOT_BY_ID(editingSlotId), payload)
      : api.post(ENDPOINTS.ADMIN.SLOTS, payload);

    await toast.promise(promise, {
      loading: editingSlotId ? "Updating slot..." : "Creating slot...",
      success: () => {
        setModalOpen(false);
        fetchSlots({ page }); // stay on same page
        return `Slot ${editingSlotId ? "updated" : "created"} successfully!`;
      },
      error: (err) => err.response?.data?.error || "Failed to save slot",
    });
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this slot?"))
      return;

    try {
      await toast.promise(api.delete(ENDPOINTS.ADMIN.SLOT_BY_ID(id)), {
        loading: "Deleting slot...",
        success: () => {
          // refetch current page (if last item was removed, backend should clamp page)
          fetchSlots({ page });
          return "Slot deleted.";
        },
        error: (err) => err.response?.data?.error || "Failed to delete slot.",
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete slot.";
      toast.error(msg);
    }
  };

  const isBreak = form.kind === "BREAK";

  const filterPassedTime = (time) => {
    const selectedDateStr = form.date;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (selectedDateStr > todayStr) return true;
    if (selectedDateStr < todayStr) return false;

    const currentDate = new Date(time);
    const selectedDateWithTime = new Date();
    selectedDateWithTime.setHours(currentDate.getHours());
    selectedDateWithTime.setMinutes(currentDate.getMinutes());

    return selectedDateWithTime > now;
  };

  const goToPage = (p) => {
    if (p < 1 || p > pagination.totalPages || p === page) return;
    setPage(p);
    fetchSlots({ page: p });
  };

  return (
    <ClinicAdminLayout>
      <div className="mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>🗓️</span> Manage Slots
          </h1>
          <p className="text-gray-500 mt-2 ml-1">
            Create and manage individual or bulk appointment slots for your
            doctors.
          </p>
        </div>

        <BulkSlotCreator doctors={doctors} onSuccess={() => fetchSlots({ page })} />

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Select Doctor
              </label>
              <select
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                <option value="">-- Choose a Doctor --</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.speciality}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <span className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                  📅
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Slots ({slots.length}
              {pagination.total ? ` / ${pagination.total}` : ""})
            </h2>
            <button
              onClick={openCreateModal}
              disabled={!doctorId || !selectedDate}
              className="btn-primary py-2 px-5 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Single Slot
            </button>
          </div>

          {loading ? (
            <div className="py-20">
              <Loader />
            </div>
          ) : !doctorId || !selectedDate ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
              <p className="font-medium text-gray-600">
                Please select a doctor and a date to view slots.
              </p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200">
              <p className="font-medium text-gray-600">
                No slots found for this day.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Use the "Add Single Slot" or "Bulk Create" buttons to generate
                them.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Payment Mode</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {slots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-blue-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-gray-800">
                          {new Date(
                            `1970-01-01T${slot.time}`
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {slot.duration} mins
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              slot.kind === "BREAK"
                                ? "bg-gray-200 text-gray-800"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {slot.kind === "BREAK"
                              ? "Break / Lunch"
                              : "Appointment"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              slot.paymentMode === "FREE"
                                ? "bg-green-100 text-green-800"
                                : slot.paymentMode === "ONLINE"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {slot.paymentMode === "ONLINE"
                              ? "Online Only"
                              : slot.paymentMode === "OFFLINE"
                              ? "Pay at Clinic"
                              : "Free"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700">
                          {slot.paymentMode === "FREE"
                            ? "Free"
                            : `₹${slot.price}`}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              slot.isBooked
                                ? "bg-red-100 text-red-800"
                                : "bg-cyan-100 text-cyan-800"
                            }`}
                          >
                            {slot.isBooked ? "Booked" : "Available"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={slot.isBooked}
                            className="text-xs px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-xs sm:text-sm">
                  <div className="text-gray-500">
                    Page{" "}
                    <span className="font-semibold">{pagination.page}</span> of{" "}
                    <span className="font-semibold">
                      {pagination.totalPages}
                    </span>
                    {pagination.total > 0 && (
                      <>
                        {" "}
                        · Total{" "}
                        <span className="font-semibold">
                          {pagination.total}
                        </span>{" "}
                        slots
                      </>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => goToPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => goToPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlotId ? "Edit Slot" : "Create New Slot"}
      >
        <form onSubmit={handleCreateOrUpdateSlot} className="space-y-4 p-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="input w-full"
              value={form.date}
              min={today}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, date: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time (Start)
            </label>
            <DatePicker
              selected={parseTime(form.time)}
              onChange={(date) =>
                setForm((prev) => ({ ...prev, time: formatTime(date) }))
              }
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              placeholderText="Select Time"
              filterTime={filterPassedTime}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              required
            />
            <input type="hidden" value={form.time} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min="10"
                className="input w-full"
                value={form.duration}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, duration: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                className="input w-full"
                value={isBreak ? "0" : form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
                disabled={isBreak || form.paymentMode === "FREE"}
                required={!isBreak && form.paymentMode !== "FREE"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slot Type
            </label>
            <select
              className="input w-full bg-white"
              value={form.kind}
              onChange={(e) => {
                const kind = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  kind,
                  ...(kind === "BREAK"
                    ? { paymentMode: "FREE", price: "0" }
                    : {}),
                }));
              }}
            >
              <option value="APPOINTMENT">Appointment</option>
              <option value="BREAK">Break / Lunch</option>
            </select>
          </div>

          {!isBreak && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <select
                className="input w-full bg-white"
                value={form.paymentMode}
                onChange={(e) => {
                  const mode = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    paymentMode: mode,
                    price: mode === "FREE" ? "0" : prev.price,
                  }));
                }}
              >
                <option value="ONLINE">Online Payment Only</option>
                <option value="OFFLINE">Pay at Clinic (Cash Only)</option>
                <option value="FREE">Free Slot</option>
              </select>
            </div>
          )}

          {isBreak && (
            <div className="text-xs text-gray-500">
              Break slots are always Free (no payment mode / price).
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary py-2 px-5"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary py-2 px-5">
              {editingSlotId ? "Update Slot" : "Create Slot"}
            </button>
          </div>
        </form>
      </Modal>
    </ClinicAdminLayout>
  );
}
