"use client";

import { rooms } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, MapPin, Star, Wind, Wifi, Tv } from "lucide-react";

interface RoomDetailViewProps {
  roomId: number;
  isModal?: boolean;
}

export default function RoomDetailView({ roomId, isModal = false }: RoomDetailViewProps) {
  const router = useRouter();
  const room = rooms.find((r) => r.id === Number(roomId));

  if (!room) return <div className="p-10 text-center bg-white rounded-xl">Kamar tidak ditemukan</div>;

  const handleClose = () => {
    if (isModal) {
      router.back(); // Tutup modal
    } else {
      window.location.href = "/"; // Paksa balik ke home jika bukan modal
    }
  };

  return (
    // Wrapper Card
    // Jika Modal: Pakai backdrop-blur dan bg-white/90 (Transparan dikit/Kaca)
    <div 
        className={`w-full max-w-lg mx-auto overflow-hidden flex flex-col 
        ${isModal 
            ? 'rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md max-h-[85vh]' 
            : 'min-h-screen bg-white'
        }`}
    >
      
      {/* --- HEADER GAMBAR --- */}
      <div className="relative h-64 w-full shrink-0 group">
        <Image src={room.image} alt={room.name} fill className="object-cover" />
        
        {/* Tombol Close */}
        <button 
            onClick={handleClose} 
            className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition z-10"
        >
          {isModal ? <X className="w-5 h-5"/> : "⬅ Kembali"}
        </button>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-2xl font-bold shadow-black drop-shadow-md">{room.name}</h1>
            <p className="text-sm opacity-90 flex items-center gap-1"><MapPin size={14}/> {room.location || 'Jakarta Selatan'}</p>
        </div>
      </div>

      {/* --- CONTENT SCROLLABLE --- */}
      <div className="p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Harga per malam</p>
                <p className="text-blue-600 text-2xl font-bold">
                Rp {room.price.toLocaleString("id-ID")}
                </p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-700">{room.rating || 4.8}</span>
            </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase">Fasilitas</h3>
          <div className="flex flex-wrap gap-2">
            {room.facilities.map((fas, index) => (
              <span key={index} className="px-4 py-2 bg-gray-50 border border-gray-100 text-gray-600 text-xs rounded-xl font-medium flex items-center gap-2">
                {fas.includes("AC") ? <Wind size={14}/> : fas.includes("WiFi") ? <Wifi size={14}/> : <Tv size={14}/>}
                {fas}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase">Tentang Kamar</h3>
            <p className="text-gray-600 text-sm leading-relaxed text-justify">
                {room.description || "Kamar ini memiliki pencahayaan yang baik, sirkulasi udara lancar, dan kebersihan yang terjaga. Sangat cocok untuk istirahat setelah seharian beraktivitas."}
            </p>
        </div>
      </div>

      {/* --- FOOTER ACTION --- */}
      <div className="p-4 border-t border-gray-100 bg-white/50 shrink-0 flex gap-3">
            <Link 
                href={`/chat?context=${encodeURIComponent(room.name)}`}
                className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-xl font-bold text-sm text-center hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
                Tanya Admin
            </Link>
            <button className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                Booking
            </button>
      </div>
    </div>
  );
}