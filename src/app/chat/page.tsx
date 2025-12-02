import ChatView from "@/components/ChatView";

export default function ChatPageFull() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <ChatView isModal={false} />
    </main>
  );
}

// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { Suspense, useState, useRef, useEffect } from "react";
// import { Send, ArrowLeft, Reply, X } from "lucide-react";

// // Tipe Data Pesan
// interface Message {
//   id: number;
//   text: string;
//   sender: 'user' | 'admin';
//   time: string;
//   replyTo?: {
//     text: string;
//     senderName: string;
//   } | null;
// }

// function ChatContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const roomContext = searchParams.get("context");
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // State Pesan
//   const [messages, setMessages] = useState<Message[]>([
//     { id: 1, text: "Halo! Selamat datang di MiniStay.", sender: "admin", time: "10:30" },
//     { id: 2, text: `Ada yang bisa kami bantu perihal ${roomContext || 'kamar'}?`, sender: "admin", time: "10:30" }
//   ]);

//   const [input, setInput] = useState("");
//   const [replyingTo, setReplyingTo] = useState<Message | null>(null);

//   // Auto scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, replyingTo]);

//   const handleSend = (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if(!input.trim()) return;
    
//     const newMessage: Message = { 
//       id: Date.now(), 
//       text: input, 
//       sender: "user", 
//       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       replyTo: replyingTo ? {
//         text: replyingTo.text,
//         senderName: replyingTo.sender === 'admin' ? 'Admin' : 'Anda'
//       } : null
//     };

//     setMessages((prev) => [...prev, newMessage]);
//     setInput("");
//     setReplyingTo(null);

//     // Simulasi Balasan Admin
//     setTimeout(() => {
//         setMessages((prev) => [...prev, {
//             id: Date.now() + 1,
//             text: "Terima kasih, admin akan segera membalas.",
//             sender: "admin",
//             time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//         }]);
//     }, 1500);
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative border-x border-gray-100">
      
//       {/* === HEADER (THEME: BLUE) === */}
//       <div className="bg-blue-600 text-white p-4 flex items-center gap-3 shadow-sm z-20">
//         <button onClick={() => router.back()} className="hover:bg-white/20 rounded-full p-1 transition">
//             <ArrowLeft className="w-6 h-6" />
//         </button>
//         <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm">
//             CS
//         </div>
//         <div className="flex-1">
//             <h1 className="font-bold leading-tight">Admin MiniStay</h1>
//             <p className="text-xs text-blue-100 opacity-90 flex items-center gap-1">● Online</p>
//         </div>
//       </div>

//       {/* === AREA PESAN === */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
//         {/* Info Context (Jika ada) */}
//         {roomContext && (
//              <div className="flex justify-center mb-6 sticky top-0 z-10">
//                 <div className="bg-blue-50 text-blue-800 text-xs px-3 py-1.5 rounded-full shadow-sm border border-blue-100 backdrop-blur-sm opacity-90">
//                     Bertanya tentang: <b>{roomContext}</b>
//                 </div>
//             </div>
//         )}

//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
//           >
//             {/* BUBBLE CHAT */}
//             <div className={`relative max-w-[85%] rounded-2xl p-1 group transition-all ${
//                 msg.sender === "user" 
//                 ? "bg-blue-600 text-white rounded-br-none" // User: Biru
//                 : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm" // Admin: Putih
//             }`}>
              
//               {/* --- SECTION: QUOTED REPLY --- */}
//               {msg.replyTo && (
//                 <div className={`rounded-lg p-2 mb-1 text-xs cursor-pointer border-l-2 ${
//                     msg.sender === "user"
//                     ? "bg-white/10 border-white/50 text-blue-50" // Style Reply dalam Bubble Biru
//                     : "bg-gray-50 border-blue-500 text-gray-500" // Style Reply dalam Bubble Putih
//                 }`}>
//                     <p className="font-bold mb-0.5 opacity-90">{msg.replyTo.senderName}</p>
//                     <p className="line-clamp-1 truncate opacity-80">{msg.replyTo.text}</p>
//                 </div>
//               )}

//               {/* ISI PESAN */}
//               <div className="px-3 pt-1 pb-1 text-sm leading-relaxed">
//                  {msg.text}
//               </div>

//               {/* Timestamp */}
//               <div className={`flex items-center justify-end gap-1 px-2 pb-1 text-[10px] ${
//                   msg.sender === "user" ? "text-blue-100" : "text-gray-400"
//               }`}>
//                  {msg.time}
//               </div>

//               {/* TOMBOL REPLY (Hover) */}
//               <button 
//                 onClick={() => setReplyingTo(msg)}
//                 className={`absolute top-2 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ${
//                     msg.sender === 'user' ? '-left-10' : '-right-10'
//                 }`}
//               >
//                  <div className="bg-gray-200 text-gray-600 p-1.5 rounded-full shadow-sm hover:bg-blue-100 hover:text-blue-600">
//                     <Reply className="w-4 h-4" />
//                  </div>
//               </button>

//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* === INPUT AREA === */}
//       <div className="bg-white px-4 py-3 border-t border-gray-100">
        
//         {/* --- PREVIEW REPLY --- */}
//         {replyingTo && (
//             <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded-lg border-l-4 border-blue-600 animate-in slide-in-from-bottom-2">
//                 <div className="flex-1 min-w-0 ml-2">
//                     <p className="text-xs font-bold text-blue-600">
//                         Membalas {replyingTo.sender === 'admin' ? 'Admin' : 'Anda'}
//                     </p>
//                     <p className="text-xs text-gray-500 truncate">
//                         {replyingTo.text}
//                     </p>
//                 </div>
//                 <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full">
//                     <X className="w-4 h-4 text-gray-400" />
//                 </button>
//             </div>
//         )}

//         {/* INPUT BAR */}
//         <div className="flex gap-2">
//             <input 
//                 type="text"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//                 placeholder="Ketik pesan..."
//                 className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
//             />
            
//             <button 
//                 onClick={() => handleSend()}
//                 disabled={!input.trim()}
//                 className={`p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center ${
//                     input.trim() 
//                     ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200" 
//                     : "bg-gray-200 text-gray-400"
//                 }`}
//             >
//                 <Send className="w-5 h-5 ml-0.5" />
//             </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function ChatPage() {
//   return (
//     <Suspense fallback={<div className="p-4 text-center text-gray-500">Loading chat...</div>}>
//       <ChatContent />
//     </Suspense>
//   );
// }