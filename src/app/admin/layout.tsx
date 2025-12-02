"use client"; // Wajib client karena butuh usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BedDouble, CalendarCheck, Wallet, MessageSquare, LogOut, Building2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Untuk cek URL aktif

  // Daftar Menu
  const menus = [
    { name: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Kelola Kamar", url: "/admin/rooms", icon: BedDouble },
    { name: "Booking Masuk", url: "/admin/bookings", icon: CalendarCheck },
    { name: "Pendapatan", url: "/admin/finance", icon: Wallet },
    { name: "Chat Tamu", url: "/chat", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* SIDEBAR FIXED */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col z-20">
        
        {/* 1. Logo Brand */}
        <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-blue-600">MiniStay<span className="text-gray-400 text-sm">.admin</span></h1>
        </div>
        
        {/* 2. Menu Navigasi */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menus.map((item) => {
                const isActive = pathname === item.url;
                return (
                    <Link 
                        key={item.url}
                        href={item.url} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                            isActive 
                            ? "bg-blue-50 text-blue-600" 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} /> 
                        {item.name}
                    </Link>
                );
            })}
        </nav>

        {/* 3. Profil Owner / Hotel (Footer Sidebar) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Building2 className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                    {/* Disini nanti data diambil dari Login */}
                    <p className="text-sm font-bold text-gray-900 truncate">Kos Mawar Melati</p>
                    <p className="text-xs text-gray-500 truncate">Owner: Bpk. Budi</p>
                </div>
            </div>
            <Link href="/" className="flex items-center justify-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition border border-red-100">
                <LogOut className="w-4 h-4" /> Keluar
            </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}