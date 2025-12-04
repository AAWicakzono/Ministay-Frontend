"use client";

import CheckoutView from "@/components/CheckoutView";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

export default function CheckoutModal() {
  const router = useRouter();

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm p-4"
      onClick={() => router.back()} // Klik luar untuk tutup
    >
      {/* Stop Propagation agar klik di dalam modal tidak menutup modal */}
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <Suspense fallback={<div className="bg-white p-4 rounded-xl text-center">Memuat Pembayaran...</div>}>
            <CheckoutView isModal={true} />
        </Suspense>
      </div>
    </div>
  );
}