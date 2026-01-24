"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, X, Save, Image as ImageIcon, MapPin,  Loader2, EyeIcon, XIcon } from "lucide-react";
import { Room } from "@/types";
import { useNotification } from "@/context/NotificationContext"; 
import Image from "next/image";
import api from "@/lib/axios"; 

export default function ManageRoomsPage() {
  const { showToast, showPopup } = useNotification();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Room>>({});
  const [facilities, setFacilities] = useState<string[]>([]); 
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [roomImages, setRoomImages] = useState<{id:number, path:string, is_cover:boolean}[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);


  // --- FETCH DATA ---
  const fetchRooms = useCallback(async () => {
    try {
        const response = await api.get('/rooms', {
            params: { _t: new Date().getTime() } 
        });

        const rawData = Array.isArray(response.data) ? response.data : response.data.data || [];
        
        const mappedRooms: Room[] = rawData.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type || "Single",
            price: Number(item.price_per_day),
            status: item.is_available === false ? "occupied" : "available",
            image: item.image || "",
            facilities: (() => {
                if (Array.isArray(item.facilities)) return item.facilities;
                if (typeof item.facilities === "string") {
                try {
                    return JSON.parse(item.facilities);
                } catch {
                    return [];
                }
                }
                return [];
            })(),
            description: item.description || "",
            location: item.location || "",
        }));
            console.log("RAW ITEM:", rawData[0]);
            console.log("MAPPED ROOM:", mappedRooms[0]);



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
  const handleImageManager = async (roomId: number) => {
    setCurrentRoomId(roomId);
    setIsImageModalOpen(true);

    try {
        const res = await api.get(`/admin/rooms/${roomId}/images`);
        setRoomImages(res.data);
    } catch (err) {
        console.error(err);
        showToast("Gagal load gambar", "error");
    }
  };
  const handleImageChangeModal = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if(file.size > 2*1024*1024) return showToast("Ukuran maksimal 2MB", "error");
        setNewImageFile(file);
    }
    };

    const uploadImage = async () => {
        if(!newImageFile || !currentRoomId) return;
        const form = new FormData();
        form.append("image", newImageFile);
        try {
            await api.post(`/admin/rooms/${currentRoomId}/images`, form);
            showToast("Gambar berhasil di-upload", "success");
            setNewImageFile(null);
            const res = await api.get(`/admin/rooms/${currentRoomId}/images`);
            setRoomImages(res.data);
        } catch(err) {
            console.error(err);
            showToast("Upload gagal", "error");
        }
    };

    const setCover = async (id:number) => {
        try {
            await api.post(`/admin/room/${id}/cover`);
            showToast("Cover berhasil diubah", "success");
            if(currentRoomId){
                const res = await api.get(`/admin/rooms/${currentRoomId}/images`);
                setRoomImages(res.data);
            }
        } catch(err){
            console.error(err);
            showToast("Gagal mengubah cover", "error");
        }
    };

    const deleteImage = async (id:number) => {
        showPopup("Hapus Gambar?", "Gambar akan dihapus permanen.", "warning", async () => {
            try {
                await api.delete(`/admin/rooms/${id}/images`);
                showToast("Gambar berhasil dihapus", "success");
                if(currentRoomId){
                    const res = await api.get(`/admin/rooms/${currentRoomId}/images`);
                    setRoomImages(res.data);
                }
            } catch(err){
                console.error(err);
                showToast("Gagal hapus gambar", "error");
            }
        });
    };



  const handleAddClick = () => {
    setIsEditing(false);
    setFormData({ 
        name: "", type: "Single", price: 0, location: "", description: "" 
    });
    setFacilities([]); 
    setIsModalOpen(true);
  };

  const handleEditClick = (room: Room) => {
    setIsEditing(true);
    setFormData({
        id: room.id,
        name: room.name,
        type: room.type,
        price: room.price,
        location: room.location,
        description: room.description,
    });
    setFacilities(room.facilities || []);
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

        facilities.forEach((fac, index) => {
            payload.append(`facilities[${index}]`, fac);
        });

        if (selectedImage) {
            payload.append('image', selectedImage);
        }

        if (isEditing && formData.id) {
            payload.append('_method', 'PUT'); 
            await api.post(`/admin/rooms/${formData.id}`, payload);
            showToast("Data kamar berhasil diperbarui", "success");
        } else {
            await api.post('/admin/rooms', payload);
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
            await api.delete(`/admin/rooms/${id}`);

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
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleImageManager(room.id)}
                                        className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition"
                                        title="Kelola Gambar"
                                        >
                                        <ImageIcon className="w-4 h-4"/>
                                    </button>
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

                    {/* Nama Kamar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamar</label>
                        <input name="name" required value={formData.name || ""} onChange={handleChange} type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Single Deluxe"/>
                    </div>
                    
                    {/* Tipe & Harga */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                            <select 
                                name="type" 
                                required 
                                value={formData.type || "single"} 
                                onChange={handleChange} 
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                            >
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="family">Family</option>

                            </select>
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
                        <select name="" id=""
                        value=""
                        onChange={(e) => {
                            const val = e.target.value;
                            if( val && !facilities.includes(val)) {
                                setFacilities([...facilities, val]);
                            }
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white mb-2">
                            <option value="" disabled>Pilih fasilitas</option>
                            <option value="AC">AC</option>
                            <option value="WiFi">WiFi</option>
                            <option value="TV">TV</option>
                            <option value="Kamar Mandi Dalam">Kamar Mandi Dalam</option>
                            <option value="Water Heater">Water Heater</option>
                        </select>
                        <div className="flex flex-wrap gap-2">
                            {facilities.map((f) => (
                                <span
                                key={f}
                                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2"
                                >
                                {f}
                                <button
                                    type="button"
                                    onClick={() => setFacilities(facilities.filter(x => x !== f))}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                </span>
                            ))}
                            </div>
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
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold">Kelola Gambar Kamar</h2>
                <button onClick={() => setIsImageModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="w-6 h-6"/></button>
            </div>

            <div className="p-6 space-y-4">
                {/* Upload Baru */}
                <div className="flex gap-2 items-center">
                <input type="file" accept="image/*" onChange={handleImageChangeModal}/>
                <button onClick={uploadImage} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700">Upload</button>
                </div>

                {/* List Gambar */}
                <div className="grid grid-cols-3 gap-4">
                {roomImages.map(img => (
                    <div key={img.id} className="relative group">
                    <Image src={img.path} alt="room" width={100} height={100} className="object-cover rounded-lg"/>
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        {!img.is_cover && (
                        <button onClick={()=>setCover(img.id)} className="bg-green-500 text-white p-1 rounded" title="Set Cover"><EyeIcon className="w-4 h-4"/></button>
                        )}
                        <button onClick={()=>deleteImage(img.id)} className="bg-red-500 text-white p-1 rounded" title="Hapus"><XIcon/></button>
                    </div>
                    {img.is_cover && <span className="absolute bottom-1 left-1 bg-yellow-400 text-white px-1 text-[10px] rounded">Cover</span>}
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
        )}

    </div>
  );
  
}