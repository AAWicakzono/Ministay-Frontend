"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Star, UserCircle, MessageSquare, ArrowRight } from "lucide-react";
import { Review, Room } from "@/types";
import { rooms as initialRooms } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  // Load Data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedReviews = localStorage.getItem("ministay_reviews");
      if (storedReviews) {
        setReviews(JSON.parse(storedReviews));
      }
      
      const storedRooms = localStorage.getItem("ministay_rooms");
      if (storedRooms) {
        setRooms(JSON.parse(storedRooms));
      }
    }
  }, []);

  // Helper untuk cari data kamar berdasarkan ID
  const getRoomDetails = (roomId: number) => {
    return rooms.find(r => r.id === roomId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6 pt-8">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4">
            <h1 className="font-bold text-3xl text-gray-900 mb-2">Ulasan Terbaru</h1>
            <p className="text-gray-500">Apa kata mereka tentang pengalaman menginap di MiniStay?</p>
        </div>

        {reviews.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <MessageSquare className="w-8 h-8"/>
                </div>
                <h3 className="font-bold text-gray-900">Belum ada ulasan</h3>
                <p className="text-sm text-gray-500 mt-2">Jadilah yang pertama memberikan ulasan setelah menginap!</p>
                <Link href="/" className="inline-block mt-6 text-blue-600 font-bold hover:bg-blue-50 px-6 py-2 rounded-full transition">
                    Cari Kamar Sekarang
                </Link>
            </div>
        ) : (
            // --- MASONRY LAYOUT (BATU BATA) ---
            // columns-1 (HP), columns-2 (Tablet), columns-3 (Desktop)
            // gap-6: Jarak antar kolom
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {reviews.map((rev) => {
                    const room = getRoomDetails(rev.roomId);
                    return (
                        // break-inside-avoid: Mencegah kartu terpotong di tengah kolom
                        // mb-6: Jarak vertikal antar kartu
                        <div key={rev.id} className="break-inside-avoid mb-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition group animate-in fade-in duration-500 hover:-translate-y-1">
                            
                            {/* Header: User Info & Rating */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-inner shrink-0">
                                        <UserCircle className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{rev.guestName}</p>
                                        <p className="text-xs text-gray-400">{rev.date}</p>
                                    </div>
                                </div>
                                <div className="flex bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 shrink-0">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Comment - Height akan bervariasi sesuai panjang teks (efek batu bata) */}
                            <div className="flex-1">
                                <p className="text-gray-600 text-sm leading-relaxed italic relative pl-3 border-l-2 border-gray-200">
                                    "{rev.comment}"
                                </p>
                            </div>

                            {/* Footer: Room Snippet */}
                            {room && (
                                <Link href={`/room/${room.id}`} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl hover:bg-blue-50 transition border border-transparent hover:border-blue-100 group/room">
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm">
                                        <Image src={room.image} alt={room.name} fill className="object-cover"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-gray-400 mb-0.5 uppercase font-bold tracking-wider">Menginap di</p>
                                        <p className="text-sm font-bold text-gray-900 truncate group-hover/room:text-blue-600 transition">{room.name}</p>
                                    </div>
                                    <div className="bg-white p-1.5 rounded-full text-gray-300 group-hover/room:text-blue-600 group-hover/room:bg-blue-100 transition shadow-sm">
                                        <ArrowRight className="w-4 h-4"/>
                                    </div>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
}