"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, BedDouble, CalendarCheck, Wallet, 
  MessageSquare, LogOut, Building2, CalendarDays, ExternalLink, Loader2 
} from "lucide-react"; 
import { useNotification } from "@/context/NotificationContext"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); 
  const router = useRouter();
  const { showPopup, showToast } = useNotification(); 
  
 
  const [isAuthorized, setIsAuthorized] = useState(false);

  //  LOGIKA AUTH GUARD (PROTEKSI)
  useEffect(() => {
    const token = localStorage.getItem("ministay_admin_token");
    
    if (!token) {
      router.replace("/admin/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  const menus = [
    { name: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Kalender", url: "/admin/calendar", icon: CalendarDays },
    { name: "Kelola Kamar", url: "/admin/rooms", icon: BedDouble },
    { name: "Booking Masuk", url: "/admin/bookings", icon: CalendarCheck },
    { name: "Pendapatan", url: "/admin/finance", icon: Wallet },
    { name: "Chat Tamu", url: "/admin/chat", icon: MessageSquare },
  ];

  const handleLogout = () => {
    showPopup(
      "Keluar dari Admin?",
      "Sesi Anda akan diakhiri dan kembali ke halaman utama.",
      "warning",
      () => {
        localStorage.removeItem("ministay_user");
        localStorage.removeItem("ministay_admin_token");
        
        window.dispatchEvent(new Event("user-update"));
        
        showToast("Berhasil Logout", "success");
        router.push("/"); 
      }
    );
  };

  // TAMPILAN LOADING SEBELUM CEK LOGIN SELESAI 
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500 font-medium">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  //  LAYOUT UTAMA 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
           <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">MiniStay<span className="text-blue-600">.admin</span></h1>
           </div>
           <div className="flex gap-2">
              <Link href="/" className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-blue-600 transition"><ExternalLink className="w-4 h-4"/></Link>
              <button onClick={handleLogout} className="p-2 bg-red-50 rounded-full text-red-500 hover:bg-red-100 transition"><LogOut className="w-4 h-4"/></button>
           </div>
        </div>
        <nav className="flex overflow-x-auto px-4 pb-3 gap-2 scrollbar-hide">
           {menus.map((item) => {
                const isActive = pathname === item.url;
                return (
                    <Link key={item.url} href={item.url} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition shrink-0 ${isActive ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>
                        <item.icon className="w-4 h-4" /> {item.name}
                    </Link>
                );
            })}
        </nav>
      </div>

      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col z-20">
        <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-blue-600">MiniStay<span className="text-gray-400 text-sm">.admin</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menus.map((item) => {
                const isActive = pathname === item.url;
                return (
                    <Link key={item.url} href={item.url} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${isActive ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                        <item.icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} /> {item.name}
                    </Link>
                );
            })}
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Building2 className="w-5 h-5" /></div>
                <div className="overflow-hidden"><p className="text-sm font-bold text-gray-900 truncate">Kos Mawar Melati</p><p className="text-xs text-gray-500 truncate">Owner: Bpk. Budi</p></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Link href="/" className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-gray-600 hover:bg-white hover:shadow-sm hover:text-blue-600 rounded-lg text-[10px] font-medium transition border border-transparent hover:border-gray-200">
                    <ExternalLink className="w-4 h-4" /> Ke Web
                </Link>
                <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-red-500 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-medium transition border border-transparent hover:border-red-100">
                    <LogOut className="w-4 h-4" /> Keluar
                </button>
            </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}