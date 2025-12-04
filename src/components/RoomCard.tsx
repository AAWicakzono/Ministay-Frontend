"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Wifi, Tv, Wind, MessageCircle } from "lucide-react";
import { Room, Review } from "@/types";

export default function RoomCard({ data }: { data: Room }) {
  // State untuk Rating Dinamis (Default ambil dari data awal)
  const [displayRating, setDisplayRating] = useState(data.rating || 4.5);
  const [reviewCount, setReviewCount] = useState(0);

  // Load Rating dari LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedReviews = localStorage.getItem("ministay_reviews");
      if (storedReviews) {
        const reviews: Review[] = JSON.parse(storedReviews);
        
        // Filter review hanya untuk kamar ini
        const roomReviews = reviews.filter((r) => r.roomId === data.id);
        
        if (roomReviews.length > 0) {
          // Hitung Rata-rata
          const total = roomReviews.reduce((acc, curr) => acc + curr.rating, 0);
          const avg = total / roomReviews.length;
          
          setDisplayRating(Number(avg.toFixed(1))); // Contoh: 4.8
          setReviewCount(roomReviews.length);       // Jumlah ulasan
        }
      }
    }
  }, [data.id]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Gambar Kamar */}
      <div className="relative h-48 w-full group">
        <Image
          src={data.image}
          alt={data.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge Status */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white shadow-sm ${
            data.status === 'available' ? 'bg-green-500' : 
            data.status === 'occupied' ? 'bg-red-500' : 'bg-yellow-500'
        }`}>
            {data.status === 'available' ? 'Tersedia' : 
             data.status === 'occupied' ? 'Terisi' : 'Cleaning'}
        </div>
        
        {/* Badge Rating (Updated Dinamis) */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span>{displayRating}</span>
            {/* Tampilkan jumlah ulasan jika ada */}
            {reviewCount > 0 && <span className="text-gray-400 font-normal">({reviewCount})</span>}
        </div>
      </div>

      {/* Detail Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{data.name}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-3 h-3 mr-1" />
            {data.location || 'Jakarta Selatan'}
        </div>

        {/* Fasilitas */}
        <div className="flex gap-3 mb-4 text-gray-400">
            <div className="flex items-center gap-1 text-xs"><Wind className="w-3 h-3"/> AC</div>
            <div className="flex items-center gap-1 text-xs"><Wifi className="w-3 h-3"/> WiFi</div>
            <div className="flex items-center gap-1 text-xs"><Tv className="w-3 h-3"/> TV</div>
        </div>

        <hr className="border-dashed border-gray-200 mb-3 mt-auto" />

        {/* Harga & Tombol Action */}
        <div className="flex items-center justify-between gap-2">
            <div>
                <p className="text-xs text-gray-400">Mulai dari</p>
                <p className="text-blue-600 font-bold">
                    Rp {data.price.toLocaleString('id-ID')}
                </p>
            </div>
            
            <div className="flex gap-2">
                {/* Tombol Chat */}
                <Link
                    href={`/chat?context=${encodeURIComponent(data.name)}&roomId=${data.id}`}
                    className="border border-blue-100 bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition"
                    title="Tanya Admin"
                >
                    <MessageCircle className="w-5 h-5" />
                </Link>

                <Link 
                    href={`/room/${data.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                    Pilih
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}