"use client"; 

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BedDouble, CalendarCheck, Wallet, MessageSquare, LogOut, Building2, CalendarDays, ExternalLink, User } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 

  const menus = [
    { name: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Kalender", url: "/admin/calendar", icon: CalendarDays },
    { name: "Kelola Kamar", url: "/admin/rooms", icon: BedDouble },
    { name: "Booking Masuk", url: "/admin/bookings", icon: CalendarCheck },
    { name: "Pendapatan", url: "/admin/finance", icon: Wallet },
    { name: "Chat Tamu", url: "/admin/chat", icon: MessageSquare },
  ];

  const handleLogout = () => {
      if (confirm("Yakin ingin keluar dari Admin?")) {
          localStorage.removeItem("ministay_user");
          window.location.href = "/";
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col z-20 shadow-sm">
        
        {/* Brand */}
        <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <Building2 className="w-6 h-6"/> MiniStay<span className="text-gray-400 text-sm font-normal">.admin</span>
            </h1>
        </div>
        
        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menus.map((item) => {
                const isActive = pathname === item.url;
                return (
                    <Link 
                        key={item.url}
                        href={item.url} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition duration-200 ${
                            isActive 
                            ? "bg-blue-50 text-blue-600 shadow-sm" 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} /> 
                        {item.name}
                    </Link>
                );
            })}
        </nav>

        {/* Footer Sidebar (Profil & Logout) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            
            {/* Info Owner */}
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-sm">
                    <User className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate">Kos Mawar Melati</p>
                    <p className="text-[10px] text-gray-500 truncate uppercase font-bold tracking-wider">Administrator</p>
                </div>
            </div>

            {/* Dua Tombol Aksi */}
            <div className="grid grid-cols-2 gap-2">
                
                {/* 1. Ke Landing Page (User View) */}
                <Link 
                    href="/" 
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-500 text-[10px] font-bold transition shadow-sm group"
                    title="Lihat Tampilan User"
                >
                    <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    User View
                </Link>

                {/* 2. Logout */}
                <button 
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-500 text-[10px] font-bold transition shadow-sm group"
                    title="Keluar dari Akun"
                >
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Keluar
                </button>

            </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}