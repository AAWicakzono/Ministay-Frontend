"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { Send, ArrowLeft, Reply, X, CheckCheck } from "lucide-react";
import { Message, ChatSession } from "@/types"; 

interface ChatViewProps {
  isModal?: boolean;
}

function ChatContent({ isModal = false }: ChatViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const rawRoomId = searchParams.get("roomId");
  const roomContext = searchParams.get("context");
  
  const roomId = rawRoomId || (roomContext ? `room-${roomContext.replace(/\s+/g, '-')}` : "general");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // LOAD PESAN
  useEffect(() => {
    setMessages([]); 

    if (typeof window !== "undefined") {
      const allChats: ChatSession[] = JSON.parse(localStorage.getItem("ministay_chats") || "[]");
      
      const currentChat = allChats.find(c => String(c.roomId) === String(roomId));

      if (currentChat && currentChat.messages.length > 0) {
        setMessages(currentChat.messages);
      } else {

        const initialMessages: Message[] = [
          { 
            id: 1, 
            text: roomId === "general" ? "Halo! Ada yang bisa kami bantu?" : `Halo! Tertarik dengan ${roomContext}?`, 
            sender: "admin", 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
          }
        ];
        setMessages(initialMessages);
      }
    }
  }, [roomId, roomContext]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, replyingTo]);

  const handleSend = () => {
    if(!input.trim()) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: Message = { 
      id: Date.now(), 
      text: input, 
      sender: "user", 
      time: timeString,
      replyTo: replyingTo ? { text: replyingTo.text, senderName: replyingTo.sender === 'admin' ? 'Admin' : 'Anda' } : null
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setInput("");
    setReplyingTo(null);

    // Update LocalStorage
    const allChats: ChatSession[] = JSON.parse(localStorage.getItem("ministay_chats") || "[]");
    const existingIndex = allChats.findIndex(c => String(c.roomId) === String(roomId));

    const chatData: ChatSession = {
      roomId: String(roomId),
      roomName: roomContext || (existingIndex > -1 ? allChats[existingIndex].roomName : "Customer Service"),
      lastMessage: input,
      timestamp: timeString,
      messages: newMessages,
      unread: 0,
      avatar: roomId === "general" ? "CS" : "RM"
    };

    if (existingIndex > -1) {
      allChats[existingIndex] = chatData;
    } else {
      allChats.push(chatData);
    }

    localStorage.setItem("ministay_chats", JSON.stringify(allChats));
    window.dispatchEvent(new Event("storage")); 
  };

  const handleClose = () => {
    if (isModal) router.back();
    else router.push("/chat");
  };

  return (
    <div className={`bg-gray-50 flex flex-col w-full max-w-md mx-auto overflow-hidden ${isModal ? 'rounded-2xl shadow-2xl h-[85vh]' : 'h-screen border-x border-gray-200'}`}>
      
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3 shrink-0 shadow-md z-10">
        <button onClick={handleClose} className="hover:bg-white/20 rounded-full p-1 transition">
            <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
            {/* Judul Header Dinamis */}
            <h1 className="font-bold leading-tight truncate">
              {roomId === "general" ? "Customer Service" : (roomContext || "Admin Kamar")}
            </h1>
            <p className="text-xs text-blue-100 opacity-90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
            </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] bg-opacity-10">
        {roomId !== "general" && roomContext && (
           <div className="flex justify-center my-2 sticky top-0 z-0">
              <div className="bg-white/80 backdrop-blur-sm text-gray-500 text-[10px] px-3 py-1 rounded-full shadow-sm border border-gray-200">
                  Chatting soal: <b>{roomContext}</b>
              </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className={`relative max-w-[85%] rounded-2xl p-2 px-3 shadow-sm group transition-all ${
                msg.sender === "user" 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
            }`}>
              
              {msg.replyTo && (
                <div className={`rounded-lg p-2 mb-1 text-xs border-l-2 bg-black/10 ${msg.sender === 'user' ? 'border-white/50' : 'border-blue-500'}`}>
                    <p className="font-bold opacity-90">{msg.replyTo.senderName}</p>
                    <p className="truncate opacity-80">{msg.replyTo.text}</p>
                </div>
              )}

              <div className="text-sm leading-relaxed wrap-break-word">{msg.text}</div>
              
              <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {msg.time}
                {msg.sender === 'user' && <CheckCheck className="w-3 h-3" />}
              </div>

              <button onClick={() => setReplyingTo(msg)} className={`absolute top-2 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${msg.sender === 'user' ? '-left-10' : '-right-10'}`}>
                 <div className="bg-gray-200 text-gray-600 p-1.5 rounded-full hover:bg-blue-100 hover:text-blue-600 shadow-sm"><Reply className="w-4 h-4" /></div>
              </button>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 border-t border-gray-100 shrink-0">
        {replyingTo && (
            <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded-lg border-l-4 border-blue-600 animate-in slide-in-from-bottom-2">
                <div className="ml-2 text-xs overflow-hidden">
                    <p className="font-bold text-blue-600">Membalas {replyingTo.sender === 'admin' ? 'Admin' : 'Anda'}</p>
                    <p className="truncate text-gray-500">{replyingTo.text}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
        )}
        <div className="flex gap-2 items-end">
            <textarea 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Ketik pesan..." 
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none max-h-24 scrollbar-hide"
                rows={1}
            />
            <button onClick={handleSend} disabled={!input.trim()} className={`p-3 rounded-full mb-0.5 transition-transform active:scale-95 ${input.trim() ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-200 text-gray-400"}`}>
                <Send className="w-5 h-5 ml-0.5" />
            </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatView(props: ChatViewProps) {
  return <Suspense fallback={<div className="p-4 text-center">Loading Chat...</div>}><ChatContent {...props} /></Suspense>;
}