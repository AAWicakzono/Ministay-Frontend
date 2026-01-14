"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, X, UserCircle, LockKeyhole, User, Edit2, Loader2 } from "lucide-react";
import { useNotification } from "@/context/NotificationContext"; 

interface LoginFormProps {
  isModal?: boolean;
  isAdmin?: boolean;
}

const CountdownMessage = ({ onFinish }: { onFinish: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(15); 

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

    //  LOGIKA USER 
    if (role === 'user') {
      setTimeout(() => {
        setLoading(false);
        
        if (step === "phone") {
          if(!userName || !phoneNumber) return showToast("Mohon isi nama dan nomor HP", "error");
          setStep("otp"); 
        } else {
          if(!otpCode) return showToast("Masukkan kode OTP", "error");
          
          const userData = { name: userName, phone: phoneNumber, role: 'user' };
          localStorage.setItem("ministay_user", JSON.stringify(userData));
          window.dispatchEvent(new Event("user-update"));

          showPopup(
            "Berhasil Login", 
            <CountdownMessage onFinish={handleSuccessRedirect} />, 
            "success", 
            () => {
               handleSuccessRedirect();
            }
          );
        }
      }, 1000);
    } 
    // ADMIN 
    else {
      if(!adminUser || !adminPass) {
        setLoading(false);
        return showToast("Isi username & password", "error");
      }
      
      try {
        const res = await fetch("/auth/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: adminUser, 
                password: adminPass
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Login gagal. Cek username/password.");
        }

        // Simpan Token Admin & User Data
        if (data.token) {
            localStorage.setItem("ministay_admin_token", data.token);
            
            const adminData = { 
                name: data.user?.name || "Administrator", 
                role: "admin",
                email: data.user?.email
            };
            localStorage.setItem("ministay_user", JSON.stringify(adminData));
            window.dispatchEvent(new Event("user-update"));

            // Redirect ke Dashboard
            window.location.href = "/admin/dashboard";
        } else {
            throw new Error("Token tidak diterima dari server.");
        }

      } catch (error: any) {
        console.error("Login Error:", error);
        showPopup("Gagal Login", error.message || "Terjadi kesalahan server.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={`bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isModal ? 'mx-4' : ''}`}>
      
      <div className="bg-blue-600 p-6 text-center text-white relative shrink-0">
        <button onClick={handleClose} type="button" className="absolute top-4 right-4 text-blue-200 hover:text-white transition">
            <X className="w-6 h-6" />
        </button>

        {step === "phone" && (
            <div className="inline-flex bg-blue-700 rounded-full p-1 mb-4">
            <button type="button" onClick={() => setRole("user")} className={`px-4 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${role === 'user' ? 'bg-white text-blue-600' : 'text-blue-200'}`}>
                <UserCircle className="w-4 h-4"/> Tamu
            </button>
            <button type="button" onClick={() => setRole("admin")} className={`px-4 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${role === 'admin' ? 'bg-white text-blue-600' : 'text-blue-200'}`}>
                <LockKeyhole className="w-4 h-4"/> Admin
            </button>
            </div>
        )}
        
        <h1 className="text-2xl font-bold">{role === 'admin' ? 'Login Admin' : (step === 'otp' ? 'Verifikasi OTP' : 'Selamat Datang')}</h1>
        <p className="text-blue-100 text-sm">
            {role === 'admin' ? 'Akses khusus pengelola' : (step === 'otp' ? 'Masukkan kode yang kami kirim' : 'Masuk untuk melanjutkan')}
        </p>
      </div>

      <div className="p-8 overflow-y-auto">
        <form onSubmit={handleLogin} className="space-y-5">
          
          {role === 'user' ? (
            step === "phone" ? (
              <>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input type="text" placeholder="Nama Anda" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required/>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Nomor WhatsApp</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input type="tel" placeholder="08xx-xxxx-xxxx" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required/>
                    </div>
                </div>
              </>
            ) : (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Kode dikirim ke:</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-gray-800">{phoneNumber}</span>
                        <button type="button" onClick={() => setStep("phone")} className="text-blue-600 p-1 hover:bg-blue-100 rounded"><Edit2 className="w-3 h-3" /></button>
                    </div>
                </div>
                <input type="text" placeholder="X X X X X X" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" maxLength={6} autoFocus required />
              </div>
            )
          ) : (
             <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Username / Email</label>
                  <div className="relative">
                      <UserCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input type="text" placeholder="Username" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input type="password" placeholder="Password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" required />
                  </div>
                </div>
             </>
          )}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-200 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
              {loading ? "Memproses..." : role === 'admin' ? "Masuk Dashboard" : step === "phone" ? "Kirim Kode OTP" : "Verifikasi & Masuk"}
              {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

        </form>
      </div>
    </div>
  );
}