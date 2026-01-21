"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { rooms as initialRooms } from "@/lib/data"; 
import RoomCard from "@/components/RoomCard";
import { Room } from "@/types";
import { Search, Calendar, User, Filter, ShieldCheck, Smile, Home, X, RotateCcw } from "lucide-react";
import api from "@/lib/axios";

const parseDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function HomePage() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]); 

const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/rooms');
      const backendData = response.data;
      
      const rawData = Array.isArray(backendData) ? backendData : backendData.data || [];

      const mappedRooms: Room[] = rawData.map((item: any) => {
        const imageUrl = item.cover_image 
          ? `${api.defaults.baseURL}/storage/${item.cover_image}`
            : "https://placehold.co/600x400?text=No+Image";

      return {
          id: item.id,
          name: item.name,
          type: item.type || "Standard", 
          price: parseInt(item.price_per_day), 
          status: "available", 
          image: imageUrl,
          facilities: ["AC", "WiFi", "TV"], 
          description: "Kamar nyaman dengan lokasi strategis.",
          rating: item.rating ? Number(item.rating) : 4.5,
          location: item.location || "Lokasi Strategis" 
        };
      });

      setAllRooms(mappedRooms);
      setFilteredRooms(mappedRooms);

    } catch (error) {
      console.error("Error loading rooms:", error);
      setAllRooms(initialRooms);
      setFilteredRooms(initialRooms);
    } finally {
      setIsLoading(false);
    }

    // Load Bookings (LocalStorage) untuk cek availability tanggal
    if (typeof window !== "undefined") {
      const storedBookings = localStorage.getItem("ministay_bookings");
      if (storedBookings) setBookings(JSON.parse(storedBookings));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- LOGIKA FILTERING TETAP SAMA SEPERTI SEBELUMNYA ---
  useEffect(() => {
    let result = [...allRooms];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
          r.name.toLowerCase().includes(query) || 
          (r.location && r.location.toLowerCase().includes(query))
      );
    }

    if (searchDate) {
      const checkDate = new Date(searchDate);
      if (!isNaN(checkDate.getTime())) {
        checkDate.setHours(0, 0, 0, 0);
        const checkTime = checkDate.getTime();

        result = result.filter((room) => {
          const isBooked = bookings.some((b: any) => {
            if (String(b.roomId) !== String(room.id) || b.status === "cancelled") return false;
            const start = parseDate(b.checkIn).getTime();
            const end = parseDate(b.checkOut).getTime();
            return checkTime >= start && checkTime < end;
          });
          return !isBooked; 
        });
      }
    }

    if (activeFilters.length > 0) {
        result = result.filter(r => {
            return activeFilters.every(filter => {
                if (filter === "available") return r.status === 'available';
                if (filter === "cheap") return r.price < 200000;
                if (filter === "premium") return r.price >= 200000;
                return true;
            });
        });
    }

    setFilteredRooms(result);
  }, [allRooms, searchQuery, searchDate, activeFilters, bookings]);

  // Handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
  };

  const toggleFilter = (key: string) => {
    setActiveFilters(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSearchDate("");
    setActiveFilters([]);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar />

      <header className="bg-blue-600 pt-10 pb-24 px-6 rounded-b-[2.5rem] relative -mt-1">
        <div className="max-w-4xl mx-auto text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Temukan Kos Harian <br /> Impianmu
          </h1>
          <p className="text-blue-100 text-sm md:text-base max-w-lg mx-auto md:mx-0">
            Booking mudah, harga terjangkau, fasilitas lengkap.
          </p>
        </div>
      </header>

      <div className="px-6 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-500 transition relative">
                    <Search className="text-gray-400 w-5 h-5 shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Cari lokasi atau nama kos..." 
                        className="outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && <button onClick={() => setSearchQuery("")} className="text-gray-300 hover:text-gray-500"><X className="w-4 h-4"/></button>}
                </div>
                <div className="flex-1 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <Calendar className="text-gray-400 w-5 h-5 shrink-0" />
                    <input 
                        type="date" 
                        className="outline-none w-full text-sm text-gray-700 uppercase bg-transparent"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-4xl mx-auto px-6 mt-8 grid grid-cols-4 gap-2 text-center">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-1"><Home className="w-4 h-4"/></div>
            <p className="text-[10px] text-gray-500 font-medium">{allRooms.length} Kamar</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-1"><User className="w-4 h-4"/></div>
            <p className="text-[10px] text-gray-500 font-medium">1.2k Tamu</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-1"><Smile className="w-4 h-4"/></div>
            <p className="text-[10px] text-gray-500 font-medium">4.8 Rating</p>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <div className="mx-auto w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-1"><ShieldCheck className="w-4 h-4"/></div>
            <p className="text-[10px] text-gray-500 font-medium">Aman</p>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="max-w-4xl mx-auto px-6 mt-8 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><Filter className="w-4 h-4" /> Filter & Kategori</h2>
            {(searchQuery || searchDate || activeFilters.length > 0) && (
                <button onClick={handleReset} className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1 rounded-lg transition flex items-center gap-1"><RotateCcw className="w-3 h-3"/> Reset Filter</button>
            )}
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button onClick={() => toggleFilter("available")} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition shadow-sm border flex items-center gap-2 ${activeFilters.includes("available") ? "bg-green-600 text-white border-green-600 shadow-green-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>⚡ Tersedia Sekarang {activeFilters.includes("available") && <X className="w-3 h-3"/>}</button>
            <button onClick={() => toggleFilter("cheap")} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition shadow-sm border flex items-center gap-2 ${activeFilters.includes("cheap") ? "bg-orange-500 text-white border-orange-500 shadow-orange-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>💰 Harga Hemat {activeFilters.includes("cheap") && <X className="w-3 h-3"/>}</button>
            <button onClick={() => toggleFilter("premium")} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition shadow-sm border flex items-center gap-2 ${activeFilters.includes("premium") ? "bg-purple-600 text-white border-purple-600 shadow-purple-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>💎 Premium {activeFilters.includes("premium") && <X className="w-3 h-3"/>}</button>
        </div>
      </div>

      {/* LIST KAMAR */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-lg">Kamar Tersedia</h2>
            <p className="text-xs text-gray-500">Menampilkan {filteredRooms.length} kamar</p>
        </div>

        {isLoading ? (
            <div className="text-center py-20">
                <p className="text-gray-500 animate-pulse">Sedang memuat data...</p>
            </div>
        ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
                <RoomCard key={room.id} data={room} />
            ))}
            </div>
        ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔍</div>
                <h3 className="font-bold text-gray-900 mb-1">Tidak ada kamar ditemukan</h3>
                <p className="text-sm text-gray-400">Coba kurangi filter atau ubah kata kunci.</p>
                <button onClick={handleReset} className="text-blue-600 font-bold text-sm mt-4 hover:underline">Reset Pencarian</button>
            </div>
        )}
      </div>
    </main>
  );
}