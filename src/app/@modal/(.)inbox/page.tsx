"use client";

import InboxView from "@/components/InboxView";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function InboxModal() {
  const router = useRouter();

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm p-4 md:p-8"
      onClick={() => router.back()} 
    >
      {/* Wrapper Modal: 
          - onClick stopPropagation: agar klik di dalam tidak menutup modal
          - max-w-6xl: Membatasi lebar agar tidak terlalu gepeng di layar lebar
          - h-full: Mengisi tinggi yang tersedia (dikurangi padding parent)
      */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-6xl h-full shadow-2xl relative"
      >
         <Suspense fallback={<div className="bg-white p-4 rounded-xl text-center">Memuat Pesan...</div>}>
            <InboxView isModal={true} />
         </Suspense>
      </div>
    </div>
  );
}