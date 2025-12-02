// src/components/RoomCard.tsx
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Wifi, Tv, Wind } from "lucide-react";
import { Room } from "@/types";

export default function RoomCard({ data }: { data: Room }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Gambar Kamar */}
      <div className="relative h-48 w-full">
        <Image
          src={data.image}
          alt={data.name}
          fill
          className="object-cover"
        />
        {/* Badge Status */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white ${
            data.status === 'available' ? 'bg-green-500' : 
            data.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
        }`}>
            {data.status === 'available' ? 'Tersedia' : 
             data.status === 'occupied' ? 'Terisi' : 'Cleaning'}
        </div>
        
        {/* Badge Rating */}
        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            {data.rating || 4.5}
        </div>
      </div>

      {/* Detail Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{data.name}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-3 h-3 mr-1" />
            {data.location || 'Jakarta Selatan'}
        </div>

        {/* Fasilitas (Icon Only) */}
        <div className="flex gap-3 mb-4 text-gray-400">
            <div className="flex items-center gap-1 text-xs"><Wind className="w-4 h-4"/> AC</div>
            <div className="flex items-center gap-1 text-xs"><Wifi className="w-4 h-4"/> WiFi</div>
            <div className="flex items-center gap-1 text-xs"><Tv className="w-4 h-4"/> TV</div>
        </div>

        <hr className="border-dashed border-gray-200 mb-3" />

        {/* Harga & Tombol */}
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-400">Mulai dari</p>
                <p className="text-blue-600 font-bold">
                    Rp {data.price.toLocaleString('id-ID')}
                </p>
            </div>
            <Link 
                href={`/room/${data.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
                Pilih
            </Link>
        </div>
      </div>
    </div>
  );
}