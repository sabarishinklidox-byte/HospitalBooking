import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../lib/endpoints';
import api from '../lib/api';

const GCalCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      // ✅ Clean - uses api + endpoints
      fetch(`${api.defaults.baseURL}${ENDPOINTS.GCAL.CALLBACK}?code=${code}&state=${state}`, {
        method: 'GET',
        credentials: 'include'
      })
      .then(res => {
        if (res.ok) navigate('/admin/settings?gcal=success');
        else navigate('/admin/settings?error=gcal_failed');
      })
      .catch(() => navigate('/admin/settings?error=gcal_failed'));
    } else {
      navigate('/admin/settings?error=gcal_failed');
    }
  }, [searchParams, navigate]);
  
  return <div className="flex items-center justify-center min-h-screen bg-blue-50 text-xl font-bold">🔄 Connecting Google Calendar...</div>;
};

export default GCalCallback;
