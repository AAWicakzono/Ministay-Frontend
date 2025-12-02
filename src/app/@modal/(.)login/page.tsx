"use client"; // Wajib karena pakai interaksi (onClick)

import LoginForm from "@/components/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginModal() {
  const router = useRouter();

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm"
      onClick={() => router.back()}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <LoginForm isModal={true} />
      </div>
    </div>
  );
}