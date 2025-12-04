"use client";

import { useState, useEffect } from "react";
import { rooms as staticRooms } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, MapPin, Star, Wind, Wifi, Tv, Calendar, ChevronLeft, ChevronRight, MessageCircle, UserCircle, LogIn } from "lucide-react";
import { Room, Review } from "@/types";
import { useNotification } from "@/context/NotificationContext";

interface RoomDetailViewProps {
  roomId: number;
  isModal?: boolean;
}

interface SimpleBooking {
  checkIn: string;
  checkOut: string;
}

export default function RoomDetailView({ roomId, isModal = false }: RoomDetailViewProps) {
  const { showToast } = useNotification(); 
  const router = useRouter();
  
  // 1. DATA KAMAR
  const [room] = useState<Room | undefined>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ministay_rooms");
      if (stored) {
        const parsedRooms = JSON.parse(stored);
        const found = parsedRooms.find((r: Room) => r.id === roomId);
        if (found) return found;
      }
    }
    return staticRooms.find((r) => r.id === roomId);
  });

  // 2. STATE
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [existingBookings, setExistingBookings] = useState<SimpleBooking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 
  
  // State Login
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 3. LOAD DATA (Bookings, Reviews, User Status)
  useEffect(() => {
    if (typeof window !== "undefined") {
        // Cek Login Status
        const user = localStorage.getItem("ministay_user");
        setIsLoggedIn(!!user);

        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        const formatDate = (d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

        // Dummy bookings
        const dummyBookings: SimpleBooking[] = [
            { checkIn: formatDate(5), checkOut: formatDate(7) },
            { checkIn: formatDate(20), checkOut: formatDate(22) }
        ];

        // Load Real Bookings
        const storedBookings = JSON.parse(localStorage.getItem("ministay_bookings") || "[]");
        const roomBookings = storedBookings.filter((b: any) => b.roomId === roomId);
        setExistingBookings([...dummyBookings, ...roomBookings]);

        // Load Reviews
        const storedReviews = JSON.parse(localStorage.getItem("ministay_reviews") || "[]");
        const roomReviews = storedReviews.filter((r: Review) => r.roomId === roomId);
        setReviews(roomReviews);
    }
  }, [roomId]);

  if (!room) return <div className="p-10 text-center bg-white rounded-xl">Kamar tidak ditemukan</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : room.rating;

  // --- LOGIC KALENDER ---
  const isDateBooked = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return existingBookings.some(b => dateStr >= b.checkIn && dateStr <= b.checkOut);
  };

  const isRangeAvailable = (start: string, end: string) => {
    if (!start || !end) return false;
    let curr = new Date(start);
    const last = new Date(end);
    while (curr <= last) {
        if (isDateBooked(curr)) return false;
        curr.setDate(curr.getDate() + 1);
    }
    return true;
  };

  const getDays = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) return 0;
    return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); 
  };

  const days = getDays();

  // --- HANDLER TOMBOL UTAMA ---
  const handleMainAction = () => {
    // 1. Jika Belum Login -> Arahkan ke Login
    if (!isLoggedIn) {
        // Simpan url saat ini agar nanti bisa redirect balik (opsional, tahap lanjut)
        router.push("/login");
        return;
    }

    // 2. Jika Sudah Login -> Lanjut Booking Logic
    if (!checkIn || !checkOut) return showToast("Pilih tanggal dulu.", "warning");
    if (!isRangeAvailable(checkIn, checkOut)) return showToast("Tanggal sudah terisi.", "warning");
    router.push(`/checkout?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&days=${days}`);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = [];

    for (let i = 0; i < firstDay; i++) daysArray.push(<div key={`empty-${i}`} className="h-8"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dateStr = dateObj.toISOString().split('T')[0];
        const booked = isDateBooked(dateObj);
        const isSelected = (checkIn === dateStr) || (checkOut === dateStr);
        const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

        daysArray.push(
            <div 
                key={day} 
                onClick={() => {
                    if (booked) return;
                    if (!checkIn || (checkIn && checkOut)) { setCheckIn(dateStr); setCheckOut(""); } 
                    else if (dateStr > checkIn) { setCheckOut(dateStr); }
                    else { setCheckIn(dateStr); }
                }}
                className={`
                    h-8 w-8 flex items-center justify-center text-xs rounded-full cursor-pointer transition
                    ${booked ? 'bg-gray-100 text-gray-300 line-through cursor-not-allowed' : 'hover:bg-blue-50 text-gray-700'}
                    ${isSelected ? 'bg-blue-600 text-white font-bold shadow-md' : ''}
                    ${isInRange && !booked ? 'bg-blue-50 text-blue-600' : ''}
                `}
            >
                {day}
            </div>
        );
    }
    return daysArray;
  };

  return (
    <div className={`w-full max-w-lg mx-auto overflow-hidden flex flex-col ${isModal ? 'rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md max-h-[85vh]' : 'min-h-screen bg-white'}`}>
      
      {/* Header Gambar */}
      <div className="relative h-64 w-full shrink-0 group">
        <Image src={room.image} alt={room.name} fill className="object-cover" />
        <button onClick={() => isModal ? router.back() : window.location.href="/"} className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition z-10">
          {isModal ? <X className="w-5 h-5"/> : "⬅ Kembali"}
        </button>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-bold shadow-black drop-shadow-md">{room.name}</h1>
            <p className="text-sm opacity-90 flex items-center gap-1"><MapPin size={14}/> {room.location || 'Jakarta Selatan'}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Harga per malam</p>
                <p className="text-blue-600 text-2xl font-bold">Rp {room.price.toLocaleString("id-ID")}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-700">{averageRating}</span>
                <span className="text-xs text-gray-400">({reviews.length})</span>
            </div>
        </div>

        {/* Kalender Visual */}
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600"/> Ketersediaan
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4"/></button>
                    <span className="text-xs font-bold text-gray-700 w-24 text-center">
                        {currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-4 h-4"/></button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center mb-2">
                {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => <span key={i} className="text-[10px] font-bold text-gray-400">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1 justify-items-center">
                {renderCalendar()}
            </div>
        </div>

        {/* Input Tanggal Manual */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Check-In</label>
                <input type="date" value={checkIn} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" onChange={(e) => setCheckIn(e.target.value)}/>
            </div>
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Check-Out</label>
                <input type="date" value={checkOut} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" onChange={(e) => setCheckOut(e.target.value)}/>
            </div>
        </div>

        {/* Fasilitas & Deskripsi */}
        <div className="mb-6 space-y-4">
            <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">Fasilitas</h3>
                <div className="flex flex-wrap gap-2">
                    {room.facilities.map((fas, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{fas}</span>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">Deskripsi</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{room.description || "Kamar nyaman dengan fasilitas lengkap."}</p>
            </div>
        </div>

        {/* Review Section */}
        <div className="border-t border-gray-100 pt-6">
            <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600"/> Ulasan Tamu ({reviews.length})
            </h3>
            
            {reviews.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400">Belum ada ulasan.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                        <UserCircle className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{rev.guestName}</p>
                                        <p className="text-[10px] text-gray-400">{rev.date}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* --- FOOTER ACTION (UPDATED) --- */}
      <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm shrink-0 flex gap-3">
            <Link href={`/chat?context=${encodeURIComponent(room.name)}&roomId=${room.id}`} className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-xl font-bold text-sm text-center hover:bg-blue-50 flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Chat
            </Link>
            
            {/* TOMBOL DINAMIS: LOGIN atau PESAN */}
            <button 
                onClick={handleMainAction}
                className={`flex-2 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-200 flex flex-col items-center justify-center leading-tight 
                ${!isLoggedIn 
                    ? 'bg-blue-600 hover:bg-blue-700' // Tombol Login selalu biru aktif
                    : (days > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed')
                }`}
                disabled={isLoggedIn && days <= 0} // Disable hanya jika sudah login TAPI belum pilih tanggal
            >
                {!isLoggedIn ? (
                    <span className="flex items-center gap-2"><LogIn className="w-4 h-4"/> Masuk untuk Pesan</span>
                ) : (
                    <>
                        <span>{days > 0 ? `Pesan (${days} Malam)` : "Pilih Tanggal"}</span>
                        {days > 0 && <span className="text-[10px] font-normal opacity-80">Total: Rp {(room.price * days).toLocaleString('id-ID')}</span>}
                    </>
                )}
            </button>
      </div>
    </div>
  );
}