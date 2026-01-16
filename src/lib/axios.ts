import axios from 'axios';

// Ganti URL ini dengan URL Backend kamu
// Kalau sedang dev lokal pakai: "http://localhost:8000"
// Kalau sudah deploy pakai: "https://ministay-be-production.up.railway.app"

const apiClient = axios.create({
  baseURL: "https://ministay-be-production.up.railway.app", 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default apiClient;