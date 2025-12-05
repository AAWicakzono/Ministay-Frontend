"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, ShieldCheck, CreditCard, X } from "lucide-react";
import { Room } from "@/types";
import { useNotification } from "@/context/NotificationContext"; // 1. Import Notification

interface CheckoutViewProps {
  isModal?: boolean;
}

export default function CheckoutView({ isModal = false }: CheckoutViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showPopup, showToast } = useNotification(); // 2. Panggil Hook
  
  const roomId = searchParams.get("roomId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const days = Number(searchParams.get("days") || 1);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); 

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          
          // 3. GANTI ALERT TIMEOUT
          showPopup(
            "Waktu Habis",
            "Sesi pembayaran Anda telah berakhir. Silakan ulangi pemesanan.",
            "error",
            () => {
               if (isModal) window.location.href = "/";
               else router.push("/");
            }
          );
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isModal, router, timeLeft, showPopup]); // Add dependency

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (typeof window !== "undefined" && roomId) {
      const storedRooms = localStorage.getItem("ministay_rooms");
      if (storedRooms) {
        const rooms: Room[] = JSON.parse(storedRooms);
        const found = rooms.find(r => r.id === Number(roomId));
        if (found) setRoom(found);
      }
    }
  }, [roomId]);

  const handleClose = () => {
    if (isModal) router.back();
    else router.push("/");
  };

  if (!room || !checkIn || !checkOut) return <div className="p-10 text-center bg-white rounded-xl">Memuat data...</div>;

  const totalPrice = room.price * days;
  const adminFee = 5000;
  const grandTotal = totalPrice + adminFee;

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      const newBooking = {
        id: `BK-${Date.now()}`,
        roomId: room.id,
        roomName: room.name,
        guestName: "Tamu (Anda)",
        checkIn,
        checkOut,
        totalPrice: grandTotal,
        status: "confirmed",
        paymentDate: new Date().toLocaleString()
      };

      const existingBookings = JSON.parse(localStorage.getItem("ministay_bookings") || "[]");
      localStorage.setItem("ministay_bookings", JSON.stringify([newBooking, ...existingBookings]));

      // 4. GANTI ALERT SUKSES
      showPopup(
        "Pembayaran Berhasil!",
        "E-Ticket telah diterbitkan. Tunjukkan kepada resepsionis saat check-in.",
        "success",
        () => {
            if (isModal) window.location.href = "/my-bookings";
            else router.push("/my-bookings");
        }
      );
      
    }, 2000);
  };

  return (
    <div className={`w-full max-w-md mx-auto bg-gray-50 flex flex-col ${isModal ? 'h-[85vh] rounded-2xl shadow-2xl overflow-hidden' : 'min-h-screen pb-20'}`}>
      
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-3 shadow-sm shrink-0 z-10">
        <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            {isModal ? <X className="w-5 h-5"/> : <ArrowLeft className="w-5 h-5"/>}
        </button>
        <h1 className="font-bold text-lg">Ringkasan Pemesanan</h1>
      </div>

      {/* Konten Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Timer */}
        <div className={`p-3 rounded-xl text-sm flex items-center justify-between border transition-colors ${
            timeLeft < 60 ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' : 'bg-orange-50 text-orange-700 border-orange-100'
        }`}>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4"/> Selesaikan dalam</span>
            <span className="font-bold font-mono text-lg">{formatTime(timeLeft)}</span>
        </div>

        {/* Detail Kamar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900">{room.name}</h2>
            <p className="text-xs text-gray-500 mb-3">{room.location || 'Jakarta Selatan'}</p>
            <div className="flex gap-4 text-sm border-t border-gray-100 pt-3">
                <div><p className="text-gray-400 text-xs">Check-in</p><p className="font-semibold">{checkIn}</p></div>
                <div><p className="text-gray-400 text-xs">Check-out</p><p className="font-semibold">{checkOut}</p></div>
                <div className="ml-auto text-right"><p className="text-gray-400 text-xs">Durasi</p><p className="font-semibold">{days} Malam</p></div>
            </div>
        </div>

        {/* Rincian Harga */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3">Rincian Pembayaran</h3>
            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between"><span>Harga Kamar (x{days})</span><span>Rp {totalPrice.toLocaleString("id-ID")}</span></div>
                <div className="flex justify-between"><span>Biaya Layanan</span><span>Rp {adminFee.toLocaleString("id-ID")}</span></div>
                <div className="border-t border-dashed border-gray-200 my-2 pt-2 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total Bayar</span>
                    <span className="text-blue-600">Rp {grandTotal.toLocaleString("id-ID")}</span>
                </div>
            </div>
        </div>

        {/* Metode Bayar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-3">Metode Pembayaran</h3>
            <div className="flex items-center gap-3 p-3 border border-blue-500 bg-blue-50 rounded-lg cursor-pointer">
                <CreditCard className="w-5 h-5 text-blue-600"/>
                <div className="flex-1">
                    <p className="text-sm font-bold text-blue-900">QRIS (Instant)</p>
                    <p className="text-xs text-blue-600">Scan & Verifikasi Otomatis</p>
                </div>
                <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white ring-1 ring-blue-600"></div>
            </div>
        </div>
      </div>

      {/* Footer Tombol Bayar */}
      <div className="bg-white p-4 border-t border-gray-100 shrink-0">
        <button 
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:bg-gray-400"
        >
            {loading ? "Memproses..." : `Bayar Rp ${grandTotal.toLocaleString("id-ID")}`}
            {!loading && <ShieldCheck className="w-4 h-4"/>}
        </button>
      </div>
    </div>
  );
}