import RoomDetailView from "@/components/RoomDetailView";
// import { rooms } from "@/lib/data";
// import Link from "next/link";
// import Image from "next/image";
// import { notFound } from "next/navigation";

// Perhatikan tipe datanya sekarang pakai Promise
export default async function RoomDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <RoomDetailView roomId={Number(id)} isModal={false} />
    </main>
  );
  
  
  //   // 1. WAJIB: Await params terlebih dahulu
  //   const resolvedParams = await params;
//   const roomId = resolvedParams.id;

//   // 2. Cari kamar berdasarkan ID
//   const room = rooms.find((r) => r.id === Number(roomId));

//   if (!room) {
//     return notFound();
//   }

//   return (
//     <main className="max-w-md mx-auto min-h-screen bg-white pb-20">
//       {/* Header Gambar */}
//       <div className="relative h-64 w-full">
//         <Image src={room.image} alt={room.name} fill className="object-cover" />
//         <Link href="/" className="absolute top-4 left-4 bg-white/80 p-2 rounded-full shadow z-10 hover:bg-white">
//           ⬅ Kembali
//         </Link>
//       </div>

//       <div className="p-6">
//         <div className="flex justify-between items-start mb-4">
//             <div>
//                 <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
//                 <p className="text-gray-500 text-sm">📍 {room.location || 'Lokasi Strategis'}</p>
//             </div>
//             <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded text-yellow-700 text-sm font-bold">
//                 ⭐ {room.rating || 5.0}
//             </div>
//         </div>
        
//         <p className="text-blue-600 text-xl font-bold mb-6">
//           Rp {room.price.toLocaleString("id-ID")} <span className="text-gray-400 text-sm font-normal">/ malam</span>
//         </p>

//         <div className="mb-6">
//           <h3 className="font-semibold text-gray-900 mb-2">Fasilitas</h3>
//           <div className="flex flex-wrap gap-2">
//             {room.facilities.map((fas, index) => (
//               <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//                 {fas}
//               </span>
//             ))}
//           </div>
//         </div>

//         <div className="mb-8">
//             <h3 className="font-semibold text-gray-900 mb-2">Deskripsi</h3>
//             <p className="text-gray-600 text-sm leading-relaxed">{room.description || "Deskripsi belum tersedia."}</p>
//         </div>

//         {/* Action Buttons (Sticky di bawah) */}
//         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 max-w-md mx-auto z-20">
//             {/* TOMBOL CHAT */}
//             <Link 
//                 href={`/chat?context=${encodeURIComponent(room.name)}&id=${room.id}`}
//                 className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-xl font-semibold text-center hover:bg-blue-50 transition"
//             >
//                 Chat Admin
//             </Link>
            
//             <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
//                 Pesan Sekarang
//             </button>
//         </div>
//       </div>
//     </main>
//   );

}