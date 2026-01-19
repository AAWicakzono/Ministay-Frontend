import axios from 'axios';


export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const IMAGE_BASE_URL = `${BASE_URL}/storage/`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ministay_admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;