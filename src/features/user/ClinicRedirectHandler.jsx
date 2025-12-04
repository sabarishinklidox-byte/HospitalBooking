// src/features/user/ClinicRedirectHandler.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ClinicRedirectHandler() {
  const { clinicId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (clinicId) {
      // Save the preference
      localStorage.setItem('preferredClinicId', clinicId);
      // Optional: You could also fetch the clinic name to show a "Welcome to Apollo" banner later
    }
    // Redirect to home, but now the app knows to filter!
    navigate('/');
  }, [clinicId, navigate]);

  return <div className="p-10 text-center">Loading Clinic Portal...</div>;
}
