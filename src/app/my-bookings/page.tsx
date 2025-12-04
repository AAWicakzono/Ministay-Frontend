"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, Download, Star, X } from "lucide-react"; // Tambah icon Star & X
import Navbar from "@/components/Navbar";
import { Review } from "@/types"; // Import tipe Review

interface Booking {
  id: string;
  roomId: number; // Pastikan roomId tersimpan saat checkout
  roomName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  isReviewed?: boolean; // Flag penanda sudah direview
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showTicket, setShowTicket] = useState<Booking | null>(null);
  
  // State Modal Review
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ministay_bookings");
      if (stored) {
        setBookings(JSON.parse(stored));
      }
    }
  }, []);

  // Fungsi Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    const newReview: Review = {
      id: `REV-${Date.now()}`,
      roomId: reviewBooking.roomId,
      guestName: reviewBooking.guestName,
      rating,
      comment,
      date: new Date().toLocaleDateString("id-ID")
    };

    // 1. Simpan Review ke Storage
    const existingReviews = JSON.parse(localStorage.getItem("ministay_reviews") || "[]");
    localStorage.setItem("ministay_reviews", JSON.stringify([newReview, ...existingReviews]));

    // 2. Tandai Booking sebagai "Sudah Direview"
    const updatedBookings = bookings.map(b => 
      b.id === reviewBooking.id ? { ...b, isReviewed: true } : b
    );
    setBookings(updatedBookings);
    localStorage.setItem("ministay_bookings", JSON.stringify(updatedBookings));

    alert("Terima kasih atas ulasan Anda!");
    setReviewBooking(null);
    setComment("");
    setRating(5);
  };

  // Cek apakah booking sudah bisa direview (Status confirmed & belum direview)
  // Untuk simulasi: Kita anggap semua booking 'confirmed' bisa direview
  // Di real app: Cek tanggal checkout < hari ini
  const canReview = (item: Booking) => {
    return item.status === 'confirmed' && !item.isReviewed;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-md mx-auto p-4 space-y-4 pt-6">
        <div className="flex items-center justify-between mb-2">
            <h1 className="font-bold text-2xl text-gray-900">Pesanan Saya</h1>
            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                {bookings.length} Riwayat
            </span>
        </div>
        
        {bookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📭</div>
                <p className="text-gray-500 mb-4 font-medium">Belum ada riwayat pesanan.</p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                    Cari Kamar Yuk!
                </Link>
            </div>
        ) : (
            bookings.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                                item.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {item.status}
                            </span>
                            <h3 className="font-bold text-lg text-gray-900 mt-2 leading-tight">{item.roomName}</h3>
                            <p className="text-xs text-gray-400 mt-1 font-mono">ID: {item.id}</p>
                        </div>
                        <button 
                            onClick={() => setShowTicket(item)}
                            className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-black transition shadow-lg flex flex-col items-center gap-1 min-w-[60px]"
                        >
                            <QrCode className="w-6 h-6"/>
                            <span className="text-[9px] font-bold">E-Ticket</span>
                        </button>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 flex gap-4 text-sm border border-gray-100">
                        <div className="flex-1">
                            <p className="text-gray-400 text-[10px] uppercase font-bold mb-1">Check-in</p>
                            <p className="font-semibold text-gray-800">{item.checkIn}</p>
                        </div>
                        <div className="border-l border-gray-200"></div>
                        <div className="flex-1 pl-2">
                            <p className="text-gray-400 text-[10px] uppercase font-bold mb-1">Check-out</p>
                            <p className="font-semibold text-gray-800">{item.checkOut}</p>
                        </div>
                    </div>

                    {/* Tombol Review */}
                    {canReview(item) ? (
                        <button 
                            onClick={() => setReviewBooking(item)}
                            className="w-full border border-blue-200 text-blue-600 bg-blue-50 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                        >
                            <Star className="w-4 h-4" /> Beri Ulasan
                        </button>
                    ) : item.isReviewed ? (
                        <div className="text-center text-xs text-green-600 font-medium bg-green-50 py-2 rounded-lg">
                            ★ Ulasan Terkirim
                        </div>
                    ) : null}
                </div>
            ))
        )}
      </div>

      {/* --- MODAL REVIEW --- */}
      {reviewBooking && (
        <div className="fixed inset-0 bg-black/60 z-70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Tulis Ulasan</h3>
                    <button onClick={() => setReviewBooking(null)}><X className="w-5 h-5 text-gray-400"/></button>
                </div>
                <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">Bagaimana pengalaman menginap di</p>
                        <p className="font-bold text-lg text-gray-900">{reviewBooking.roomName}?</p>
                    </div>

                    {/* Bintang */}
                    <div className="flex justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            >
                                <Star className="w-8 h-8" />
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs font-bold text-blue-600">
                        {rating === 5 ? "Luar Biasa! 😍" : rating === 4 ? "Sangat Bagus 😄" : rating === 3 ? "Cukup 🙂" : "Kurang ☹️"}
                    </p>

                    <textarea 
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
                        placeholder="Ceritakan pengalamanmu..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    ></textarea>

                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
                        Kirim Ulasan
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL E-TICKET (Kode Lama) --- */}
      {showTicket && (
        // ... (Biarkan kode modal tiket yang lama tetap ada di sini)
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative">
                <button onClick={() => setShowTicket(null)} className="absolute top-4 right-4 bg-white/20 text-white hover:bg-white/40 p-2 rounded-full z-10 transition backdrop-blur-md">
                    <X className="w-5 h-5"/> {/* Ganti icon X biar konsisten */}
                </button>
                {/* ... Isi Ticket Header, Body, Footer sama persis seperti sebelumnya ... */}
                <div className="bg-blue-600 p-8 text-center text-white pb-12 relative overflow-hidden">
                    <h2 className="text-2xl font-bold relative z-10">E-Ticket</h2>
                    <p className="text-blue-100 text-sm relative z-10 opacity-90">Tunjukkan QR ini ke resepsionis</p>
                </div>
                <div className="px-6 -mt-8 relative z-20">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center">
                        <div className="w-40 h-40 bg-gray-900 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-inner ring-4 ring-white">
                            <QrCode className="w-24 h-24 text-white"/>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{showTicket.roomName}</h3>
                        <p className="text-sm text-gray-500 mb-4">{showTicket.guestName}</p>
                        <div className="bg-blue-50 rounded-xl p-4 text-left space-y-3 text-sm border border-blue-100">
                            <div className="flex justify-between"><span className="text-gray-500">Check-in</span><span className="font-bold text-gray-900">{showTicket.checkIn}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Check-out</span><span className="font-bold text-gray-900">{showTicket.checkOut}</span></div>
                        </div>
                    </div>
                </div>
                <div className="p-6"><button className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-lg"><Download className="w-4 h-4"/> Simpan Tiket</button></div>
            </div>
        </div>
      )}
    </div>
  );
}