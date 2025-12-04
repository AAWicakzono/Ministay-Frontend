"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ChatView from "@/components/ChatView";
import Navbar from "@/components/Navbar";
import { MessageCircle, Search, User, ChevronRight } from "lucide-react";
import { ChatSession } from "@/types";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const router = useRouter();
  
  const [chatList, setChatList] = useState<ChatSession[]>([]);
  const [mounted, setMounted] = useState(false);

  // Function load data dengan validasi
  const loadChats = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("ministay_chats");
        if (stored) {
          const parsed: ChatSession[] = JSON.parse(stored);
          
          // Filter hanya chat yang valid (punya pesan)
          const validChats = parsed.filter(c => c.messages && c.messages.length > 0);
          
          // Sort by timestamp (terbaru diatas)
          // Asumsi timestamp string "HH:MM", idealnya pakai Date object untuk sort akurat
          // Untuk prototype, kita reverse saja array-nya (asumsi push urut waktu)
          setChatList(validChats.reverse());
        }
      } catch (error) {
        console.error("Gagal load chat history:", error);
        // Jika data corrupt, reset storage (opsional, hati-hati)
        // localStorage.removeItem("ministay_chats"); 
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    if (!roomId) {
      loadChats();
      // Listener agar jika ada update di tab lain/modal, list terupdate
      window.addEventListener("storage", loadChats);
      return () => window.removeEventListener("storage", loadChats);
    }
  }, [roomId]);

  if (!mounted) return null; // Cegah hydration mismatch

  // KONDISI 1: Sedang membuka chat room tertentu
  if (roomId) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center md:p-4">
            <ChatView isModal={false} />
        </div>
    );
  }

  // KONDISI 2: Halaman Inbox (Daftar Chat)
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-md mx-auto p-4 space-y-4 pt-6">
        {/* Header Inbox */}
        <div className="flex items-center justify-between mb-2">
            <h1 className="font-bold text-2xl text-gray-900">Pesan Masuk</h1>
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full shadow-sm">
                <MessageCircle className="w-5 h-5" />
            </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
            <Search className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
            <input 
                type="text" 
                placeholder="Cari riwayat pesan..." 
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm"
            />
        </div>

        {/* Chat List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {chatList.length === 0 ? (
                <div className="text-center py-16 px-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl animate-bounce">💬</div>
                    <h3 className="font-bold text-gray-900">Belum ada pesan</h3>
                    <p className="text-sm text-gray-500 mt-2">Riwayat percakapan Anda dengan admin akan muncul di sini.</p>
                    <button 
                        onClick={() => router.push('/')}
                        className="mt-6 text-blue-600 text-sm font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition"
                    >
                        Mulai Chat dari Kamar
                    </button>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {chatList.map((chat) => (
                        <div 
                            key={chat.roomId}
                            onClick={() => router.push(`/chat?context=${encodeURIComponent(chat.roomName)}&roomId=${chat.roomId}`)}
                            className="p-4 flex gap-3 hover:bg-gray-50 cursor-pointer transition active:bg-gray-100 group"
                        >
                            {/* Avatar Room */}
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                                {chat.avatar || <User className="w-6 h-6" />}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-gray-900 truncate pr-2 text-base">{chat.roomName}</h3>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap bg-gray-100 px-1.5 py-0.5 rounded">{chat.timestamp}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-500 truncate max-w-[85%]">
                                        <span className="text-gray-400 mr-1 text-xs">{chat.messages[chat.messages.length - 1]?.sender === 'user' ? 'Anda:' : 'Admin:'}</span> 
                                        {chat.lastMessage}
                                    </p>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPageFull() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Memuat Inbox...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}