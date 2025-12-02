import { Room } from "@/types";

export const rooms: Room[] = [
  {
    id: 1,
    name: "Kamar Deluxe A1",
    price: 150000,
    status: "available",
    // Gambar Kamar Tidur Modern
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800",
    facilities: ["AC", "WiFi", "TV", "Kamar Mandi Dalam"],
    description: "Kamar nyaman dengan pencahayaan alami dan kasur empuk.",
    rating: 4.8,
    location: "Jakarta Selatan"
  },
  {
    id: 2,
    name: "Kamar Standard B2",
    price: 100000,
    status: "occupied",
    // Gambar Kamar Tidur Minimalis
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800",
    facilities: ["Kipas Angin", "WiFi"],
    description: "Pilihan hemat untuk backpacker atau mahasiswa.",
    rating: 4.5,
    location: "Jakarta Barat"
  },
  {
    id: 3,
    name: "Kamar Premium C3",
    price: 200000,
    status: "cleaning",
    // Gambar Kamar Hotel Mewah
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800",
    facilities: ["AC", "Water Heater", "Netflix"],
    description: "Kamar luas dengan fasilitas lengkap seperti hotel.",
    rating: 5.0,
    location: "Jakarta Pusat"
  }
];