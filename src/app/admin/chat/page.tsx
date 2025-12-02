"use client";

import { useState } from "react";
import { Search, Send, Paperclip, MoreVertical, Phone, Check, CheckCheck } from "lucide-react";

// --- MOCK DATA: Daftar Chat Masuk ---
// Perhatikan field 'roomContext' -> Ini yang menampilkan tamu tanya kamar apa
const mockChats = [
  {
    id: 1,
    user: "Budi Santoso",
    avatar: "BS",
    roomContext: "Kamar Deluxe A1", // <--- INI YG DIMINTA
    lastMessage: "Apakah parkir mobilnya luas mas?",
    time: "10:30",
    unread: 2,
    online: true,
    messages: [
      { id: 1, text: "Halo admin, mau tanya", sender: "user", time: "10:29" },
      { id: 2, text: "Apakah parkir mobilnya luas mas?", sender: "user", time: "10:30" },
    ]
  },
  {
    id: 2,
    user: "Siti Rahma",
    avatar: "SR",
    roomContext: "Kamar Standard B2", // <--- INI YG DIMINTA
    lastMessage: "Baik terima kasih infonya.",
    time: "09:15",
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: "Kamar ini bisa untuk 2 orang?", sender: "user", time: "09:00" },
      { id: 2, text: "Bisa kak, maksimal 2 orang dewasa.", sender: "admin", time: "09:05" },
      { id: 3, text: "Baik terima kasih infonya.", sender: "user", time: "09:15" },
    ]
  },
  {
    id: 3,
    user: "Ahmad Rizki",
    avatar: "AR",
    roomContext: "Kamar Premium C3",
    lastMessage: "Saya sudah transfer ya",
    time: "Kemarin",
    unread: 1,
    online: true,
    messages: [
      { id: 1, text: "Saya sudah transfer ya", sender: "user", time: "Yesterday" },
    ]
  }
];

export default function AdminChatPage() {
  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [inputMessage, setInputMessage] = useState("");
  
  // Cari data chat yang sedang dibuka
  const activeChat = mockChats.find(c => c.id === selectedChatId) || mockChats[0];
  
  // State pesan (agar bisa simulasi nambah pesan)
  const [messages, setMessages] = useState(activeChat.messages);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      text: inputMessage,
      sender: "admin",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* === SIDEBAR KIRI: DAFTAR CHAT === */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white">
        
        {/* Header Pencarian */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari tamu..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* List User */}
        <div className="flex-1 overflow-y-auto">
          {mockChats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => {
                setSelectedChatId(chat.id);
                setMessages(chat.messages); // Load pesan user tersebut
              }}
              className={`p-4 flex gap-3 cursor-pointer transition hover:bg-gray-50 ${selectedChatId === chat.id ? 'bg-blue-50/60 border-l-4 border-blue-600' : ''}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                    {chat.avatar}
                </div>
                {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>

              {/* Info Chat */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold truncate ${selectedChatId === chat.id ? 'text-blue-700' : 'text-gray-900'}`}>
                        {chat.user}
                    </h4>
                    <span className="text-[10px] text-gray-400">{chat.time}</span>
                </div>
                
                {/* --- CONTEXT KAMAR (OUTPUT YANG DIMINTA) --- */}
                <p className="text-[10px] text-blue-600 font-medium mb-1 bg-blue-100/50 w-fit px-1.5 py-0.5 rounded">
                    🏠 {chat.roomContext}
                </p>

                <p className="text-xs text-gray-500 truncate">
                    {chat.lastMessage}
                </p>
              </div>

              {/* Badge Unread */}
              {chat.unread > 0 && (
                <div className="shrink-0 flex flex-col justify-center">
                    <div className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {chat.unread}
                    </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* === AREA UTAMA: ISI CHAT === */}
      <div className="flex-1 flex flex-col bg-gray-50/30">
        
        {/* Header Chat Active */}
        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                    {activeChat.avatar}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">{activeChat.user}</h3>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600 flex items-center gap-1">● Online</span>
                        <span className="text-gray-300">|</span>
                        {/* KONTEKS KAMAR DI HEADER JUGA */}
                        <span className="text-blue-600 font-medium">Bertanya soal: {activeChat.roomContext}</span>
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
            
            {/* Info Bubble Konteks */}
            <div className="flex justify-center my-4">
                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-medium shadow-sm">
                    Tamu memulai percakapan dari halaman: <span className="font-bold">{activeChat.roomContext}</span>
                </div>
            </div>

            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${
                        msg.sender === 'admin' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                    }`}>
                        <p>{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${msg.sender === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                            <span>{msg.time}</span>
                            {msg.sender === 'admin' && <CheckCheck size={12} />}
                        </div>
                    </div>
                </div>
            ))}
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
                    placeholder="Ketik balasan..." 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button 
                    type="submit" 
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <Send size={20}/>
                </button>
            </form>
        </div>

      </div>
    </div>
  );
}