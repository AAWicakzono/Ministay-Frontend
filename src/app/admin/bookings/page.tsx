"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Search, Trash2 } from "lucide-react";

interface Booking {
  id: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paymentDate: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // 1. Load Data Booking dari LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ministay_bookings");
      if (stored) {
        setBookings(JSON.parse(stored));
      }
    }
  }, []);

  // Fungsi Hapus Booking (Untuk bersih-bersih data test)
  const handleDelete = (id: string) => {
    if (confirm("Hapus riwayat booking ini?")) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      localStorage.setItem("ministay_bookings", JSON.stringify(updated));
      
      // Trigger update status kamar juga (opsional, biar rapi)
      window.dispatchEvent(new Event("storage")); 
    }
  };

  // Filter Logic
  const filteredBookings = bookings.filter((item) => {
    const matchesStatus = filter === "all" ? true : item.status === filter;
    const matchesSearch = item.guestName.toLowerCase().includes(search.toLowerCase()) || 
                          item.id.toLowerCase().includes(search.toLowerCase()) ||
                          item.roomName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Masuk</h1>
            <p className="text-gray-500 text-sm">Daftar tamu yang sudah melakukan pembayaran</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Cari ID / Nama Tamu..." 
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
            <button 
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    filter === status 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
                {status === 'all' ? 'Semua' : status}
            </button>
        ))}
      </div>

      {/* List Booking */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Tamu & Kamar</th>
                    <th className="p-4">Jadwal Menginap</th>
                    <th className="p-4">Total Bayar</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500 text-xs font-mono">{item.id}</td>
                        <td className="p-4">
                            <p className="font-bold text-gray-900">{item.guestName}</p>
                            <p className="text-gray-500 text-xs">{item.roomName}</p>
                        </td>
                        <td className="p-4">
                            <div className="flex flex-col text-xs text-gray-600">
                                <span>IN: {item.checkIn}</span>
                                <span>OUT: {item.checkOut}</span>
                            </div>
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                            Rp {item.totalPrice.toLocaleString("id-ID")}
                        </td>
                        <td className="p-4">
                            <span className={`flex items-center gap-1 w-fit px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                item.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {item.status === 'confirmed' ? <CheckCircle size={10}/> : 
                                 item.status === 'pending' ? <Clock size={10}/> : <XCircle size={10}/>}
                                {item.status}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition" 
                                title="Hapus Riwayat"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                            Belum ada data booking.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}