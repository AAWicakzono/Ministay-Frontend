"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, X, UserCircle, LockKeyhole, User, Edit2 } from "lucide-react";

interface LoginFormProps {
  isModal?: boolean;
}

export default function LoginForm({ isModal = false }: LoginFormProps) {
  const router = useRouter();
  
  // === STATE MANAGEMENT ===
  const [role, setRole] = useState<"user" | "admin">("user");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  // State Input User
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState(""); // Tambahan state OTP

  // State Input Admin (Supaya Controlled)
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

const handleClose = () => {
    if (isModal) {
      // Jika sedang dalam mode Modal (Overlay), tutup modalnya aja
      router.back(); 
    } else {
      // Jika sedang dalam mode Halaman Full (misal user refresh page login),
      // pindahkan ke Homepage, jangan back (takutnya malah close tab/browser history)
      router.push("/"); 
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);

    // Simulasi Loading
    setTimeout(() => {
      setLoading(false);
      
      if (role === 'user') {
        if (step === "phone") {
          // Validasi Input
          if(!userName || !phoneNumber) {
             alert("Mohon isi nama dan nomor HP");
             return;
          }
          setStep("otp"); 
        } else {
          // Validasi OTP (Simulasi)
          if(!otpCode) {
            alert("Masukkan kode OTP");
            return;
          }
        // === LOGIN USER SUKSES ===
          // 1. SIMPAN DATA KE BROWSER (LocalStorage)
          const userData = { name: userName, phone: phoneNumber, role: 'user' };
          localStorage.setItem("ministay_user", JSON.stringify(userData));

          // 2. NAVIGASI
          if (isModal) {
          window.location.assign("/");
          }        
        }
        
      } else {
        // Validasi Admin
        if(!adminUser || !adminPass) {
            alert("Isi username dan password admin");
            return;
        }
        // Login Admin
        console.log("Login Admin Success:", { adminUser });
        window.location.href = "/admin/dashboard";
      }
    }, 1000);
  };

  return (
    <div className={`bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isModal ? 'mx-4' : ''}`}>
      
      {/* Header Biru */}
      <div className="bg-blue-600 p-6 text-center text-white relative shrink-0">
        <button onClick={handleClose} type="button" className="absolute top-4 right-4 text-blue-200 hover:text-white transition">
            <X className="w-6 h-6" />
        </button>

        {/* Toggle Role */}
        {step === "phone" && (
            <div className="inline-flex bg-blue-700 rounded-full p-1 mb-4">
            <button
                type="button"
                onClick={() => setRole("user")}
                className={`px-4 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${role === 'user' ? 'bg-white text-blue-600' : 'text-blue-200'}`}
            >
                <UserCircle className="w-4 h-4"/> Tamu
            </button>
            <button
                type="button"
                onClick={() => setRole("admin")}
                className={`px-4 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${role === 'admin' ? 'bg-white text-blue-600' : 'text-blue-200'}`}
            >
                <LockKeyhole className="w-4 h-4"/> Admin
            </button>
            </div>
        )}
        
        <h1 className="text-2xl font-bold">{step === 'otp' ? 'Verifikasi OTP' : 'Selamat Datang'}</h1>
        <p className="text-blue-100 text-sm">
            {step === 'otp' ? 'Masukkan kode yang kami kirim' : 'Masuk untuk melanjutkan ke MiniStay'}
        </p>
      </div>

      {/* Form Area */}
      <div className="p-8 overflow-y-auto">
        <form onSubmit={handleLogin} className="space-y-5">
          
          {role === 'user' ? (
            // === LOGIC USER ===
            step === "phone" ? (
              <>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Nama Anda" 
                            // Perbaikan: Pastikan value selalu string (|| "")
                            value={userName || ""}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Nomor WhatsApp</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input 
                            type="tel" 
                            placeholder="08xx-xxxx-xxxx" 
                            // Perbaikan: Pastikan value selalu string (|| "")
                            value={phoneNumber || ""}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                        />
                    </div>
                </div>
              </>
            ) : (
              // Step 2: Input OTP
              <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Kode dikirim ke:</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-gray-800">{phoneNumber}</span>
                        <button type="button" onClick={() => setStep("phone")} className="text-blue-600 p-1 hover:bg-blue-100 rounded">
                            <Edit2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <input 
                    type="text" 
                    placeholder="X X X X X X" 
                    // Perbaikan: Sekarang OTP Controlled
                    value={otpCode || ""}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                    maxLength={6} 
                    autoFocus 
                    required 
                />
                <p className="text-xs text-gray-400 mt-4">Tidak terima kode? <span className="text-blue-600 font-bold cursor-pointer">Kirim Ulang</span></p>
              </div>
            )
          ) : (
             // === LOGIC ADMIN ===
             <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <div className="relative">
                      <UserCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Username Admin" 
                        // Perbaikan: Sekarang Admin User Controlled
                        value={adminUser || ""}
                        onChange={(e) => setAdminUser(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                        required 
                      />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                      <LockKeyhole className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        // Perbaikan: Sekarang Admin Password Controlled
                        value={adminPass || ""}
                        onChange={(e) => setAdminPass(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" 
                        required 
                      />
                  </div>
                </div>
             </>
          )}

          <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-blue-200 mt-2"
          >
              {loading ? "Memproses..." : role === 'admin' ? "Masuk Dashboard" : step === "phone" ? "Kirim Kode OTP" : "Verifikasi & Masuk"}
              {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

        </form>

        <p className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <LockKeyhole className="w-3 h-3" /> Terlindungi enkripsi end-to-end
        </p>
      </div>
    </div>
  );
}