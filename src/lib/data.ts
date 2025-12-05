import { Room } from "@/types";

export const rooms: Room[] = [
  // --- DATA LAMA (1-3) ---
  {
    id: 1,
    name: "Kamar Deluxe A1",
    type: "Deluxe",
    price: 150000,
    status: "available",
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800",
    facilities: ["AC", "WiFi", "TV", "Kamar Mandi Dalam"],
    description: "Kamar nyaman dengan pencahayaan alami dan kasur empuk.",
    rating: 4.8,
    location: "Jakarta Selatan"
  },
  {
    id: 2,
    name: "Kamar Standard B2",
    type: "Standard",
    price: 100000,
    status: "available",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800",
    facilities: ["Kipas Angin", "WiFi"],
    description: "Pilihan hemat untuk backpacker atau mahasiswa.",
    rating: 4.5,
    location: "Sumatera Barat"
  },
  {
    id: 3,
    name: "Kamar Premium C3",
    type: "Premium",
    price: 200000,
    status: "available",
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800",
    facilities: ["AC", "Water Heater", "Netflix"],
    description: "Kamar luas dengan fasilitas lengkap seperti hotel.",
    rating: 5.0,
    location: "Jakarta Pusat"
  },

  // --- DATA BARU (4-9) ---
  {
    id: 4,
    name: "Family Suite F1",
    type: "Suite",
    price: 350000,
    status: "available",
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800",
    facilities: ["2 King Beds", "AC", "Kitchenette", "TV 50 Inch"],
    description: "Kamar super luas cocok untuk liburan keluarga kecil. Dilengkapi dapur mini.",
    rating: 4.9,
    location: "Kalimantan Selatan"
  },
  {
    id: 5,
    name: "Single Pod S1",
    type: "Single",
    price: 85000,
    status: "available",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800",
    facilities: ["Single Bed", "WiFi", "Shared Bathroom"],
    description: "Kamar kapsul minimalis untuk solo traveler yang praktis dan hemat.",
    rating: 4.3,
    location: "IKN Pusat"
  },
  {
    id: 6,
    name: "Garden View G2",
    type: "Deluxe",
    price: 180000,
    status: "available",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800",
    facilities: ["AC", "WiFi", "Balcony", "Coffee Maker"],
    description: "Menghadap taman yang asri dengan udara segar. Cocok untuk healing.",
    rating: 4.7,
    location: "Jakarta Timur"
  },
  {
    id: 7,
    name: "Executive Room E1",
    type: "Executive",
    price: 250000,
    status: "available",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800",
    facilities: ["Work Desk", "High Speed WiFi", "AC", "Mini Bar"],
    description: "Dirancang untuk profesional yang butuh ketenangan kerja dan internet cepat.",
    rating: 4.8,
    location: "Jawa Pusat"
  },
  {
    id: 8,
    name: "Loft Style L1",
    type: "Premium",
    price: 220000,
    status: "available",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800",
    facilities: ["Mezzanine Bed", "Smart TV", "AC", "Sofa"],
    description: "Desain loft kekinian yang instagramable dengan ruang santai di bawah.",
    rating: 4.9,
    location: "Sulawesi Selatan"
  },
  {
    id: 9,
    name: "Bunkbed Room H1",
    type: "Standard",
    price: 120000,
    status: "available",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800",
    facilities: ["Bunk Bed", "AC", "Lockers"],
    description: "Kamar dengan ranjang tingkat, seru untuk menginap berdua dengan teman.",
    rating: 4.4,
    location: "Bali"
  }
];