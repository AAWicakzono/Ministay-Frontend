"use client";
import ChatView from "@/components/ChatView";
import { useRouter } from "next/navigation";

export default function ChatModal() {
  const router = useRouter();
  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm p-4"
        onClick={() => router.back()} // Klik luar untuk close
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
         <ChatView isModal={true} />
      </div>
    </div>
  );
}