"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X, MapPin, Star, Wind, Wifi, Tv, Calendar,
  ChevronLeft, ChevronRight, MessageCircle, UserCircle, LogIn,
  BedDouble, Bath, Coffee, Utensils, Armchair, Briefcase, Loader2
} from "lucide-react";
import { Room, Review } from "@/types";

interface RoomDetailViewProps {
  roomId: number;
  isModal?: boolean;
}

interface SimpleBooking {
  checkIn: string;
  checkOut: string;
}

const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const getFacilityIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes("ac")) return <Wind size={14} />;
  if (lower.includes("wifi")) return <Wifi size={14} />;
  if (lower.includes("tv")) return <Tv size={14} />;
  if (lower.includes("bed")) return <BedDouble size={14} />;
  if (lower.includes("bath") || lower.includes("mandi")) return <Bath size={14} />;
  if (lower.includes("kitchen") || lower.includes("dapur")) return <Utensils size={14} />;
  if (lower.includes("coffee") || lower.includes("kopi")) return <Coffee size={14} />;
  if (lower.includes("sofa") || lower.includes("balkon")) return <Armchair size={14} />;
  if (lower.includes("desk") || lower.includes("kerja")) return <Briefcase size={14} />;
  return <Star size={14} />;
};

export default function RoomDetailView({ roomId, isModal = false }: RoomDetailViewProps) {
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [existingBookings, setExistingBookings] = useState<SimpleBooking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeImage, setActiveImage] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchRoomDetail = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/rooms/${roomId}`);
        const data = response.data;

        const imagePaths = 
          Array.isArray(data.images) && data.images.length > 0
          ? data.images.map((img: any) => img.path) : [];
        setImages(imagePaths);
        const coverImage = 
          data.images?.find((img: any) => img.is_cover)?.path||
          imagePaths[0] || "https://placehold.co/600x400?text=No+Image"

        setActiveImage(coverImage);

        const mappedRoom: Room = {
          id: data.id,
          name: data.name,
          type: data.type || "Standard",
          price: Number(data.price_per_day),
          status: "available",
          image: coverImage,
          description: data.description,
          facilities: Array.isArray(data.facilities) ? data.facilities : [],
          rating: data.rating ? Number(data.rating) : 0,
          location: data.location || "Lokasi Strategis",
        };

        setRoom(mappedRoom);
      } catch (err) {
        console.error(err);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) fetchRoomDetail();
  }, [roomId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("ministay_user");
      setIsLoggedIn(!!user);

      const storedBookings = JSON.parse(
        localStorage.getItem("ministay_bookings") || "[]"
      );
      setExistingBookings(
        storedBookings.filter(
          (b: any) => String(b.roomId) === String(roomId) && b.status !== "cancelled"
        )
      );

      const storedReviews = JSON.parse(
        localStorage.getItem("ministay_reviews") || "[]"
      );
      setReviews(
        storedReviews.filter((r: Review) => String(r.roomId) === String(roomId))
      );
    }
  }, [roomId]);

  if (isLoading) {
    return (
      <div className={`w-full max-w-lg mx-auto h-[500px] flex flex-col items-center justify-center bg-white ${isModal ? "rounded-2xl" : ""}`}>
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Memuat detail kamar...</p>
      </div>
    );
  }

  if (!room || error) {
    return (
      <div className="p-10 text-center bg-white rounded-xl w-full max-w-lg mx-auto">
        <p className="text-red-500 mb-4">{error || "Kamar tidak ditemukan"}</p>
        <button
          onClick={() => (isModal ? router.back() : (window.location.href = "/"))}
          className="text-blue-600 underline text-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  const displayRating =
    room.rating ||
    (reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : "Baru");

  // LOGIC KALENDER (SAMA SEPERTI SEBELUMNYA)
  const isDateBooked = (date: Date) => {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const targetTime = target.getTime();

    return existingBookings.some(b => {
        const start = parseDate(b.checkIn).getTime();
        const end = parseDate(b.checkOut).getTime();
        return targetTime >= start && targetTime < end;
    });
  };

  const isDatePassed = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isRangeAvailable = (start: string, end: string) => {
    if (!start || !end) return false;
    let curr = parseDate(start);
    const last = parseDate(end);
    
    while (curr < last) {
        if (isDateBooked(curr)) return false;
        curr.setDate(curr.getDate() + 1);
    }
    return true;
  };

  const getDays = () => {
    if (!checkIn || !checkOut) return 0;
    const start = parseDate(checkIn);
    const end = parseDate(checkOut);
    if (end <= start) return 0;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); 
  };

  const days = getDays();

  const handleMainAction = () => {
    if (!isLoggedIn) {
        router.push("/login");
        return;
    }
    if (!checkIn || !checkOut) return alert("Pilih tanggal dulu.");
    if (new Date(checkIn) < new Date(todayStr)) return alert("Tidak bisa memesan tanggal lampau.");
    if (!isRangeAvailable(checkIn, checkOut)) return alert("Tanggal sudah terisi.");
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
        dateObj.setHours(0, 0, 0, 0);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const booked = isDateBooked(dateObj);
        const passed = isDatePassed(dateObj);
        const disabled = booked || passed;
        const isSelected = (checkIn === dateStr) || (checkOut === dateStr);
        const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

        daysArray.push(
            <button 
                key={day} 
                disabled={disabled}
                onClick={() => {
                    if (disabled) return;
                    if (!checkIn || (checkIn && checkOut)) { setCheckIn(dateStr); setCheckOut(""); } 
                    else if (dateStr > checkIn) { setCheckOut(dateStr); }
                    else { setCheckIn(dateStr); }
                }}
                className={`
                    h-8 w-8 flex items-center justify-center text-xs rounded-full transition
                    ${disabled ? 'text-gray-300 cursor-not-allowed line-through bg-gray-50' : 'hover:bg-blue-50 text-gray-700 cursor-pointer'}
                    ${isSelected ? 'bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700' : ''}
                    ${isInRange && !disabled ? 'bg-blue-50 text-blue-600' : ''}
                `}
            >
                {day}
            </button>
        );
    }
    return daysArray;
  };

  return (
    <div className={`w-full max-w-lg mx-auto overflow-hidden flex flex-col ${isModal ? 'rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md max-h-[85vh]' : 'min-h-screen bg-white'}`}>
      
      {/* --- GAMBAR HEADER --- */}
      <div className="relative h-64 w-full shrink-0 group bg-gray-200">
        <Image 
            src={activeImage} 
            alt={room.name} 
            fill 
            className="object-cover transition duration-500" 
            sizes="(max-width: 768px) 100vw, 500px"
        />
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-2 z-10">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${activeImage === img ? "border-white" : "border-white/50 hover:border-white"}`}>
                  <Image
                    src={img}
                    alt = {`Thumbnail ${idx + 1}`}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />

              </button>
            ))}
          </div>
        )}
        <button onClick={() => isModal ? router.back() : window.location.href="/"} className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition z-10">
          {isModal ? <X className="w-5 h-5"/> : "⬅ Kembali"}
        </button>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-bold shadow-black drop-shadow-md">{room.name}</h1>
            <p className="text-sm opacity-90 flex items-center gap-1"><MapPin size={14}/> {room.location}</p>
        </div>
      </div>

      {/* --- KONTEN DETAIL --- */}
      <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
        <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Harga per malam</p>
                <p className="text-blue-600 text-2xl font-bold">Rp {room.price.toLocaleString("id-ID")}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-700">{displayRating}</span>
            </div>
        </div>

        {/* --- CALENDAR WIDGET --- */}
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600"/> Ketersediaan</h3>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-4 h-4"/></button>
                    <span className="text-xs font-bold text-gray-700 w-24 text-center">{currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</span>
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

        <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Check-In</label>
                <input type="date" min={todayStr} value={checkIn} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" onChange={(e) => setCheckIn(e.target.value)}/>
            </div>
            <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Check-Out</label>
                <input type="date" min={checkIn || todayStr} value={checkOut} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" onChange={(e) => setCheckOut(e.target.value)}/>
            </div>
        </div>

        {/* FASILITAS */}
        <div className="mb-6 space-y-4">
            <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">Fasilitas</h3>
                <div className="flex flex-wrap gap-2">
                    {room.facilities.length > 0 ? room.facilities.map((fas, i) => (
                        <span key={i} className="px-4 py-2 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-xl font-medium flex items-center gap-2">
                            {getFacilityIcon(fas)}
                            {fas}
                        </span>
                    )) : (
                        <span className="text-gray-400 text-xs italic">Tidak ada info fasilitas.</span>
                    )}
                </div>
            </div>
            
            <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">Deskripsi</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{room.description || "Kamar nyaman dengan fasilitas lengkap."}</p>
            </div>
        </div>

        {/* ULASAN TAMU */}
        <div className="border-t border-gray-100 pt-6">
            <h3 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4 text-blue-600"/> Ulasan Tamu ({reviews.length})</h3>
            {reviews.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p className="text-xs text-gray-400">Belum ada ulasan.</p></div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><UserCircle className="w-5 h-5"/></div>
                                    <div><p className="text-xs font-bold text-gray-900">{rev.guestName}</p><p className="text-[10px] text-gray-400">{rev.date}</p></div>
                                </div>
                                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />))}</div>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm shrink-0 flex gap-3">
            <Link href={`/chat?context=${encodeURIComponent(room.name)}&roomId=${room.id}`} className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-xl font-bold text-sm text-center hover:bg-blue-50 flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Chat
            </Link>
            <button onClick={handleMainAction} className={`flex-2 text-white py-3 rounded-xl font-bold text-sm flex flex-col items-center justify-center leading-tight ${!isLoggedIn ? 'bg-blue-600 hover:bg-blue-700' : (days > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed')}`} disabled={isLoggedIn && days <= 0}>
                {!isLoggedIn ? (<span className="flex items-center gap-2"><LogIn className="w-4 h-4"/> Masuk untuk Pesan</span>) : (<><span>{days > 0 ? `Pesan (${days} Malam)` : "Pilih Tanggal"}</span>{days > 0 && <span className="text-[10px] font-normal opacity-80">Total: Rp {(room.price * days).toLocaleString('id-ID')}</span>}</>)}
            </button>
      </div>
    </div>
  );
}