"use client";

import { useState, useEffect, JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Wifi, Tv, Wind, MessageCircle, Droplet, ParkingCircle ,AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Room, Review } from "@/types";

// Helper Parse Date
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};


export default function RoomCard({ data }: { data: Room }) {
  const [displayRating, setDisplayRating] = useState(data.rating);
  const [reviewCount, setReviewCount] = useState(0);

  const facilityMap: Record<string, { icon: JSX.Element; label: string }> = {
    ac: { icon: <Wind className="w-3 h-3" />, label: "AC" },
    wifi: { icon: <Wifi className="w-3 h-3" />, label: "WiFi" },
    tv: { icon: <Tv className="w-3 h-3" />, label: "TV" },
    "water heater": { icon: <Droplet className="w-3 h-3" />, label: "Water Heater" },
    parking: { icon: <ParkingCircle className="w-3 h-3" />, label: "Parkir" },
    sofa: { icon: <MessageCircle className="w-3 h-3" />, label: "Sofa" },
    lemari: { icon: <CheckCircle className="w-3 h-3" />, label: "Lemari" },
    "kamar mandi": { icon: <Droplet className="w-3 h-3" />, label: "Kamar Mandi" },
    "air mineral": { icon: <Droplet className="w-3 h-3" />, label: "Air Mineral" },
  };


  const facilities = (data.facilities || []).map(f => 
    f.toLowerCase().trim()
  );
  
  // const [availabilityBadge, setAvailabilityBadge] = useState({
  //   label: "Memuat...",
  //   color: "bg-gray-400",
  //   icon: <div className="w-2 h-2 bg-white rounded-full"/>
  // });

  useEffect(() => {
    if (typeof window !== "undefined") {

      // 1. Load Reviews
      const storedReviews = localStorage.getItem("ministay_reviews");
      if (storedReviews) {
        const reviews: Review[] = JSON.parse(storedReviews);
        const roomReviews = reviews.filter((r) => String(r.roomId) === String(data.id));
        if (roomReviews.length > 0) {
          const total = roomReviews.reduce((acc, curr) => acc + curr.rating, 0);
          const avg = total / roomReviews.length;
          setDisplayRating(Number(avg.toFixed(1))); 
          setReviewCount(roomReviews.length);       
        }
      }

      // 2. LOGIKA KETERSEDIAAN (Sisa Bulan Ini)
      const storedBookings = JSON.parse(localStorage.getItem("ministay_bookings") || "[]");
      
      const roomBookings = storedBookings
        .filter((b: any) => String(b.roomId) === String(data.id) && b.status !== 'cancelled')
        .map((b: any) => ({
           start: parseDate(b.checkIn).getTime(),
           end: parseDate(b.checkOut).getTime() 
        }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(0, 0, 0, 0);

      // Hitung jumlah hari yang KOSONG (Available)
      let unbookedCount = 0;
      let currentDate = new Date(today);

      while (currentDate <= endOfMonth) {
        const targetTime = currentDate.getTime();
        
        // Cek apakah tanggal ini dibooking
        const isBooked = roomBookings.some((b: any) => targetTime >= b.start && targetTime < b.end);
        
        if (!isBooked) {
            unbookedCount++; // Tambah counter jika hari ini kosong
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // --- ATURAN BARU (0, 1-4, >4) ---
      // if (unbookedCount === 0) {
      //   setAvailabilityBadge({
      //       label: "Penuh (Bulan Ini)",
      //       color: "bg-red-600",
      //       icon: <XCircle size={12} className="text-white"/>
      //   });
      // } else if (unbookedCount <= 4) {
      //   setAvailabilityBadge({
      //       label: "Hampir Penuh",
      //       color: "bg-orange-500",
      //       icon: <AlertCircle size={12} className="text-white"/>
      //   });
      // } else {
      //   setAvailabilityBadge({
      //       label: "Tersedia",
      //       color: "bg-green-600",
      //       icon: <CheckCircle size={12} className="text-white"/>
      //   });
      // }
    }
  }, [data.id]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group">
      <div className="relative h-48 w-full overflow-hidden">
        <Image src={data.image} alt={data.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
        {/* <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1.5 ${availabilityBadge.color} transition-colors duration-300`}>
            {availabilityBadge.icon} {availabilityBadge.label}
        </div> */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-sm border border-white/20">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span>{displayRating}</span>
            {reviewCount > 0 && <span className="text-gray-400 font-normal text-[10px]">({reviewCount})</span>}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition">{data.name}</h3>
        </div>
        <div className="flex items-center text-gray-500 text-xs mb-3">
            <MapPin className="w-3 h-3 mr-1 text-gray-400" />
            {data.location || 'Jakarta Selatan'} • <span className="text-gray-400 ml-1">{data.type}</span>
        </div>
        <div className="flex gap-3 mb-4 text-gray-400 flex-wrap">
          {facilities.map((f, i) => (
            <div
              key={`${data.id}-${f}-${i}`}
              className="flex items-center gap-1 text-[10px] bg-gray-50 px-2 py-1 rounded"
            >
              {facilityMap[f]?.icon || <CheckCircle className="w-3 h-3" />}
              {facilityMap[f]?.label || f}
              
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-100 mb-3 mt-auto"></div>
        <div className="flex items-center justify-between gap-2">
            <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Per Malam</p>
                <p className="text-blue-600 font-bold text-lg leading-tight">Rp {data.price.toLocaleString('id-ID')}</p>
            </div>
            <div className="flex gap-2">
                <Link href={`/chat?context=${encodeURIComponent(data.name)}&roomId=${data.id}`} className="border border-blue-100 bg-blue-50 text-blue-600 p-2.5 rounded-xl hover:bg-blue-100 transition shadow-sm" title="Chat Admin">
                    <MessageCircle className="w-5 h-5" />
                </Link>
                <Link href={`/room/${data.id}`} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                    Pilih
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}