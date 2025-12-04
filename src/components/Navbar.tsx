"use client";

import Link from "next/link";
import { Home, CalendarCheck, MessageCircle, Star, Building2 } from "lucide-react";
import UserMenu from "@/components/UserMenu";

export default function Navbar() {
  return (
    // Sticky Navbar Container
    <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg transition-all">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* 1. LOGO (Direct ke Beranda) */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition group">
            <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition">
                <Building2 className="w-5 h-5 text-white" />
            </div>
            <span>MiniStay</span>
        </Link>

        {/* 2. MENU ITEMS (Tampil di Desktop) */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="flex items-center gap-1.5 hover:text-blue-200 transition opacity-90 hover:opacity-100">
                <Home className="w-4 h-4"/> Beranda
            </Link>
            <Link href="/my-bookings" className="flex items-center gap-1.5 hover:text-blue-200 transition opacity-90 hover:opacity-100">
                <CalendarCheck className="w-4 h-4"/> Booking
            </Link>
            <Link href="/chat" className="flex items-center gap-1.5 hover:text-blue-200 transition opacity-90 hover:opacity-100">
                <MessageCircle className="w-4 h-4"/> Chat
            </Link>
            {/* LINK BARU KE ULASAN */}
            <Link href="/reviews" className="flex items-center gap-1.5 hover:text-blue-200 transition opacity-90 hover:opacity-100">
                <Star className="w-4 h-4"/> Ulasan Terbaru
            </Link>
        </div>

        {/* 3. LOGIN / USER MENU */}
        <div>
            <UserMenu />
        </div>
      </div>

      {/* 4. MOBILE MENU (Scrollable Horizontal) */}
      <div className="md:hidden border-t border-blue-500/30 bg-blue-700/30 backdrop-blur-md">
        <div className="flex items-center gap-6 px-4 py-3 overflow-x-auto scrollbar-hide text-sm font-medium">
            <Link href="/" className="flex items-center gap-1.5 whitespace-nowrap opacity-80 hover:opacity-100">
                <Home className="w-4 h-4"/> Beranda
            </Link>
            <Link href="/my-bookings" className="flex items-center gap-1.5 whitespace-nowrap opacity-80 hover:opacity-100">
                <CalendarCheck className="w-4 h-4"/> Booking
            </Link>
            <Link href="/chat" className="flex items-center gap-1.5 whitespace-nowrap opacity-80 hover:opacity-100">
                <MessageCircle className="w-4 h-4"/> Chat
            </Link>
            {/* LINK BARU KE ULASAN (Mobile) */}
            <Link href="/reviews" className="flex items-center gap-1.5 whitespace-nowrap opacity-80 hover:opacity-100">
                <Star className="w-4 h-4"/> Ulasan
            </Link>
        </div>
      </div>
    </nav>
  );
}