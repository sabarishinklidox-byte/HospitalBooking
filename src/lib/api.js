import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// ✅ REQUEST INTERCEPTOR: Attaches token from storage to every request
api.interceptors.request.use(
  (config) => {
    // We grab the token directly from localStorage EVERY TIME a request is made.
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR: Handles 401 Unauthorized errors automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 (Unauthorized), it means the token is bad/expired.
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid token. Clearing storage.");
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optional: Force a page reload to trigger the App router to redirect to login
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
