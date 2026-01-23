"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, LogOut, Phone, LogIn, LayoutDashboard, ChevronDown, Settings } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function UserMenu() {
  const [user, setUser] = useState<{ name: string; phone?: string; role?: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 
  
  const { showPopup, showToast } = useNotification();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const loadUser = () => {
    const stored = localStorage.getItem("ministay_user");
    setUser(stored ? JSON.parse(stored) : null);
  };

  useEffect(() => {
    setMounted(true);
    loadUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("storage", loadUser);
    window.addEventListener("user-update", loadUser);
    
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("storage", loadUser);
        window.removeEventListener("user-update", loadUser);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    showPopup(
        "Keluar Aplikasi?",
        "Anda harus login kembali untuk memesan kamar.",
        "warning",
        () => {
        localStorage.removeItem("ministay_user");
        setUser(null);
        api.defaults.headers.Authorization = "";
        window.dispatchEvent(new Event("user-update")); 
        showToast("Berhasil Logout. Sampai jumpa!", "success");
        router.push("/");
        }
    );
    };


  if (!mounted) return null; 

  // KONDISI 1: Jika User Sudah Login
  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        {/* --- TRIGGER BUTTON (PROFILE) --- */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition duration-200 border border-transparent 
            ${isOpen ? "bg-white/20 border-white/20" : "hover:bg-white/10"}`}
        >
            {/* Avatar */}
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm ring-2 ring-blue-500/30">
                <User className="w-5 h-5" />
            </div>
            
            {/* Nama */}
            <span className="hidden md:block text-white text-sm font-bold truncate max-w-[100px]">
                {user.name.split(" ")[0]}
            </span>
            
            {/* Panah */}
            <ChevronDown className={`w-4 h-4 text-blue-100 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}/>
        </button>

        {/* --- DROPDOWN MENU (Slide Down) --- */}
        {isOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200 z-100">
                
                {/* Header Info */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-gray-900 font-bold text-sm truncate">{user.name}</p>
                    {user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Phone className="w-3 h-3"/> {user.phone}
                        </div>
                    )}
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === 'admin' ? 'Administrator' : 'Member'}
                    </span>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                    {user.role === 'admin' && (
                        <Link 
                            href="/admin/dashboard" 
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard Admin
                        </Link>
                    )}

                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-left">
                        <Settings className="w-4 h-4 text-gray-400" />
                        Pengaturan Akun
                    </button>

                    <div className="h-px bg-gray-100 my-1 mx-2"></div>

                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition text-left"
                    >
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </button>
                </div>
            </div>
        )}
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