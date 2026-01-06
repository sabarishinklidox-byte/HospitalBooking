import React, { useMemo, useState, useEffect } from "react";

export default function AppointmentCard({ app, onReschedule, onReview, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(10); // minutes

  // 🔥 REAL-TIME COUNTDOWN (only for NEW booking payment hold)
  useEffect(() => {
    if (app?.status !== "PENDING_PAYMENT" || app?.paymentStatus !== "PENDING") return;

    const interval = setInterval(() => {
      const created = new Date(app.createdAt);
      const now = new Date();
      const minutesPassed = (now - created) / (1000 * 60);
      const minutesRemaining = Math.max(0, Math.ceil(10 - minutesPassed));

      setTimeLeft(minutesRemaining);

      if (minutesRemaining === 0) {
        window.location.reload();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [app?.createdAt, app?.status, app?.paymentStatus]);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

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

  const getSpecialityLabel = (speciality) => {
    if (!speciality) return "—";
    if (typeof speciality === "object") return speciality.name || "—";
    return speciality;
  };

  // ==== PAYMENT INFO ====
  const paymentMode = app?.slot?.paymentMode || "OFFLINE";
  const amount = Number(app?.amount ?? app?.slot?.price ?? 0);
  const paymentStatus = app?.paymentStatus || "PENDING";
  const appointmentStatus = app?.status || "PENDING";
  const financialStatus = app?.financialStatus || null;
  const diffAmount = Number(app?.diffAmount || 0);

  const isOnlinePay = paymentMode === "ONLINE";
  const clinicName = app?.clinic?.name || app?.slot?.clinic?.name || app?.clinicName || "Clinic";
  const clinicCity = app?.clinic?.city || app?.slot?.clinic?.city || app?.clinicCity || "";

  // ✅ Rescheduled = disable cancel/request-cancel UI completely
const isRescheduled = useMemo(() => {
  if (!app) return false;
  
  const fromHistory = Array.isArray(app?.history) && app.history.some((h) => h?.oldDate && h?.newDate);
  
  const checks = {
    type: app?.type === "RESCHEDULE",
    count: Number(app?.rescheduleCount || 0) > 0,
    history: fromHistory,
    note: (app?.adminNote?.includes("RESCHEDULED") ?? false)
  };
  
  const result = Boolean(
    checks.type || checks.count || checks.history || checks.note
  );
  
  // 🔥 DEBUG LOG - REMOVE AFTER FIX
  console.table({
    appointmentId: app.id,
    isRescheduled: result,
    ...checks,
    rawData: {
      type: app?.type,
      rescheduleCount: app?.rescheduleCount,
      historyLength: app?.history?.length || 0,
      adminNote: app?.adminNote?.slice(0, 50)
    }
  });
  
  return result;
}, [app]);


  // latest reschedule from logs (for display chip)
const latestReschedule = useMemo(() => {
  const hist = app?.history;
  console.log('🔍 DEBUG HISTORY:', { 
    hasHistory: !!hist, 
    isArray: Array.isArray(hist), 
    length: hist?.length,
    firstItem: hist?.[0],
    sampleKeys: hist?.[0] ? Object.keys(hist[0]) : null 
  });
  
  if (!Array.isArray(hist) || hist.length === 0) return null;
  
  const reschedules = hist.filter(h => {
    const hasDates = h?.oldDate && h?.newDate;
    console.log('Item check:', h, 'hasDates:', hasDates);
    return hasDates;
  });
  
  console.log('Reschedules:', reschedules.length);
  
  if (reschedules.length === 0) return null;
  
  const sorted = reschedules.sort((a, b) => 
    new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
  )[0];
  
  return sorted;
}, [app?.history]);

  // ✅ Status badge
  const statusStyles = (() => {
    if (appointmentStatus === "PENDING_PAYMENT" && paymentStatus === "PENDING") {
      return {
        badge: "bg-purple-50 text-purple-700 border-purple-200 animate-pulse",
        dot: "bg-purple-500",
        label: `PAYMENT REQUIRED ⏰ ${timeLeft}min`,
      };
    }

    switch (appointmentStatus) {
      case "CONFIRMED":
        return { badge: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500", label: "CONFIRMED" };
      case "PENDING":
        return { badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", label: "PENDING" };
      case "COMPLETED":
        return { badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", label: "COMPLETED" };
      case "CANCEL_REQUESTED":
        return { badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "CANCEL REQUESTED" };
      case "CANCELLED":
        return { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", label: "CANCELLED" };
      case "NO_SHOW":
        return { badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", label: "NO SHOW" };
      default:
        return { badge: "bg-gray-50 text-gray-700 border-gray-200", dot: "bg-gray-500", label: appointmentStatus || "UNKNOWN" };
    }
  })();


 const paymentLabel = (() => {
  // 1️⃣ RESCHEDULE FINANCIAL STATUS (HIGHEST PRIORITY)
  const absDiff = Math.abs(Number(diffAmount || 0));
  
  if (financialStatus === "PAY_DIFFERENCE" && diffAmount > 0) {
    return `Reschedule: Pay ₹${diffAmount} more`;
  }
  if (financialStatus === "REFUND_AT_CLINIC" && absDiff > 0) {  // ✅ FIXED: absDiff for refunds
    return `Reschedule: ₹${absDiff} refund at clinic`;
  }

  // 2️⃣ URGENT PAYMENT TIMER (unchanged)
  if (appointmentStatus === "PENDING_PAYMENT" && paymentStatus === "PENDING") {
    return `Pay ₹${amount} in ${timeLeft}min`;
  }

  // 3️⃣ SIMPLE PENDING DIFFERENCE (unchanged)
  if (paymentStatus === "PENDING" && financialStatus === "PAY_DIFFERENCE" && diffAmount > 0) {
    return `Pay ₹${diffAmount} more`;
  }

  // 4️⃣ COMPLETED PAYMENTS (unchanged)
  if (appointmentStatus === "COMPLETED") {
    if (paymentMode === "ONLINE") return `Paid ₹${amount} Online`;
    if (paymentMode === "FREE") return `Free Consultation`;
    return `Paid ₹${amount}`;
  }

  // 5️⃣ DEFAULT BOOKING STATES (unchanged)
  if (paymentMode === "ONLINE") return `Booked ₹${amount} Online`;
  if (paymentMode === "FREE") return `Free Booking`;
  return `Booked ₹${amount} (Clinic)`;
})();

const paymentStyles = (() => {
  // 1️⃣ FINANCIAL STATUS (HIGHEST PRIORITY - FIXED order)
  const absDiff = Math.abs(Number(diffAmount || 0));
  
  if (financialStatus === "REFUND_AT_CLINIC" && absDiff > 0) {  // ✅ FIXED: Check absDiff
    return "bg-emerald-50 text-emerald-800 border-emerald-200";  // Green for refund
  }
  if (financialStatus === "PAY_DIFFERENCE" && diffAmount > 0) {   // ✅ FIXED: Specific check
    return "bg-orange-50 text-orange-800 border-orange-200";     // Orange for pay more
  }

  // 2️⃣ URGENT PAYMENT TIMER (unchanged)
  if (appointmentStatus === "PENDING_PAYMENT" && paymentStatus === "PENDING") {
    return "bg-purple-50 text-purple-700 border-purple-200 animate-pulse";
  }

  // 3️⃣ SIMPLE PENDING PAYMENT (unchanged)
  if (paymentStatus === "PENDING") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  // 4️⃣ COMPLETED (unchanged)
  if (appointmentStatus === "COMPLETED") {
    return "bg-green-50 text-green-700 border-green-200";
  }

  // 5️⃣ DEFAULT ONLINE/OFFLINE (unchanged)
  if (paymentMode === "ONLINE") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
})();

  // ✅ Actions rules
  const canReschedule = ["CONFIRMED", "PENDING"].includes(appointmentStatus);

  // Cancel button is allowed only if:
  // - appointment is CONFIRMED/PENDING
  // - NOT rescheduled
  // - NOT already requested cancel
  // - NOT already refunded
const baseCanCancel = [
  "CONFIRMED", 
  "PENDING", 
  "PENDING_PAYMENT",  // 🔥 ADD THIS
  "BOOKED"            // 🔥 If you use this status
].includes(appointmentStatus);
  const cancelAlreadyRequested = appointmentStatus === "CANCEL_REQUESTED";
  const alreadyRefunded = paymentStatus === "REFUNDED";
  const canShowCancelButton = baseCanCancel && !isRescheduled && !cancelAlreadyRequested && !alreadyRefunded;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-5 transition-all hover:shadow-md hover:border-blue-300">
       <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="font-bold text-sm text-amber-900 mb-1">Clinic Policy</h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            {isRescheduled 
              ? "Reschedule available only once. No further rescheduling or refunds. Please contact clinic directly."
              : "Rescheduling/cancellation subject to clinic approval. Limited to 1 reschedule per booking."
            }
          </p>
        </div>
      </div>
    </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* LEFT */}
        <div className="w-full md:w-auto">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{app?.doctor?.name || "Doctor"}</h3>

              <p className="text-sm text-blue-600 font-medium">
                {getSpecialityLabel(app?.doctor?.speciality)}
              </p>

              <p className="text-xs text-gray-500 mb-3">
                {clinicName}
                {clinicCity ? ` • ${clinicCity}` : ""}
              </p>
            </div>

            {/* Mobile payment badge */}
            <div className="md:hidden text-right flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wide ${paymentStyles}`}>
                {paymentLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            {/* Date */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-gray-700">{formatDate(app?.slot?.date)}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-700">{to12Hour(app?.slot?.time)}</span>
            </div>

            {/* Desktop payment badge */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border bg-slate-50 border-gray-200 ${paymentStyles}`}>
              <span className="text-[11px] font-bold uppercase tracking-wide">{paymentLabel}</span>
            </div>
          </div>

          {/* Status + Messages */}
          <div className="mt-4">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${statusStyles.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
              {statusStyles.label}
            </span>

            {/* ✅ If user requested cancellation → show "wait for admin reply" */}
            {appointmentStatus === "CANCEL_REQUESTED" && (
              <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-2 items-start">
                <svg className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] leading-tight text-orange-800 font-medium">
                  <strong>Waiting for admin reply:</strong> Your cancellation request is pending clinic approval.
                </p>
              </div>
            )}

            {/* ✅ Reschedule policy info */}
            {isRescheduled && appointmentStatus !== "CANCELLED" && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
                <svg className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[11px] leading-tight text-amber-800 font-medium">
                  <strong>Note:</strong> Cancellation / refund is not available for rescheduled appointments. Please contact the clinic.
                </p>
              </div>
            )}

            {/* Approved + refunded */}
            {appointmentStatus === "CANCELLED" && paymentStatus === "REFUNDED" && (
              <p className="mt-2 text-xs text-green-700 font-medium bg-green-50 px-2 py-1 rounded-sm border border-green-200">
                Refund initiated. 5–7 working days to reflect.
              </p>
            )}

            {/* Rejected */}
            {app?.cancellationRequest?.status === "REJECTED" && (
              <p className="mt-2 text-xs text-red-700 font-medium bg-red-50 px-2 py-1 rounded-sm border border-red-200">
                Cancellation rejected by clinic.
                {app?.cancellationRequest?.reason ? ` Reason: ${app.cancellationRequest.reason}` : ""}
              </p>
            )}

            {/* Reschedule chip */}
            {latestReschedule && (
              <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
                <span>⚠️ Rescheduled</span>
                <span className="text-gray-500 line-through">{formatDate(latestReschedule.oldDate)}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="text-gray-900">{formatDate(latestReschedule.newDate)}</span>
              </div>
            )}

            {/* Cancel reason */}
            {appointmentStatus === "CANCELLED" && app?.cancelReason && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 5a7 7 0 100 14a7 7 0 000-14z" />
                </svg>
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">Cancelled</p>
                  <p className="text-xs text-red-700 mt-0.5">{app.cancelReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex flex-col gap-2 self-start md:self-center w-full md:w-auto mt-4 md:mt-0">
          {canReschedule && (
            <button
              onClick={() => onReschedule?.(app)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Reschedule
            </button>
          )}

          {/* ✅ Cancel / Request cancel */}
          {canShowCancelButton ? (
            <button
              onClick={() => onCancel?.(app)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm bg-red-50 border border-red-300 text-red-700 hover:bg-red-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {isOnlinePay ? "Request cancellation" : "Cancel appointment"}
            </button>
          ) : (
            // ✅ Disabled state text
            (baseCanCancel || appointmentStatus === "CANCEL_REQUESTED") && appointmentStatus !== "CANCELLED" && (
              <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-50 border border-gray-200 text-gray-500 cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {isRescheduled
                  ? "Contact clinic"
                  : cancelAlreadyRequested
                  ? "Waiting for reply"
                  : alreadyRefunded
                  ? "Refunded"
                  : "Not eligible"}
              </div>
            )
          )}

          {/* Review */}
          {appointmentStatus === "COMPLETED" && !app?.review && (
            <button
              onClick={() => onReview?.(app)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 shadow-sm transition-colors"
            >
              Rate Doctor
            </button>
          )}

          {app?.review && (
            <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              Rated {app.review.rating}/5
            </div>
          )}
        </div>
      </div>

      {/* Prescription */}
      {app?.prescription && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Prescription</h4>
          </div>
          <div className="p-4 text-sm text-slate-700 font-mono whitespace-pre-line leading-relaxed">
            {app.prescription}
          </div>
        </div>
      )}
    </div>
  );
}
