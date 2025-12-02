"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { Send, ArrowLeft, Reply, X } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'admin';
  time: string;
  replyTo?: { text: string; senderName: string } | null;
}

interface ChatViewProps {
  isModal?: boolean;
}

function ChatContent({ isModal = false }: ChatViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomContext = searchParams.get("context");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Halo! Selamat datang di MiniStay.", sender: "admin", time: "10:30" },
    { id: 2, text: `Ada yang bisa kami bantu ${roomContext ? `soal ${roomContext}` : ''}?`, sender: "admin", time: "10:30" }
  ]);
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, replyingTo]);

  const handleSend = () => {
    if(!input.trim()) return;
    const newMessage: Message = { 
      id: Date.now(), text: input, sender: "user", time: "Now",
      replyTo: replyingTo ? { text: replyingTo.text, senderName: replyingTo.sender === 'admin' ? 'Admin' : 'Anda' } : null
    };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setReplyingTo(null);
  };

  const handleClose = () => {
    if (isModal) router.back();
    else router.push("/");
  };

  return (
    // Wrapper Card
    <div className={`bg-gray-50 flex flex-col w-full max-w-md mx-auto overflow-hidden ${isModal ? 'rounded-2xl shadow-2xl h-[85vh]' : 'h-screen border-x border-gray-200'}`}>
      
      {/* HEADER */}
      <div className="bg-blue-600 text-white p-4 flex items-center gap-3 shrink-0">
        <button onClick={handleClose} className="hover:bg-white/20 rounded-full p-1 transition">
            {isModal ? <X className="w-6 h-6"/> : <ArrowLeft className="w-6 h-6" />}
        </button>
        <div className="flex-1">
            <h1 className="font-bold leading-tight">Admin MiniStay</h1>
            <p className="text-xs text-blue-100 opacity-90">● Online</p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context Bubble */}
        {roomContext && (
             <div className="flex justify-center mb-6 sticky top-0 z-10">
                <div className="bg-blue-100/90 text-blue-800 text-xs px-3 py-1 rounded-full shadow-sm backdrop-blur-sm border border-blue-200">
                    Topik: <b>{roomContext}</b>
                </div>
            </div>
        )}
        {/* Messages Loop */}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div className={`relative max-w-[85%] rounded-2xl p-2 group transition-all ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"}`}>
              {msg.replyTo && (
                <div className={`rounded-lg p-2 mb-1 text-xs border-l-2 ${msg.sender === "user" ? "bg-white/10 border-white/50" : "bg-gray-50 border-blue-500 text-gray-500"}`}>
                    <p className="font-bold opacity-80">{msg.replyTo.senderName}</p>
                    <p className="truncate opacity-70">{msg.replyTo.text}</p>
                </div>
              )}
              <div className="px-2 text-sm">{msg.text}</div>
              {/* Tombol Reply Hover */}
              <button onClick={() => setReplyingTo(msg)} className={`absolute top-2 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${msg.sender === 'user' ? '-left-10' : '-right-10'}`}>
                 <div className="bg-gray-200 text-gray-600 p-1.5 rounded-full hover:bg-blue-100 hover:text-blue-600"><Reply className="w-4 h-4" /></div>
              </button>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-white p-3 border-t border-gray-100 shrink-0">
        {replyingTo && (
            <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded-lg border-l-4 border-blue-600">
                <div className="ml-2 text-xs"><p className="font-bold text-blue-600">Membalas...</p><p className="truncate text-gray-500">{replyingTo.text}</p></div>
                <button onClick={() => setReplyingTo(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
        )}
        <div className="flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ketik pesan..." className="flex-1 bg-gray-100 rounded-full px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
            <button onClick={handleSend} disabled={!input.trim()} className={`p-3 rounded-full ${input.trim() ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}><Send className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}

export default function ChatView(props: ChatViewProps) {
  return <Suspense fallback={<div className="p-4 text-center">Loading...</div>}><ChatContent {...props} /></Suspense>;
}