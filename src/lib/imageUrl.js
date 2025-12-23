// src/lib/imageUrl.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // http://localhost:5000/api

export const buildImageUrl = (raw) => {
  if (!raw) return null;

  // Already absolute
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  // Get origin without /api
  const origin = API_BASE_URL.replace(/\/api\/?$/, ''); // http://localhost:5000

  // Ensure leading slash on path from DB
  const path = raw.startsWith('/') ? raw : `/${raw}`;   // '/uploads/xxx.jpg'

  return `${origin}${path}`;                            // http://localhost:5000/uploads/xxx.jpg
};
