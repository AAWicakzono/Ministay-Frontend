"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Image as ImageIcon, MapPin, UploadCloud, Loader2 } from "lucide-react";
import { Room } from "@/types";
import { useNotification } from "@/context/NotificationContext"; 
import Image from "next/image";
import apiClient, { IMAGE_BASE_URL } from "@/lib/axios"; 

export default function ManageRoomsPage() {
  const { showToast, showPopup } = useNotification();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Room>>({});
  const [facilitiesInput, setFacilitiesInput] = useState(""); 
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  // --- FETCH DATA ---
  const fetchRooms = useCallback(async () => {
    try {
        const response = await apiClient.get('/api/rooms', {
            params: { _t: new Date().getTime() } 
        });

        const rawData = Array.isArray(response.data) ? response.data : response.data.data || [];
        
        const mappedRooms: Room[] = rawData.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type || "Standard",
            price: Number(item.price_per_day),
            status: item.is_available === false ? 'occupied' : 'available',
            // Gunakan IMAGE_BASE_URL yang diimport
            image: item.cover_image ? `${IMAGE_BASE_URL}${item.cover_image}` : "",
            facilities: Array.isArray(item.facilities) ? item.facilities : [],
            description: item.description || "",
            location: item.location || ""
        }));

        setRooms(mappedRooms);
    } catch (error) {
        console.error("Gagal load rooms:", error);
        showToast("Gagal mengambil data kamar", "error");
    } finally {
        setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "price" ? Number(value) : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            return showToast("Ukuran gambar maksimal 2MB", "error");
        }
        setSelectedImage(file);
        setPreviewImage(URL.createObjectURL(file)); 
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setFormData({ 
        name: "", type: "Single", price: 0, location: "", description: "" 
    });
    setFacilitiesInput(""); 
    setSelectedImage(null);
    setPreviewImage("");
    setIsModalOpen(true);
  };

  const handleEditClick = (room: Room) => {
    setIsEditing(true);
    setFormData(room);
    if (room.facilities && room.facilities.length > 0) {
        setFacilitiesInput(room.facilities.join(", "));
    } else {
        setFacilitiesInput("");
    }
    setSelectedImage(null);
    setPreviewImage(room.image || ""); 
    setIsModalOpen(true);
  };

  // --- SIMPAN DATA (CREATE / UPDATE) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
        const payload = new FormData();
        payload.append('name', formData.name || "");
        payload.append('type', formData.type || "Standard");
        payload.append('price_per_day', String(formData.price)); 
        payload.append('location', formData.location || "");
        payload.append('description', formData.description || "");
        
        if (facilitiesInput.trim()) {
            const facilitiesArray = facilitiesInput.split(",").map(f => f.trim()).filter(f => f !== "");
            facilitiesArray.forEach((fac, index) => {
                payload.append(`facilities[${index}]`, fac);
            });
        }

        if (selectedImage) {
            payload.append('image', selectedImage);
        }

        if (isEditing && formData.id) {
            payload.append('_method', 'PUT'); 
            await apiClient.post(`/api/admin/rooms/${formData.id}`, payload);
            showToast("Data kamar berhasil diperbarui", "success");
        } else {
            await apiClient.post('/api/admin/rooms', payload);
            showToast("Kamar baru berhasil ditambahkan", "success");
        }

        setIsModalOpen(false);
        setIsLoading(true);

        setTimeout(() => {
            fetchRooms(); 
        }, 500);

    } catch (error: any) {
        console.error("Save Error:", error);
        const msg = error.response?.data?.message || "Gagal menyimpan data";
        showToast(msg, "error");
        setIsLoading(false);
    } finally {
        setIsSaving(false);
    }
  };

  // --- DELETE ---
  const handleDeleteClick = (id: number) => {
    showPopup("Hapus Kamar?", "Data kamar akan dihapus permanen.", "warning", async () => {
        setIsLoading(true);
        try {
            await apiClient.delete(`/api/admin/rooms/${id}`);

            showToast("Kamar berhasil dihapus", "success");
            
            setTimeout(() => {
                fetchRooms();
            }, 300);
            
        } catch (error) {
            showToast("Gagal menghapus kamar", "error");
            setIsLoading(false);
        }
    });
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (r.location && r.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* HEADER & SEARCH */}
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
        <input type="text" placeholder="Cari nama kamar atau lokasi..." className="outline-none text-sm w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
      </div>

      {/* TABEL DATA */}
      <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                    <th className="p-4">Kamar</th>
                    <th className="p-4">Tipe & Lokasi</th>
                    <th className="p-4">Harga / Malam</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {isLoading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>Memuat data...</td></tr>
                ) : filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                        <tr key={room.id} className="hover:bg-gray-50 transition">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                                        {room.image ? (
                                            <Image src={room.image} alt={room.name} fill className="object-cover"/>
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                                        )}
                                    </div>
                                    <span className="font-bold text-gray-900">{room.name}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium w-fit mb-1">{room.type}</span>
                                    <span className="text-gray-400 text-xs flex items-center gap-1"><MapPin className="w-3 h-3"/> {room.location || "-"}</span>
                                </div>
                            </td>
                            <td className="p-4">Rp {room.price.toLocaleString("id-ID")}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                                    room.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {room.status === 'available' ? 'Tersedia' : 'Penuh'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleEditClick(room)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition" title="Edit"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDeleteClick(room.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition" title="Hapus"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400">Data tidak ditemukan</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">{isEditing ? "Edit Kamar" : "Tambah Kamar Baru"}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                    
                    {/* INPUT GAMBAR */}
                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Foto Kamar</label>
                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden shrink-0">
                                {previewImage ? (
                                    <Image src={previewImage} alt="Preview" fill className="object-cover"/>
                                ) : (
                                    <ImageIcon className="text-gray-400"/>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="cursor-pointer bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 w-fit mb-2">
                                    <UploadCloud className="w-4 h-4"/> Pilih File
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange}/>
                                </label>
                                <p className="text-xs text-gray-400">Format: JPG, PNG. Maksimal 2MB.</p>
                                {selectedImage && <p className="text-xs text-green-600 mt-1 font-medium">Terpilih: {selectedImage.name}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Nama Kamar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamar</label>
                        <input name="name" required value={formData.name || ""} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Single Deluxe"/>
                    </div>
                    
                    {/* Tipe & Harga */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                            <input name="type" required value={formData.type || ""} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="single / double"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                            <input name="price" required value={formData.price || ""} onChange={handleChange} type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="220000"/>
                        </div>
                    </div>

                    {/* Lokasi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"/>
                            <input name="location" value={formData.location || ""} onChange={handleChange} type="text" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Jl Sudirman No. 10"/>
                        </div>
                    </div>

                    {/* Fasilitas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fasilitas (Pisahkan dengan koma)</label>
                        <input 
                            value={facilitiesInput} 
                            onChange={(e) => setFacilitiesInput(e.target.value)} 
                            type="text" 
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="AC, WiFi, TV"
                        />
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Kamar</label>
                        <textarea 
                            name="description" 
                            rows={3}
                            value={formData.description || ""} 
                            onChange={handleChange} 
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                            placeholder="Deskripsi singkat..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">Batal</button>
                        <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-70">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                            {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}