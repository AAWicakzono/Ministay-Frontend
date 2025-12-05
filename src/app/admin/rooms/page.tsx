"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Image as ImageIcon, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Room } from "@/types";
import { rooms as initialRoomsData } from "@/lib/data"; 
import { useNotification } from "@/context/NotificationContext"; 

// Helper
const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ministay_rooms");
      if (saved) return JSON.parse(saved);
    }
    return initialRoomsData;
  });

  const { showToast, showPopup } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Room>>({});
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
        setBookings(JSON.parse(localStorage.getItem("ministay_bookings") || "[]"));
    }
  }, []);

  useEffect(() => {
    if (rooms.length > 0) {
      localStorage.setItem("ministay_rooms", JSON.stringify(rooms));
      window.dispatchEvent(new Event("storage"));
    }
  }, [rooms]);

  // AUTOMATION STATUS (Tetap berjalan di background)
  useEffect(() => {
    const syncRoomStatus = () => {
      if (typeof window === "undefined") return;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let hasChanges = false;

      const updatedRooms = rooms.map((room) => {
        let newStatus: 'available' | 'occupied' = 'available';

        for (const b of bookings) {
          if (String(b.roomId) !== String(room.id) || b.status === 'cancelled') continue;
          
          const checkIn = parseDate(b.checkIn);
          const checkOut = parseDate(b.checkOut);
          
          if (today.getTime() >= checkIn.getTime() && today.getTime() < checkOut.getTime()) {
            newStatus = 'occupied';
            break; 
          }
        }

        if (room.status !== newStatus) {
          hasChanges = true;
          return { ...room, status: newStatus };
        }
        return room;
      });

      if (hasChanges) setRooms(updatedRooms);
    };

    if (bookings.length > 0) syncRoomStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings]); 

  const getForecastStatus = (roomId: number) => {
    let bookedCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        const targetTime = targetDate.getTime();

        const isBooked = bookings.some((b: any) => {
            if (String(b.roomId) !== String(roomId) || b.status === 'cancelled') return false;
            const start = parseDate(b.checkIn).getTime();
            const end = parseDate(b.checkOut).getTime();
            return targetTime >= start && targetTime < end;
        });
        if (isBooked) bookedCount++;
    }

    const unbooked = 30 - bookedCount;
    if (unbooked === 0) return { label: "Penuh", color: "text-red-600 bg-red-50", icon: <XCircle className="w-3 h-3"/> };
    return { label: "Aman", color: "text-green-600 bg-green-50", icon: <CheckCircle className="w-3 h-3"/> };
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setFormData({ status: 'available', facilities: [], description: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (room: Room) => {
    setIsEditing(true);
    setFormData(room);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    showPopup("Hapus Kamar?", "Data kamar akan dihapus permanen.", "warning", () => {
        setRooms(prev => prev.filter(r => r.id !== id));
        showToast("Kamar berhasil dihapus", "success");
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && formData.id) {
      setRooms(prev => prev.map(r => (r.id === formData.id ? { ...r, ...formData } as Room : r)));
      showToast("Perubahan disimpan", "success");
    } else {
      const newRoom: Room = {
        ...formData,
        id: Date.now(),
        image: formData.image || "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800",
        facilities: formData.facilities || ["AC", "WiFi"],
        description: formData.description || "Kamar nyaman untuk Anda.",
        rating: 0,
        name: formData.name || "Kamar Baru",
        type: formData.type || "Standard",
        price: Number(formData.price) || 0,
        status: 'available', // Default selalu Available saat buat baru
        location: 'Jakarta'
      } as Room;
      setRooms(prev => [...prev, newRoom]);
      showToast("Kamar baru berhasil ditambahkan", "success");
    }
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
  };

  // Handler khusus untuk Fasilitas (Array)
  const handleFacilitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Split string by comma untuk jadi array
    const facilitiesArray = value.split(",").map((item) => item.trim());
    setFormData(prev => ({ ...prev, facilities: facilitiesArray }));
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Kamar</h1>
            <p className="text-gray-500 text-sm">Total: {rooms.length} Kamar</p>
        </div>
        <button onClick={handleAddClick} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            <Plus className="w-4 h-4" /> Tambah Kamar
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-2xl border-b border-gray-100 flex items-center gap-2">
        <Search className="text-gray-400 w-5 h-5" />
        <input type="text" placeholder="Cari nama kamar atau tipe..." className="outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
      </div>

      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                    <th className="p-4">Nama Kamar</th>
                    <th className="p-4">Tipe</th>
                    <th className="p-4">Harga / Malam</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Prediksi (30 Hari)</th>
                    <th className="p-4 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => {
                        const forecast = getForecastStatus(room.id);
                        return (
                        <tr key={room.id} className="hover:bg-gray-50 transition">
                            <td className="p-4 font-bold text-gray-900">{room.name}</td>
                            <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{room.type}</span></td>
                            <td className="p-4">Rp {room.price.toLocaleString("id-ID")}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                    room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {room.status === 'available' ? 'Tersedia' : 'Terisi'}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit ${forecast.color}`}>
                                    {forecast.icon} {forecast.label}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleEditClick(room)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition" title="Edit"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteClick(room.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition" title="Hapus"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </td>
                        </tr>
                    )})
                ) : (
                    <tr><td colSpan={6} className="p-8 text-center text-gray-400">Data tidak ditemukan</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Modal Form Updated */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">{isEditing ? "Edit Kamar" : "Tambah Kamar Baru"}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {/* Nama Kamar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamar</label>
                        <input name="name" required value={formData.name || ""} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Kamar Melati 01"/>
                    </div>
                    
                    {/* Tipe & Harga */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                            <input name="type" required value={formData.type || ""} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Standard / Deluxe"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                            <input name="price" required value={formData.price || ""} onChange={handleChange} type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="150000"/>
                        </div>
                    </div>

                    {/* NEW: Fasilitas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fasilitas (Pisahkan dengan koma)</label>
                        <input 
                            name="facilities" 
                            // Join array jadi string untuk ditampilkan di input text
                            value={formData.facilities ? formData.facilities.join(", ") : ""} 
                            onChange={handleFacilitiesChange} 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="AC, WiFi, TV, Kamar Mandi Dalam"
                        />
                    </div>

                    {/* NEW: Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Kamar</label>
                        <textarea 
                            name="description" 
                            rows={3}
                            value={formData.description || ""} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                            placeholder="Jelaskan keunggulan kamar ini..."
                        />
                    </div>

                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Foto (Opsional)</label>
                        <div className="flex items-center gap-2">
                            <ImageIcon className="text-gray-400 w-5 h-5"/>
                            <input name="image" value={formData.image || ""} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="https://..."/>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">*Gunakan link gambar valid (Unsplash/dll)</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">Batal</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2"><Save className="w-4 h-4"/> Simpan</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}