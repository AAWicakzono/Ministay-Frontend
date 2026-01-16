"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, X, UserCircle, LockKeyhole, User, Edit2, Loader2 } from "lucide-react";
import { useNotification } from "@/context/NotificationContext"; 
import apiClient from "@/lib/axios"; 
import { isAxiosError } from "axios";

interface LoginFormProps {
  isModal?: boolean;
  isAdmin?: boolean;
}

const CountdownMessage = ({ onFinish }: { onFinish: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(3); // Dipercepat jadi 3 detik agar UX lebih cepat

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish(); 
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onFinish]);

  return (
    <span>
      Anda akan diarahkan ke beranda dalam <span className="font-bold text-gray-900 text-base">{timeLeft}</span> detik...
    </span>
  );
};

export default function LoginForm({ isModal = false }: LoginFormProps) {
  const router = useRouter();
  const { showToast, showPopup } = useNotification(); 
  
  const [role, setRole] = useState<"user" | "admin">("user");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  const [adminUser, setAdminUser] = useState(""); 
  const [adminPass, setAdminPass] = useState("");

  const API_BASE_URL = "https://ministay-be-production.up.railway.app"; 

  const handleClose = () => {
    if (isModal) router.back();
    else router.push("/");
  };

  const handleSuccessRedirect = () => {
    if (isModal) window.location.reload();
    else window.location.href = "/";
  };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault(); 
  setLoading(true);

  // LOGIKA USER (TAMU) -- Tetap sama --
  if (role === 'user') {
     // ... (kode logika user tamu tidak berubah) ...
  } 
  
  // LOGIKA ADMIN -- INI YANG DIUBAH --
  else {
    if(!adminUser || !adminPass) {
      setLoading(false);
      return showToast("Isi username & password", "error");
    }
    
    try {
      console.log("Mencoba login admin...");

      // MENGGUNAKAN AXIOS
      // Tidak perlu lagi setting method: 'POST', headers, dll secara manual
      const response = await apiClient.post('/api/auth/admin/login', {
          name: adminUser,
          password: adminPass
      });

      // Axios otomatis mengembalikan data JSON di dalam 'response.data'
      const data = response.data;

      // Simpan Token & Data
      if (data.token) {
          localStorage.setItem("ministay_admin_token", data.token);
          
          const adminData = { 
              name: data.user?.name || adminUser, 
              role: "admin",
              email: data.user?.email || "-" 
          };
          localStorage.setItem("ministay_user", JSON.stringify(adminData));
          window.dispatchEvent(new Event("user-update"));

          showToast("Login Berhasil! Mengalihkan...", "success");
          
          setTimeout(() => {
              window.location.href = "/admin/dashboard";
          }, 1000);
      } else {
          throw new Error("Token tidak diterima dari server.");
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      
      // Handling Error Axios
      let errorMessage = "Terjadi kesalahan server.";
      if (isAxiosError(error)) {
          // Pesan error dari backend biasanya ada di error.response.data.message
          errorMessage = error.response?.data?.message || error.message;
      } else {
          errorMessage = error.message;
      }

      showPopup("Gagal Login", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }
};