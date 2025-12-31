// API Configuration
// Change this URL to point to your backend API
export const API_BASE_URL = "https://web-production-83d70.up.railway.app";

// API Endpoints
export const API_ENDPOINTS = {
  INFO: `${API_BASE_URL}/api/info`,
  DOWNLOAD: `${API_BASE_URL}/api/download`,
} as const;
