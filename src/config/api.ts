// API Configuration
// Change this URL to point to your backend API
export const API_BASE_URL = "https://ytdownloader-3p7s.onrender.com";

// API Endpoints
export const API_ENDPOINTS = {
  INFO: `${API_BASE_URL}/api/info`,
  DOWNLOAD: `${API_BASE_URL}/api/download`,
  DOWNLOAD_START: `${API_BASE_URL}/api/download/start`,
  DOWNLOAD_PROGRESS: (jobId: string) => `${API_BASE_URL}/api/download/progress/${jobId}`,
  DOWNLOAD_FILE: (jobId: string) => `${API_BASE_URL}/api/download/file/${jobId}`,
} as const;
