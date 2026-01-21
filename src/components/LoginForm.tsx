"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  ArrowRight,
  X,
  UserCircle,
  LockKeyhole,
  User,
  Loader2,
} from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { useAdminLogin } from "@/hooks/useAdminLogin";
import { useUserAuth } from "@/hooks/useUserLogin";

interface LoginFormProps {
  isModal?: boolean;
}

const CountdownMessage = ({ onFinish }: { onFinish: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(3);

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
      Anda akan diarahkan ke beranda dalam{" "}
      <span className="font-bold text-gray-900 text-base">{timeLeft}</span> detik...
    </span>
  );
};

export default function LoginForm({ isModal = false }: LoginFormProps) {
  const router = useRouter();
  const { showToast, showPopup } = useNotification();
  const { login: adminLogin, loading } = useAdminLogin();
  const { sendOtp, verifyOtp} = useUserAuth();

  const [role, setRole] = useState<"user" | "admin">("user");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  // User
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Admin
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const handleClose = () => {
    if (isModal) router.back();
    else router.push("/");
  };
  const closeModal = () => {
    if(isModal) {
      router.back();
    }
  }

  const handleSuccessRedirect = () => {
    if (isModal) window.location.reload();
    else window.location.href = "/";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // ===== USER (OTP SIMULASI) =====
    if (role === "user") {
      if (step === "phone") {
        if (!userName || !phoneNumber) {
          showToast("Mohon isi nama dan nomor HP", "error");
          return;
        }
        await sendOtp(userName, phoneNumber);
        setStep("otp");
        return;
      }

      if (!otpCode) {
        showToast("Masukkan kode OTP", "error");
        return;
      }

      await verifyOtp(phoneNumber, otpCode);

      showPopup(
        "Berhasil Login",
        <CountdownMessage onFinish={handleSuccessRedirect} />,
        "success",
        handleSuccessRedirect
      );

      return;
    }

    // ===== ADMIN =====
    if (!adminUser || !adminPass) {
      showToast("Isi username & password", "error");
      return;
    }

    try {
      await adminLogin({
        name: adminUser,
        password: adminPass,
      });

      showToast("Login Berhasil! Mengalihkan...", "success");
      closeModal();
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 300)
    } catch (err) {
      if (err instanceof Error) {
        showPopup("Gagal Login", err.message, "error");
      } else {
        showPopup("Gagal Login", "Terjadi kesalahan", "error");
      }
    }
  };

  return (
    <div
      className={`bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isModal ? "mx-4" : ""
      }`}
    >
      <div className="bg-blue-600 p-6 text-center text-white relative shrink-0">
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 text-blue-200 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        {step === "phone" && (
          <div className="inline-flex bg-blue-700 rounded-full p-1 mb-4">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`px-4 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                role === "user"
                  ? "bg-white text-blue-600"
                  : "text-blue-200"
              }`}
            >
              <UserCircle className="w-4 h-4" /> Tamu
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`px-4 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                role === "admin"
                  ? "bg-white text-blue-600"
                  : "text-blue-200"
              }`}
            >
              <LockKeyhole className="w-4 h-4" /> Admin
            </button>
          </div>
        )}

        <h1 className="text-2xl font-bold">
          {role === "admin"
            ? "Login Admin"
            : step === "otp"
            ? "Verifikasi OTP"
            : "Selamat Datang"}
        </h1>
        <p className="text-blue-100 text-sm">
          {role === "admin"
            ? "Akses khusus pengelola"
            : step === "otp"
            ? "Masukkan kode yang kami kirim"
            : "Masuk untuk melanjutkan"}
        </p>
      </div>

      <div className="p-8 overflow-y-auto">
        <form onSubmit={handleLogin} className="space-y-5">
          {role === "user" ? (
            step === "phone" ? (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  maxLength={6}
                  autoFocus
                  required
                />
              </div>
            )
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Username / ID
                </label>
                <input
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading
              ? "Memproses..."
              : role === "admin"
              ? "Masuk Dashboard"
              : step === "phone"
              ? "Kirim Kode OTP"
              : "Verifikasi & Masuk"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
