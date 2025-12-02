"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Phone } from "lucide-react";

export default function UserMenu() {
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Cek LocalStorage saat website dimuat
  useEffect(() => {
    setMounted(true); // Menandakan komponen sudah di-render di browser
    const stored = localStorage.getItem("ministay_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  // Fungsi Logout
  const handleLogout = () => {
    if (confirm("Yakin ingin keluar?")) {
      localStorage.removeItem("ministay_user"); // Hapus data
      window.location.reload(); // Refresh halaman
    }
  };

  // Hindari error hydration (tampilan server beda dengan browser)
  if (!mounted) return null; 

  // KONDISI 1: Jika User Sudah Login
  if (user) {
    return (
      <div className="flex items-center gap-3 animate-in fade-in">
        {/* Info User */}
        <div className="text-right hidden md:block">
            <p className="text-white font-bold text-sm leading-tight">{user.name}</p>
            <p className="text-blue-200 text-xs flex items-center justify-end gap-1">
                <Phone className="w-3 h-3" /> {user.phone}
            </p>
        </div>

        {/* Avatar User */}
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white border border-white/10">
            <User className="w-5 h-5" />
        </div>

        {/* Tombol Logout */}
        <button 
            onClick={handleLogout}
            className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full transition shadow-lg"
            title="Keluar"
        >
            <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // KONDISI 2: Jika Belum Login (Tampilkan Tombol Masuk)
  return (
    <Link href="/login" className="bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-white/30 transition border border-white/10 backdrop-blur-sm">
        Masuk
    </Link>
  );
}