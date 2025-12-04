"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Send, Paperclip, MoreVertical, Phone, CheckCheck, User } from "lucide-react";
import { ChatSession, Message } from "@/types";

export default function AdminChatPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load Data Chat dari LocalStorage
  const loadChats = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ministay_chats");
      if (stored) {
        // Sort by timestamp (simple logic)
        setChats(JSON.parse(stored).reverse());
      }
    }
  };

  useEffect(() => {
    loadChats();
    // Listener untuk update real-time jika user mengirim pesan di tab lain
    window.addEventListener("storage", loadChats);
    return () => window.removeEventListener("storage", loadChats);
  }, []);

  // Pilih chat pertama otomatis jika ada
  useEffect(() => {
    if (chats.length > 0 && !selectedRoomId) {
      setSelectedRoomId(chats[0].roomId);
    }
  }, [chats, selectedRoomId]);

  // Cari data active chat
  const activeChat = chats.find(c => c.roomId === selectedRoomId);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  // 2. Fungsi Admin Balas Pesan
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const newMsg: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: "admin",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update LocalStorage
    const updatedChats = chats.map(c => {
      if (c.roomId === selectedRoomId) {
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: inputMessage, // Update preview pesan terakhir
          timestamp: newMsg.time
        };
      }
      return c;
    });

    setChats(updatedChats); // Update UI Admin
    localStorage.setItem("ministay_chats", JSON.stringify(updatedChats)); // Simpan
    window.dispatchEvent(new Event("storage")); // Trigger update di sisi User

    setInputMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* === SIDEBAR KIRI: DAFTAR CHAT === */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white">
        
        {/* Header Pencarian */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-lg mb-3">Inbox Pesan</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari tamu / kamar..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* List User */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Belum ada pesan masuk.</div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat.roomId}
                onClick={() => setSelectedRoomId(chat.roomId)}
                className={`p-4 flex gap-3 cursor-pointer transition hover:bg-gray-50 border-b border-gray-50 ${selectedRoomId === chat.roomId ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : ''}`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {chat.avatar || "CS"}
                  </div>
                </div>

                {/* Info Chat */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-bold truncate ${selectedRoomId === chat.roomId ? 'text-blue-700' : 'text-gray-900'}`}>
                          Tamu (Room {chat.roomId})
                      </h4>
                      <span className="text-[10px] text-gray-400">{chat.timestamp}</span>
                  </div>
                  
                  {/* Context Kamar */}
                  <p className="text-[10px] text-gray-500 font-medium mb-1 bg-gray-100 w-fit px-1.5 py-0.5 rounded truncate max-w-full">
                      🏠 {chat.roomName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* === AREA KANAN: ISI CHAT === */}
      {activeChat ? (
        <div className="flex-1 flex flex-col bg-[#f0f2f5]">
            {/* Header Chat Active */}
            <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                        <User className="w-5 h-5"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Tamu - {activeChat.roomName}</h3>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-green-600 flex items-center gap-1">● Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><Phone size={18}/></button>
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><MoreVertical size={18}/></button>
                </div>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeChat.messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 px-4 rounded-2xl text-sm shadow-sm relative group ${
                            msg.sender === 'admin' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                                <span>{msg.time}</span>
                                {msg.sender === 'admin' && <CheckCheck size={12} />}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <button type="button" className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition">
                        <Paperclip size={20}/>
                    </button>
                    <input 
                        type="text" 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ketik balasan sebagai admin..." 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputMessage.trim()}
                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:bg-gray-300"
                    >
                        <Send size={20}/>
                    </button>
                </form>
            </div>
        </div>
      ) : (
        // State Kosong (Belum pilih chat)
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Paperclip className="w-8 h-8 opacity-20" />
            </div>
            <p>Pilih pesan dari menu sebelah kiri</p>
        </div>
      )}
    </div>
  );
}