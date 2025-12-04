"use client";

import { useState,useEffect } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Image as ImageIcon } from "lucide-react";
import { Room } from "@/types";
import { useNotification } from "@/context/NotificationContext";

// --- MOCK DATA AWAL ---
const initialRooms: Room[] = [
  { id: 1,
     name: "Kamar Deluxe A1",
      type: "Deluxe", 
      price: 150000, 
      status: "available", 
      image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800", 
      facilities: ["AC", "TV"] },
  { id: 2,
     name: "Kamar Standard B2",
      type: "Standard", 
      price: 100000, 
      status: "occupied", 
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800", 
      facilities: ["WiFi"] },
  { id: 3,
     name: "Kamar Premium C3",
     type: "Premium", 
     price: 200000, 
     status: "cleaning", 
     image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800", 
     facilities: ["AC", "Netflix"] },
];

export default function ManageRoomsPage() {
  const { showPopup, showToast } = useNotification();
  
  const [rooms, setRooms] = useState<Room[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ministay_rooms");
      if (saved) return JSON.parse(saved);
    }
    return initialRooms;
  });

// === AUTOMATION: STATUS LOGIC (OCCUPIED -> CLEANING -> AVAILABLE) ===
  useEffect(() => {
    const syncRoomStatus = () => {
      // Pastikan kode hanya jalan di browser
      if (typeof window === "undefined") return;

      const storedBookings = JSON.parse(localStorage.getItem("ministay_bookings") || "[]");
      const storedRooms = JSON.parse(localStorage.getItem("ministay_rooms") || "[]");
      
      // Gunakan data local jika ada, jika tidak pakai data awal
      let currentRooms = storedRooms.length > 0 ? storedRooms : initialRooms;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset jam agar akurat per hari

      const updatedRooms = currentRooms.map((room: Room) => {
        let newStatus = 'available'; // Default status jika kosong

        // Cek setiap booking untuk kamar ini
        for (const b of storedBookings) {
          if (b.roomId !== room.id) continue;

          const checkIn = new Date(b.checkIn);
          const checkOut = new Date(b.checkOut);
          
          // Hitung batas akhir Cleaning (H+1 setelah CheckOut)
          // Contoh: Checkout tgl 12 -> Cleaning tgl 12 & 13 -> Available tgl 14
          const cleaningEnd = new Date(checkOut);
          cleaningEnd.setDate(checkOut.getDate() + 1); 

          // Normalisasi jam
          checkIn.setHours(0, 0, 0, 0);
          checkOut.setHours(0, 0, 0, 0);
          cleaningEnd.setHours(0, 0, 0, 0);

          // --- LOGIKA UTAMA ---
          
          // 1. Fase OCCUPIED (Sedang Menginap)
          // Dari tanggal CheckIn sampai SEBELUM hari CheckOut
          if (today >= checkIn && today < checkOut) {
            newStatus = 'occupied';
            break; // Prioritas tertinggi, langsung stop cek booking lain
          }

          // 2. Fase CLEANING (Cooldown)
          // Hari H CheckOut DAN Hari H+1 (Besoknya)
          if (today >= checkOut && today <= cleaningEnd) {
            newStatus = 'cleaning';
            // Tidak di-break, karena status 'occupied' (jika ada tumpang tindih) harus menang
          }
        }

        // Hanya update jika status berubah dari yang sekarang
        if (room.status !== newStatus) {
          return { ...room, status: newStatus };
        }
        return room;
      });

      // Simpan perubahan ke state & localStorage jika ada update
      if (JSON.stringify(updatedRooms) !== JSON.stringify(rooms)) {
        setRooms(updatedRooms);
        localStorage.setItem("ministay_rooms", JSON.stringify(updatedRooms));
      }
    };

    syncRoomStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Room>>({});

  // --- HANDLERS ---

  // 1. Buka Modal Tambah
  const handleAddClick = () => {
    setIsEditing(false);
    setFormData({ status: 'available', facilities: [] }); // Default value
    setIsModalOpen(true);
  };

  // 2. Buka Modal Edit
  const handleEditClick = (room: Room) => {
    setIsEditing(true);
    setFormData(room);
    setIsModalOpen(true);
  };

  // 3. Fungsi Hapus
  const handleDeleteClick = (id: number) => {
    // GANTI confirm() dengan showPopup tipe WARNING
    showPopup(
        "Hapus Kamar?",
        "Data kamar akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.",
        "warning",
        () => {
            // Callback jika user klik "Ya, Lanjutkan"
            setRooms(rooms.filter(r => r.id !== id));
            showToast("Data kamar berhasil dihapus", "success");
        }
    );
  };
  

  // 4. Fungsi Simpan (Create / Update)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && formData.id) {
      // LOGIC UPDATE
      // TODO API: await updateRoom(formData)
      setRooms(rooms.map(r => (r.id === formData.id ? { ...r, ...formData } as Room : r)));
    } else {
      // LOGIC CREATE
      const newRoom: Room = {
        ...formData,
        id: Date.now(), // Generate ID sementara
        image: formData.image || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800", // Placeholder image
        facilities: formData.facilities || [],
        rating: 0
      } as Room;
      // TODO API: await createRoom(newRoom)
      setRooms([...rooms, newRoom]);
    }
    setIsModalOpen(false);
  };

  // 5. Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  // Filter Search
  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Kamar</h1>
            <p className="text-gray-500 text-sm">Tambah, edit, atau hapus data kamar</p>
        </div>
        <button 
            onClick={handleAddClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
            <Plus className="w-4 h-4" /> Tambah Kamar
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="bg-white p-4 rounded-t-2xl border-b border-gray-100 flex items-center gap-2">
        <Search className="text-gray-400 w-5 h-5" />
        <input 
            type="text" 
            placeholder="Cari nama kamar atau tipe..." 
            className="outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TABEL DATA --- */}
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
                {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-bold text-gray-900">{room.name}</td>
                        <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{room.type}</span></td>
                        <td className="p-4">Rp {room.price.toLocaleString("id-ID")}</td>
                        <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                room.status === 'available' ? 'bg-green-100 text-green-700' :
                                room.status === 'occupied' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                                {room.status === 'available' ? 'Tersedia' : 
                                 room.status === 'occupied' ? 'Terisi' : 'Cleaning'}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleEditClick(room)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition" title="Edit">
                                    <Edit className="w-4 h-4"/>
                                </button>
                                <button onClick={() => handleDeleteClick(room.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition" title="Hapus">
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">Data tidak ditemukan</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* --- MODAL FORM (POPUP) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{isEditing ? "Edit Kamar" : "Tambah Kamar Baru"}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="w-6 h-6"/></button>
                </div>
                
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {/* Nama Kamar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamar</label>
                        <input 
                            name="name"
                            required
                            value={formData.name || ""}
                            onChange={handleChange}
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Contoh: Kamar Melati 01"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tipe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                            <input 
                                name="type"
                                required
                                value={formData.type || ""}
                                onChange={handleChange}
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Standard / Deluxe"
                            />
                        </div>
                        {/* Harga */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                            <input 
                                name="price"
                                required
                                value={formData.price || ""}
                                onChange={handleChange}
                                type="number" 
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="150000"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Saat Ini</label>
                        <div className="flex gap-4">
                            {['available', 'occupied', 'cleaning'].map((status) => (
                                <label key={status} className="flex items-center gap-2 cursor-pointer border px-3 py-2 rounded-lg has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition">
                                    <input 
                                        type="radio" 
                                        name="status" 
                                        value={status} 
                                        checked={formData.status === status}
                                        onChange={handleChange}
                                        className="accent-blue-600"
                                    />
                                    <span className="capitalize text-sm">{status === 'available' ? 'Tersedia' : status === 'occupied' ? 'Terisi' : 'Cleaning'}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Foto (Dummy URL input for now) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link Foto (Opsional)</label>
                        <div className="flex items-center gap-2">
                            <ImageIcon className="text-gray-400 w-5 h-5"/>
                            <input 
                                name="image"
                                value={formData.image || ""}
                                onChange={handleChange}
                                type="text" 
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="https://..."
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">*Nanti akan diganti fitur upload file</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4"/> Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}