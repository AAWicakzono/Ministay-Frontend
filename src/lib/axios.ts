import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

// Interceptor request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token: string | null = null;

    // Pakai token admin untuk endpoint admin
    if (config.url?.startsWith("/admin")) {
      token = localStorage.getItem("ministay_admin_token");
    } else {
      // Semua selain /admin pakai user token
      token = localStorage.getItem("user_token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Tentukan siapa logout
      if (error.config.url?.startsWith("/admin")) {
        localStorage.removeItem("ministay_admin_token");
      } else {
        localStorage.removeItem("user_token");
        window.dispatchEvent(new Event("user-update"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
