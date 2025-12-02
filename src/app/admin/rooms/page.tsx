"use client";

import { useState } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";

// Dummy Data Kamar
const initialRooms = [
  { id: 1, name: "Kamar Deluxe A1", type: "Deluxe", price: 150000, status: "available" },
  { id: 2, name: "Kamar Standard B2", type: "Standard", price: 100000, status: "occupied" },
  { id: 3, name: "Kamar Premium C3", type: "Premium", price: 200000, status: "cleaning" },
  { id: 4, name: "Kamar Standard A2", type: "Standard", price: 100000, status: "available" },
];

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState(initialRooms);

  // Fungsi ubah status (Simulasi)
  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
    setRooms(rooms.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div>
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Kamar</h1>
            <p className="text-gray-500 text-sm">Atur ketersediaan dan harga kamar Anda</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" /> Tambah Kamar
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-t-2xl border-b border-gray-100 flex items-center gap-2">
        <Search className="text-gray-400 w-5 h-5" />
        <input type="text" placeholder="Cari nomor kamar..." className="outline-none text-sm w-full" />
      </div>

      {/* Tabel Kamar */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                    <th className="p-4">Nama Kamar</th>
                    <th className="p-4">Tipe</th>
                    <th className="p-4">Harga / Malam</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-bold">{room.name}</td>
                        <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{room.type}</span></td>
                        <td className="p-4">Rp {room.price.toLocaleString("id-ID")}</td>
                        <td className="p-4">
                            {/* Badge Status */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                room.status === 'available' ? 'bg-green-100 text-green-700' :
                                room.status === 'occupied' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {room.status === 'available' ? 'Tersedia' : 
                                 room.status === 'occupied' ? 'Terisi' : 'Dibersihkan'}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"><Edit className="w-4 h-4"/></button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}