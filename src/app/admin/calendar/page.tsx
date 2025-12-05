"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, BedDouble, MousePointer2, Clock } from "lucide-react"; // Tambah Icon Clock
import { Room } from "@/types";
import { rooms as staticRooms } from "@/lib/data";

// HELPER PARSING TANGGAL
const parseDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function AdminCalendarPage() {
  const [rooms, setRooms] = useState<Room[]>(staticRooms);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRooms = localStorage.getItem("ministay_rooms");
      if (storedRooms) {
        setRooms(JSON.parse(storedRooms));
      } else {
        setRooms(staticRooms);
        localStorage.setItem("ministay_rooms", JSON.stringify(staticRooms));
      }
      const storedBookings = localStorage.getItem("ministay_bookings");
      if (storedBookings) setBookings(JSON.parse(storedBookings));
    }
  }, []);

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (filteredRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(filteredRooms[0].id);
    }
  }, [filteredRooms, selectedRoomId]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // --- LOGIKA STATUS UTAMA ---
  const getStatusForDate = (roomId: number, day: number) => {
    // 1. Setup Tanggal Target
    const targetDate = new Date(year, month, day);
    targetDate.setHours(0, 0, 0, 0);
    const targetTime = targetDate.getTime();

    // 2. Setup Hari Ini (Untuk Cek Kadaluarsa)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // 3. Cek Booking (Prioritas 1: Riwayat Booking tetap harus muncul walau lampau)
    for (const b of bookings) {
      if (String(b.roomId) !== String(roomId)) continue;
      if (b.status === 'cancelled') continue;

      const checkIn = parseDate(b.checkIn);
      const checkOut = parseDate(b.checkOut);
      
      if (targetTime >= checkIn.getTime() && targetTime < checkOut.getTime()) {
        return { 
            status: 'occupied', 
            guest: b.guestName, 
            first: targetTime === checkIn.getTime() 
        };
      }
    }

    // 4. Cek Kadaluarsa (Prioritas 2: Jika tidak ada booking & tanggal < hari ini)
    if (targetTime < todayTime) {
        return { status: 'expired', guest: null };
    }

    return null; // Tersedia (Masa Depan)
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 bg-gray-50/50 p-1">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm h-full">
        <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><BedDouble className="w-5 h-5 text-blue-600"/> Daftar Kamar</h2>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Cari kamar..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredRooms.map((room) => (
                <button key={room.id} onClick={() => setSelectedRoomId(room.id)} className={`w-full text-left p-3 rounded-xl transition flex justify-between items-center group ${selectedRoomId === room.id ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "hover:bg-gray-50 text-gray-600"}`}>
                    <div><p className={`font-bold text-sm ${selectedRoomId === room.id ? "text-white" : "text-gray-900"}`}>{room.name}</p><p className={`text-xs ${selectedRoomId === room.id ? "text-blue-200" : "text-gray-400"}`}>{room.type}</p></div>
                    {selectedRoomId === room.id && <MousePointer2 className="w-4 h-4 opacity-50"/>}
                </button>
            ))}
        </div>
      </div>

      {/* KALENDER */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
        {selectedRoom ? (
            <>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedRoom.name}</h2>
                        <p className="text-sm text-gray-500">Timeline Ketersediaan</p>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* LEGEND BARU */}
                        <div className="flex gap-4 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-red-500 rounded"></div> Terisi</div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-gray-300 rounded"></div> Kadaluarsa</div>
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-white border border-gray-300 rounded"></div> Tersedia</div>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <button onClick={prevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition"><ChevronLeft className="w-4 h-4 text-gray-600"/></button>
                            <span className="text-sm font-bold text-gray-800 min-w-[120px] text-center">{currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={nextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition"><ChevronRight className="w-4 h-4 text-gray-600"/></button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-6 bg-gray-50/30">
                    <div className="grid grid-cols-7 gap-2 auto-rows-fr">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => <div key={i} className="text-center text-xs font-bold text-gray-400 uppercase py-2">{d}</div>)}
                        
                        {Array.from({ length: new Date(year, month, 1).getDay() }).map((_, i) => <div key={`empty-${i}`} className="h-24 bg-transparent"></div>)}
                        
                        {daysArray.map(day => {
                            const info = getStatusForDate(selectedRoom.id, day);
                            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                            
                            return (
                                <div key={day} 
                                    className={`h-24 rounded-xl border p-2 flex flex-col justify-between transition relative overflow-hidden group 
                                    ${info?.status === 'occupied' ? 'bg-red-50 border-red-200' : 
                                      info?.status === 'expired' ? 'bg-gray-100 border-gray-200 opacity-60' : // Style Kadaluarsa
                                      'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>{day}</span>
                                    </div>
                                    
                                    {/* STATUS TEXT */}
                                    {info?.status === 'occupied' && (
                                        <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold truncate w-full text-center">
                                            {info.first ? `👤 ${info.guest.split(' ')[0]}` : '•'}
                                        </div>
                                    )}
                                    {info?.status === 'expired' && (
                                        <div className="text-center text-[10px] text-gray-400 font-medium flex justify-center items-center gap-1">
                                            <Clock size={10}/> Lewat
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