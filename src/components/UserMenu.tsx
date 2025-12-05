"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Phone, LogIn, LayoutDashboard } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { useRouter } from "next/navigation"; // Import Router

export default function UserMenu() {
  const [user, setUser] = useState<{ name: string; phone?: string; role?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { showPopup, showToast } = useNotification();
  const router = useRouter();

  // Load User Data & Setup Listener
  const loadUser = () => {
    const stored = localStorage.getItem("ministay_user");
    setUser(stored ? JSON.parse(stored) : null);
  };

  useEffect(() => {
    setMounted(true);
    loadUser();

    // Dengarkan event storage agar UI update realtime tanpa refresh
    window.addEventListener("storage", loadUser);
    // Custom event untuk trigger manual
    window.addEventListener("user-update", loadUser); 
    
    return () => {
        window.removeEventListener("storage", loadUser);
        window.removeEventListener("user-update", loadUser);
    };
  }, []);

  const handleLogout = () => {
    showPopup(
      "Keluar Aplikasi?",
      "Anda harus login kembali untuk memesan kamar.",
      "warning",
      () => {
        // 1. Hapus Data
        localStorage.removeItem("ministay_user");
        
        // 2. Update UI secara manual (agar tombol berubah jadi 'Masuk')
        setUser(null);
        window.dispatchEvent(new Event("user-update")); 
        
        // 3. Tampilkan Notifikasi dengan Efek Slow Motion
        showToast("Berhasil Logout. Sampai jumpa!", "success");

        // 4. Redirect ke Home (Soft Redirect) jika sedang di halaman admin/protected
        router.push("/");
      }
    );
  };

  if (!mounted) return null; 

  // KONDISI 1: Jika User Sudah Login
  if (user) {
    return (
      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
        
        {/* Info User */}
        <div className="text-right hidden md:block leading-tight">
            <p className="text-white font-bold text-sm truncate max-w-[100px]">{user.name}</p>
            {user.phone && (
                <p className="text-blue-100 text-[10px] flex items-center justify-end gap-1 opacity-80">
                    <Phone className="w-3 h-3" /> {user.phone}
                </p>
            )}
        </div>

        {/* Avatar User */}
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white border border-white/20 shadow-sm backdrop-blur-sm">
            <User className="w-5 h-5" />
        </div>

        {/* Tombol Dashboard (Admin) */}
        {user.role === 'admin' && (
            <Link 
                href="/admin/dashboard" 
                className="group flex items-center bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-all duration-500 ease-in-out border border-white/20 overflow-hidden max-w-9 hover:max-w-[120px] shadow-sm"
                title="Ke Dashboard Admin"
            >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 pl-2 text-xs font-bold whitespace-nowrap transition-opacity duration-300 delay-100">
                    Dashboard
                </span>
            </Link>
        )}

        {/* Tombol Logout */}
        <button 
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/80 text-white p-2 rounded-full transition border border-red-500/30 backdrop-blur-sm shadow-sm"
            title="Keluar"
        >
            <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // KONDISI 2: Jika Belum Login
  return (
    <Link 
        href="/login" 
        className="group bg-white/20 text-white pl-4 pr-5 py-2 rounded-full text-sm font-bold hover:bg-white/30 transition border border-white/20 backdrop-blur-sm flex items-center gap-2 shadow-sm"
    >
        <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/40 transition">
            <LogIn className="w-4 h-4" />
        </div>
        <span>Masuk</span>
    </Link>
  );
}