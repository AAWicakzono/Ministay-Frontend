"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Search, User, Send, Paperclip, CheckCheck, MoreVertical, Phone, X, ChevronLeft } from "lucide-react";
import { ChatSession, Message } from "@/types";
import { useRouter } from "next/navigation";

interface InboxViewProps {
  isModal?: boolean;
}

export default function InboxView({ isModal = false }: InboxViewProps) {
  const [chatList, setChatList] = useState<ChatSession[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const loadChats = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ministay_chats");
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        const validChats = parsed.filter(c => c.messages.length > 0).reverse();
        setChatList(validChats);
      }
    }
  };

  useEffect(() => {
    loadChats();
    window.addEventListener("storage", loadChats);
    return () => window.removeEventListener("storage", loadChats);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768 && chatList.length > 0 && !selectedRoomId) {
      setSelectedRoomId(chatList[0].roomId);
    }
  }, [chatList]);

  const activeChat = chatList.find(c => c.roomId === selectedRoomId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const newMsg: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const allChats: ChatSession[] = JSON.parse(localStorage.getItem("ministay_chats") || "[]");
    const updatedChats = allChats.map(c => {
      if (c.roomId === selectedRoomId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: inputMessage,
          timestamp: newMsg.time
        };
      }
      return c;
    });

    localStorage.setItem("ministay_chats", JSON.stringify(updatedChats));
    window.dispatchEvent(new Event("storage"));
    setInputMessage("");
  };

  const handleClose = () => {
    if (isModal) router.back();
    else router.push("/");
  };

  return (
    // FIX: Hapus 'fixed', gunakan 'h-full w-full' agar mengikuti container parent (Modal/Page)
    // rounded-2xl hanya jika modal agar sudutnya tumpul
    <div className={`bg-white overflow-hidden flex flex-col ${isModal ? 'h-full w-full rounded-2xl' : 'min-h-screen'}`}>
      
      {/* Tombol Close (Khusus Modal) */}
      {isModal && (
        <button onClick={handleClose} className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-red-50 hover:text-red-500 text-gray-500 p-2 rounded-full transition shadow-sm backdrop-blur-sm">
            <X className="w-5 h-5"/>
        </button>
      )}

      <div className="flex flex-1 h-full overflow-hidden">
        
        {/* SIDEBAR KIRI */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-white ${selectedRoomId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h1 className="font-bold text-2xl text-gray-900 mb-4">Inbox Pesan</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Cari chat..." className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {chatList.length === 0 ? (
                    <div className="text-center py-20 px-6 opacity-50">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300"/>
                        <p className="text-sm text-gray-400">Belum ada pesan.</p>
                    </div>
                ) : (
                    chatList.map((chat) => (
                        <div key={chat.roomId} onClick={() => setSelectedRoomId(chat.roomId)} className={`p-4 flex gap-4 cursor-pointer transition border-b border-gray-50 hover:bg-gray-50 ${selectedRoomId === chat.roomId ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white shadow-sm ${selectedRoomId === chat.roomId ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                {chat.avatar || <User className="w-6 h-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-bold truncate pr-2 text-sm ${selectedRoomId === chat.roomId ? 'text-blue-700' : 'text-gray-900'}`}>{chat.roomName}</h3>
                                    <span className="text-[10px] text-gray-400">{chat.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate"><span className="text-gray-400 mr-1">{chat.messages[chat.messages.length - 1]?.sender === 'user' ? 'Anda:' : 'Admin:'}</span>{chat.lastMessage}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* AREA KANAN */}
        <div className={`flex-1 flex-col bg-gray-50 relative ${selectedRoomId ? 'flex' : 'hidden md:flex'}`}>
            {activeChat ? (
                <>
                    <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10 h-[72px]">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSelectedRoomId(null)} className="md:hidden hover:bg-gray-100 p-2 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">{activeChat.avatar || <User className="w-5 h-5"/>}</div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{activeChat.roomName}</h3>
                                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><p className="text-xs text-gray-500">Admin Online</p></div>
                            </div>
                        </div>
                        <div className="flex gap-2 text-gray-400"><button className="p-2 hover:bg-gray-100 rounded-full"><Phone className="w-5 h-5"/></button><button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5"/></button></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8fafc]">
                        {activeChat.messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 px-4 rounded-2xl text-sm shadow-sm relative group ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
                                    <p className="leading-relaxed">{msg.text}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender === 'user' ? 'text-blue-200' : 'text-gray-400'}`}><span>{msg.time}</span>{msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5" />}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="bg-white p-4 border-t border-gray-100">
                        <div className="flex gap-3 items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
                            <button className="text-gray-400 hover:text-blue-600 transition"><Paperclip className="w-5 h-5"/></button>
                            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Ketik pesan..." className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400" onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}/>
                            <button onClick={handleSendMessage} disabled={!inputMessage.trim()} className={`p-2 rounded-full transition ${inputMessage.trim() ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" : "bg-gray-200 text-gray-400"}`}><Send className="w-4 h-4 ml-0.5"/></button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                    <MessageCircle className="w-24 h-24 mb-4 opacity-20"/>
                    <p className="text-gray-400 font-medium">Pilih percakapan untuk memulai chat</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}