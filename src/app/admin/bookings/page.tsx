"use client";

import { CheckCircle, XCircle, Clock } from "lucide-react";

// Dummy Data Booking
const bookings = [
  { id: "BK001", guest: "Budi Santoso", room: "Kamar Deluxe A1", date: "28 Nov - 30 Nov", total: 300000, status: "confirmed" },
  { id: "BK002", guest: "Siti Rahma", room: "Kamar Premium C3", date: "01 Des - 03 Des", total: 400000, status: "pending" },
  { id: "BK003", guest: "Ahmad Rizki", room: "Kamar Standard B2", date: "05 Des - 06 Des", total: 100000, status: "cancelled" },
];

export default function BookingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Booking Masuk</h1>
        <p className="text-gray-500 text-sm">Kelola pesanan tamu yang masuk hari ini</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-200">Semua</button>
        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Menunggu (1)</button>
        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Dikonfirmasi (1)</button>
        <button className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Selesai (0)</button>
      </div>

      {/* List Booking */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Tamu & Kamar</th>
                    <th className="p-4">Check-in/out</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {bookings.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4 text-gray-500 text-xs">{item.id}</td>
                        <td className="p-4">
                            <p className="font-bold text-gray-900">{item.guest}</p>
                            <p className="text-gray-500 text-xs">{item.room}</p>
                        </td>
                        <td className="p-4 text-gray-600">{item.date}</td>
                        <td className="p-4 font-semibold">Rp {item.total.toLocaleString("id-ID")}</td>
                        <td className="p-4">
                            <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded text-xs font-bold ${
                                item.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {item.status === 'confirmed' ? <CheckCircle size={12}/> : 
                                 item.status === 'pending' ? <Clock size={12}/> : <XCircle size={12}/>}
                                {item.status}
                            </span>
                        </td>
                        <td className="p-4">
                            {item.status === 'pending' && (
                                <div className="flex justify-center gap-2">
                                    <button className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition">Terima</button>
                                    <button className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition">Tolak</button>
                                </div>
                            )}
                            {item.status !== 'pending' && <p className="text-center text-gray-400 text-xs">-</p>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}