import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api'; // Ensure this path matches your project structure
import Loader from '../../components/Loader';
import { CheckCircle, XCircle } from 'lucide-react';
import { ENDPOINTS } from '../../lib/endpoints' // Optional: Use icons if available

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get('session_id');
  const clinicId = searchParams.get('clinic_id'); // We passed this in the success_url

  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('Verifying your payment details...');

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    const verifyPayment = async () => {
      try {
        // Call the backend to confirm payment with Stripe and create the appointment
        const res = await api.post(ENDPOINTS.PAYMENT.VERIFY_SESSION, { 
            session_id: sessionId,
            clinic_id: clinicId 
        });

        if (res.data.success) {
            setStatus('success');
            setMessage('Payment confirmed! Your appointment has been booked.');
            // Auto-redirect after 3 seconds
            setTimeout(() => {
                navigate('/my-appointments');
            }, 3000);
        } else {
            setStatus('error');
            setMessage(res.data.error || 'Payment verification failed.');
        }

      } catch (err) {
        console.error("Verification Error:", err);
        setStatus('error');
        setMessage(err.response?.data?.error || 'Server error during verification.');
      }
    };

    // Prevent double-calling in Strict Mode by checking if we are already 'verifying'
    if (status === 'verifying') {
        verifyPayment();
    }
    // eslint-disable-next-line
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-100 p-8 text-center transition-all duration-500">
        
        {/* LOADING STATE */}
        {status === 'verifying' && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader />
            <h2 className="text-xl font-bold text-gray-800 mt-6">Processing Payment</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your booking...</p>
            <p className="text-xs text-gray-400 mt-4">Do not close this window.</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckCircle size={48} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Booking Confirmed!</h2>
            <p className="text-gray-600 mt-2 mb-6">{message}</p>
            
            <div className="w-full bg-green-50 border border-green-100 rounded-lg p-3 mb-6">
                <p className="text-sm text-green-800 font-medium">Redirecting to My Appointments...</p>
            </div>

            <button 
                onClick={() => navigate('/my-appointments')}
                className="w-full bg-[#003366] text-white font-bold py-3 rounded-xl hover:bg-[#002244] transition-colors"
            >
                View Appointment Now
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-in shake duration-300">
             <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <XCircle size={48} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Something Went Wrong</h2>
            <p className="text-gray-600 mt-2 mb-6">{message}</p>
            
            <p className="text-xs text-gray-400 mb-6">
                Transaction ID: <span className="font-mono bg-gray-100 px-1 rounded">{sessionId?.slice(-8)}...</span>
            </p>

            <div className="flex gap-3 w-full">
                <button 
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Go Home
                </button>
                <button 
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-[#003366] text-white font-bold py-3 rounded-xl hover:bg-[#002244] transition-colors"
                >
                    Try Again
                </button>
            </div>
          </div>
        )}

      </div>

      {/* Footer / Help */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        Need help? Contact support at <a href="mailto:support@clinic.com" className="underline hover:text-gray-600">support@clinic.com</a>
      </div>
    </div>
  );
}
