"use client"; // 1. Jadikan Client Component

import { use } from "react"; // Hook baru React 19 untuk buka Promise
import { useRouter } from "next/navigation";
import RoomDetailView from "@/components/RoomDetailView";

export default function RoomModal({ params }: { params: Promise<{ id: string }> }) {
  // 2. Unwrap params menggunakan React.use() (Standar Next.js 15)
  const { id } = use(params); 
  const router = useRouter();

  return (
    // 3. Logic Overlay (Background Hitam) langsung disini
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm p-4"
      onClick={() => router.back()} // Klik luar = Tutup
    >
      {/* Stop Propagation agar klik isi modal tidak menutupnya */}
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl scrollbar-hide">
        {/* Render Detail Kamar */}
        <RoomDetailView roomId={Number(id)} isModal={true} />
      </div>
    </div>
  );
}