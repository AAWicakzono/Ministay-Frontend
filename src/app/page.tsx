// src/app/page.tsx
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { rooms } from "@/lib/data";
import RoomCard from "@/components/RoomCard";
import { Search, Calendar, User, Filter, ShieldCheck, Smile, Home } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* === HERO SECTION BIRU === */}
      <header className="bg-blue-600 pt-8 pb-24 px-6 rounded-b-[2.5rem] relative">
        <div className="max-w-4xl mx-auto">
          {/* Top Bar Sederhana */}
          <div className="flex justify-between items-center mb-8">
            <div className="bg-white/20 p-2 rounded-lg">
                <span className="text-white font-bold text-xl">MiniStay</span>
            </div>
              <UserMenu />
          </div>

          {/* Judul Besar */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Temukan Kos Harian <br /> Impianmu
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-lg">
            Booking mudah, harga terjangkau, fasilitas lengkap. Nikmati pengalaman menginap nyaman.
          </p>
        </div>
      </header>

      {/* === SEARCH BAR MELAYANG (Floating) === */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Input Lokasi */}
                <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Search className="text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Cari lokasi atau nama kos..." className="outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"/>
                </div>
                {/* Input Tanggal */}
                <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Calendar className="text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Pilih Tanggal" className="outline-none w-full text-sm text-gray-700"/>
                </div>
                {/* Tombol Cari */}
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                    Cari Kamar
                </button>
            </div>
        </div>
      </div>

      {/* === STATISTIK SINGKAT === */}
      <div className="max-w-4xl mx-auto px-6 mt-8 grid grid-cols-4 gap-2 text-center">
        <div className="bg-white p-3 rounded-xl shadow-sm">
            <div className="mx-auto w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-1">
                <Home className="w-4 h-4"/>
            </div>
            <p className="text-[10px] text-gray-500">Tersedia</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm">
            <div className="mx-auto w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-1">
                <User className="w-4 h-4"/>
            </div>
            <p className="text-[10px] text-gray-500">1.2k Tamu</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm">
            <div className="mx-auto w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-1">
                <Smile className="w-4 h-4"/>
            </div>
            <p className="text-[10px] text-gray-500">4.8 Rating</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm">
            <div className="mx-auto w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-1">
                <ShieldCheck className="w-4 h-4"/>
            </div>
            <p className="text-[10px] text-gray-500">Aman</p>
        </div>
      </div>

      {/* === FILTER KATEGORI === */}
      <div className="max-w-4xl mx-auto px-6 mt-8 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter & Kategori
            </h2>
            <button className="text-blue-600 text-xs font-semibold">Reset Filter</button>
        </div>
        {/* Scrollable Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap shadow-md shadow-blue-200">
                Semua Kamar
            </button>
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50">
                ⚡ Tersedia Sekarang
            </button>
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50">
                💰 Harga Hemat
            </button>
             <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50">
                💎 Premium
            </button>
        </div>
      </div>

      {/* === LIST KAMAR (GRID) === */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Kamar Tersedia</h2>
            <p className="text-xs text-gray-500">Menampilkan {rooms.length} kamar</p>
        </div>

        {/* Grid Responsive: 1 kolom di HP, 2 di Tablet, 3 di Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room.id} data={room} />
          ))}
        </div>
      </div>
      
    </main>
  );
}