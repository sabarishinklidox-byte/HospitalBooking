import React from 'react';

export default function AppointmentCard({ app, onReschedule, onReview }) {
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

  const isRescheduled =
    app.history &&
    Array.isArray(app.history) &&
    app.history.some((h) => h.oldDate);

  const latestReschedule = isRescheduled
    ? app.history.find((h) => h.oldDate) || null
    : null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-5 transition-all hover:shadow-md hover:border-blue-300">
      {/* TOP ROW: Info & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Doctor & Status */}
        <div>
          <h3 className="font-bold text-lg text-gray-900">{app.doctor.name}</h3>
          <p className="text-sm text-blue-600 font-medium mb-3">
            {app.doctor.speciality}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {/* Date Badge */}
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
                ></path>
              </svg>
              <span className="font-semibold text-gray-700">
                {formatDate(app.slot.date)}
              </span>
            </div>
            {/* Time Badge */}
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
                ></path>
              </svg>
              <span className="font-semibold text-gray-700">
                {app.slot.time}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider
              ${
                app.status === 'CONFIRMED'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : app.status === 'PENDING'
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : app.status === 'COMPLETED'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  app.status === 'CONFIRMED'
                    ? 'bg-green-500'
                    : app.status === 'PENDING'
                    ? 'bg-yellow-500'
                    : app.status === 'COMPLETED'
                    ? 'bg-blue-500'
                    : 'bg-red-500'
                }`}
              ></span>
              {app.status}
            </span>
          </div>

          {/* Rescheduled chip (from history) */}
          {latestReschedule && (
            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
              <span>⚠️ Rescheduled</span>
              <span className="text-gray-500 line-through">
                {latestReschedule.oldDate}
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
                ></path>
              </svg>
              <span className="text-gray-900">{latestReschedule.newDate}</span>
            </div>
          )}

          {/* Cancellation reason */}
          {app.status === 'CANCELLED' && app.cancelReason && (
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
                  Cancelled by clinic
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  {app.cancelReason}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 self-start md:self-center w-full md:w-auto">
          {['CONFIRMED', 'PENDING'].includes(app.status) && (
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
                ></path>
              </svg>
              Reschedule
            </button>
          )}

          {app.status === 'COMPLETED' && !app.review && (
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
                ></path>
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

      {/* PRESCRIPTION SECTION */}
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
              ></path>
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
