import React, { useMemo } from "react";

export default function AppointmentCard({ app, onReschedule, onReview, onCancel }) {
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

  // keep UI consistent with booking page
  const to12Hour = (timeStr) => {
    if (!timeStr) return "N/A";
    const [h, m] = String(timeStr).split(":");
    let hour = parseInt(h, 10);
    const minute = m ?? "00";

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;

    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${pad(hour)}:${pad(parseInt(minute, 10))} ${ampm}`;
  };

  // payment mode (FREE / OFFLINE / ONLINE)
  const isOnlinePay = app?.slot?.paymentMode === "ONLINE";

  // clinic name (adjust keys if your API uses different ones)
  const clinicName =
    app?.clinic?.name ||
    app?.slot?.clinic?.name ||
    app?.clinicName ||
    "Clinic";

  const clinicCity =
    app?.clinic?.city ||
    app?.slot?.clinic?.city ||
    app?.clinicCity ||
    "";

  // latest reschedule (your backend logs are ordered desc, but this also supports timestamp)
  const latestReschedule = useMemo(() => {
    if (!Array.isArray(app?.history) || app.history.length === 0) return null;

    const reschedules = app.history.filter((h) => h?.oldDate && h?.newDate);
    if (reschedules.length === 0) return null;

    // if timestamp exists, choose max; else keep first (desc)
    if (reschedules[0]?.timestamp) {
      return [...reschedules].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
    }

    return reschedules[0];
  }, [app?.history]);

  // helper for status colors incl. CANCEL_REQUESTED
  const statusStyles = (() => {
    switch (app.status) {
      case "CONFIRMED":
        return {
          badge: "bg-green-50 text-green-700 border-green-200",
          dot: "bg-green-500",
          label: "CONFIRMED",
        };
      case "PENDING":
        return {
          badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
          dot: "bg-yellow-500",
          label: "PENDING",
        };
      case "COMPLETED":
        return {
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          label: "COMPLETED",
        };
      case "CANCEL_REQUESTED":
        return {
          badge: "bg-orange-50 text-orange-700 border-orange-200",
          dot: "bg-orange-500",
          label: "CANCEL REQUESTED",
        };
      case "CANCELLED":
        return {
          badge: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
          label: "CANCELLED",
        };
      case "NO_SHOW":
        return {
          badge: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
          label: "NO SHOW",
        };
      default:
        return {
          badge: "bg-gray-50 text-gray-700 border-gray-200",
          dot: "bg-gray-500",
          label: app.status || "UNKNOWN",
        };
    }
  })();

  const canReschedule = ["CONFIRMED", "PENDING"].includes(app.status);
  const canCancel = ["CONFIRMED", "PENDING"].includes(app.status);

  // Don’t show cancel button when already requested
  const cancelDisabled = app.status === "CANCEL_REQUESTED";

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-5 transition-all hover:shadow-md hover:border-blue-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* LEFT: Doctor + clinic + status */}
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {app?.doctor?.name || "Doctor"}
          </h3>
          <p className="text-sm text-blue-600 font-medium">
            {app?.doctor?.speciality || "—"}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            {clinicName}
            {clinicCity ? ` • ${clinicCity}` : ""}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {/* Date */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-semibold text-gray-700">
                {formatDate(app?.slot?.date)}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold text-gray-700">
                {to12Hour(app?.slot?.time)}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${statusStyles.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
              {statusStyles.label}
            </span>

            {app.status === "CANCEL_REQUESTED" && (
              <p className="mt-1 text-xs text-orange-600 font-medium">
                Cancellation requested. Waiting for clinic approval.
              </p>
            )}
          </div>

          {/* Latest reschedule chip */}
          {latestReschedule && (
            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
              <span>⚠️ Rescheduled</span>
              <span className="text-gray-500 line-through">
                {formatDate(latestReschedule.oldDate)}
              </span>
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
              <span className="text-gray-900">
                {formatDate(latestReschedule.newDate)}
              </span>
            </div>
          )}

          {/* Cancel reason */}
          {app.status === "CANCELLED" && app.cancelReason && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-start gap-2">
              <svg
                className="w-4 h-4 text-red-500 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z"
                />
              </svg>
              <div>
                <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                  Cancelled
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  {app.cancelReason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex flex-col gap-2 self-start md:self-center w-full md:w-auto">
          {canReschedule && (
            <button
              onClick={() => onReschedule(app)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Reschedule
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => onCancel?.(app)}
              disabled={cancelDisabled}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm
                ${
                  cancelDisabled
                    ? "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-red-50 border border-red-300 text-red-700 hover:bg-red-100"
                }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {cancelDisabled
                ? "Cancellation requested"
                : isOnlinePay
                ? "Request cancellation"
                : "Cancel appointment"}
            </button>
          )}

          {app.status === "COMPLETED" && !app.review && (
            <button
              onClick={() => onReview(app)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-sm transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              Rate Doctor
            </button>
          )}

          {app.review && (
            <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Rated {app.review.rating}/5
            </div>
          )}
        </div>
      </div>

      {/* Prescription */}
      {app.prescription && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Prescription
            </h4>
          </div>
          <div className="p-4 text-sm text-slate-700 font-mono whitespace-pre-line leading-relaxed">
            {app.prescription}
          </div>
        </div>
      )}
    </div>
  );
}
