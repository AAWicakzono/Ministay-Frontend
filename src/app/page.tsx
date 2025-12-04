"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar"; // 1. Import Navbar
import Link from "next/link";
import { rooms as initialRooms } from "@/lib/data";
import RoomCard from "@/components/RoomCard";
import { Room } from "@/types";
import { Search, Calendar, User, Filter, ShieldCheck, Smile, Home } from "lucide-react";

export default function HomePage() {
  const [roomList, setRoomList] = useState<Room[]>(initialRooms);

  // Load data terbaru dari LocalStorage (agar sinkron dengan Admin)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRooms = localStorage.getItem("ministay_rooms");
      if (storedRooms) {
        setRoomList(JSON.parse(storedRooms));
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      {/* 2. PASANG NAVBAR DISINI */}
      {/* Navbar ini sticky dan sudah berisi Logo, Menu, & Login */}
      <Navbar />

      {/* === HERO SECTION BIRU === */}
      {/* Note: Kita hapus 'Top Bar Sederhana' di sini karena sudah ada Navbar */}
      <header className="bg-blue-600 pt-10 pb-24 px-6 rounded-b-[2.5rem] relative -mt-1">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          
          {/* Judul Besar */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Temukan Kos Harian <br /> Impianmu
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-lg mx-auto md:mx-0">
            Booking mudah, harga terjangkau, fasilitas lengkap. Nikmati pengalaman menginap nyaman tanpa ribet.
          </p>
        </div>
      </header>

      {/* === SEARCH BAR MELAYANG (Floating) === */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Input Lokasi */}
                <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <Search className="text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Cari lokasi atau nama kos..." className="outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"/>
                </div>
                {/* Input Tanggal */}
                <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <Calendar className="text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Pilih Tanggal" className="outline-none w-full text-sm text-gray-700"/>
                </div>
                {/* Tombol Cari */}
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95">
                    Cari Kamar
                </button>
            </div>
        </div>
      </div>

      {/* === STATISTIK SINGKAT === */}
      <div className="max-w-4xl mx-auto px-6 mt-8 grid grid-cols-4 gap-2 text-center">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-1">
                <Home className="w-4 h-4"/>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Tersedia</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-1">
                <User className="w-4 h-4"/>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">1.2k Tamu</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-1">
                <Smile className="w-4 h-4"/>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">4.8 Rating</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-1">
                <ShieldCheck className="w-4 h-4"/>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">Aman</p>
        </div>
      </div>

      {/* === FILTER KATEGORI === */}
      <div className="max-w-4xl mx-auto px-6 mt-8 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter & Kategori
            </h2>
            <button className="text-blue-600 text-xs font-semibold hover:underline">Reset Filter</button>
        </div>
        {/* Scrollable Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap shadow-md shadow-blue-200 transition hover:bg-blue-700">
                Semua Kamar
            </button>
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50 transition">
                ⚡ Tersedia Sekarang
            </button>
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50 transition">
                💰 Harga Hemat
            </button>
             <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-50 transition">
                💎 Premium
            </button>
        </div>
      </div>

      {/* === LIST KAMAR (GRID) === */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Kamar Tersedia</h2>
            <p className="text-xs text-gray-500">Menampilkan {roomList.length} kamar</p>
        </div>

        {/* Grid Responsive: 1 kolom di HP, 2 di Tablet, 3 di Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomList.map((room) => (
            <RoomCard key={room.id} data={room} />
          ))}
        </div>
      </div>
      
    </main>
  );
}