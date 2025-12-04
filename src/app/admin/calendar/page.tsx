"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Search, BedDouble, MousePointer2 } from "lucide-react";
import { Room } from "@/types";
import { rooms as staticRooms } from "@/lib/data";

export default function AdminCalendarPage() {
  // Data State
  const [rooms, setRooms] = useState<Room[]>(staticRooms);
  const [bookings, setBookings] = useState<any[]>([]);
  
  // UI State
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1. Load Data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRooms = localStorage.getItem("ministay_rooms");
      if (storedRooms) setRooms(JSON.parse(storedRooms));

      const storedBookings = localStorage.getItem("ministay_bookings");
      if (storedBookings) setBookings(JSON.parse(storedBookings));
    }
  }, []);

  // Filter List Kamar
  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Otomatis pilih kamar pertama jika belum ada yang dipilih
  useEffect(() => {
    if (filteredRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(filteredRooms[0].id);
    }
  }, [filteredRooms, selectedRoomId]);

  // Data Kamar Terpilih
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  // 2. Logic Tanggal Bulan Ini
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper: Cek status tanggal
  const getStatusForDate = (roomId: number, day: number) => {
    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);

    for (const b of bookings) {
      if (b.roomId !== roomId) continue;
      if (b.status === 'cancelled') continue;

      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      const cleaningDate = new Date(checkOut);
      cleaningDate.setDate(checkOut.getDate() + 1);

      // A. OCCUPIED
      if (targetDate >= checkIn && targetDate < checkOut) {
        return { status: 'occupied', guest: b.guestName, first: targetDate.getTime() === checkIn.getTime() };
      }

      // B. CLEANING
      if (targetDate.getTime() === checkOut.getTime() || targetDate.getTime() === cleaningDate.getTime()) {
        return { status: 'cleaning', guest: null };
      }
    }
    return null;
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 bg-gray-50/50 p-1">
      
      {/* === KOLOM KIRI: LIST KAMAR === */}
      <div className="w-full md:w-80 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm h-full">
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-600"/> Daftar Kamar
            </h2>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Cari kamar..." 
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* List Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredRooms.map((room) => (
                <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`w-full text-left p-3 rounded-xl transition flex justify-between items-center group ${
                        selectedRoomId === room.id 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                >
                    <div>
                        <p className={`font-bold text-sm ${selectedRoomId === room.id ? "text-white" : "text-gray-900"}`}>{room.name}</p>
                        <p className={`text-xs ${selectedRoomId === room.id ? "text-blue-200" : "text-gray-400"}`}>{room.type}</p>
                    </div>
                    {selectedRoomId === room.id && <MousePointer2 className="w-4 h-4 opacity-50"/>}
                </button>
            ))}
        </div>
      </div>

      {/* === KOLOM KANAN: KALENDER VISUAL === */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
        {selectedRoom ? (
            <>
                {/* Header Kalender */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedRoom.name}</h2>
                        <p className="text-sm text-gray-500">Timeline Ketersediaan</p>
                    </div>
                    
                    {/* Navigator & Legend */}
                    <div className="flex items-center gap-6">
                        <div className="flex gap-4 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-red-500 rounded"></div> Terisi</div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-yellow-400 rounded"></div> Cleaning</div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-gray-100 border border-gray-300 rounded"></div> Kosong</div>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition"><ChevronLeft className="w-4 h-4 text-gray-600"/></button>
                            <span className="text-sm font-bold text-gray-800 min-w-[120px] text-center">
                                {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition"><ChevronRight className="w-4 h-4 text-gray-600"/></button>
                        </div>
                    </div>
                </div>

                {/* AREA KALENDER (GRID BESAR) */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
                    <div className="grid grid-cols-7 gap-2 auto-rows-fr">
                        {/* Header Hari */}
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                            <div key={i} className="text-center text-xs font-bold text-gray-400 uppercase py-2">
                                {d}
                            </div>
                        ))}

                        {/* Spacer Awal Bulan */}
                        {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-24 bg-transparent"></div>
                        ))}

                        {/* Kotak Tanggal */}
                        {daysArray.map(day => {
                            const info = getStatusForDate(selectedRoom.id, day);
                            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                            return (
                                <div 
                                    key={day} 
                                    className={`
                                        h-24 rounded-xl border p-2 flex flex-col justify-between transition relative overflow-hidden group
                                        ${info?.status === 'occupied' ? 'bg-red-50 border-red-200' : 
                                          info?.status === 'cleaning' ? 'bg-yellow-50 border-yellow-200' : 
                                          'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'}
                                    `}
                                >
                                    {/* Tanggal */}
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                                            {day}
                                        </span>
                                    </div>

                                    {/* Info Status */}
                                    {info?.status === 'occupied' && (
                                        <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold truncate">
                                            {info.first ? `👤 ${info.guest}` : '• Terisi'}
                                        </div>
                                    )}
                                    {info?.status === 'cleaning' && (
                                        <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold text-center">
                                            🧹 Cleaning
                                        </div>
                                    )}
                                    {!info && (
                                        <div className="text-center opacity-0 group-hover:opacity-100 transition text-[10px] text-blue-500 font-medium">
                                            Tersedia
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <BedDouble className="w-16 h-16 mb-4 opacity-20"/>
                <p>Pilih kamar di sebelah kiri untuk melihat kalender.</p>
            </div>
        )}
      </div>
    </div>
  );
}