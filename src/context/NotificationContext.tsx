"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationContextType {
  showToast: (message: string, type?: NotificationType) => void;
  // UPDATE: message sekarang bisa menerima ReactNode (Teks atau Komponen)
  showPopup: (title: string, message: ReactNode, type?: NotificationType, onConfirm?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  
  const [toast, setToast] = useState<{ message: string; type: NotificationType } | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [popup, setPopup] = useState<{ 
    title: string; 
    message: ReactNode; // UPDATE TIPE DATA
    type: NotificationType; 
    onConfirm?: () => void; 
  } | null>(null);

  const showToast = (message: string, type: NotificationType = "info") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    setIsExiting(false);
    setToast({ message, type });

    timerRef.current = setTimeout(() => {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setToast(null);
        setIsExiting(false);
      }, 800);
    }, 2000);
  };

  const showPopup = (title: string, message: ReactNode, type: NotificationType = "info", onConfirm?: () => void) => {
    setPopup({ title, message, type, onConfirm });
  };

  const closePopup = () => setPopup(null);

  const getPopupStyle = (type: NotificationType) => {
    switch (type) {
      case "success": return { icon: <CheckCircle className="w-12 h-12 text-green-500" />, ring: "ring-green-100", btn: "bg-green-600 hover:bg-green-700" };
      case "error": return { icon: <XCircle className="w-12 h-12 text-red-500" />, ring: "ring-red-100", btn: "bg-red-600 hover:bg-red-700" };
      case "warning": return { icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />, ring: "ring-yellow-100", btn: "bg-yellow-600 hover:bg-yellow-700" };
      default: return { icon: <Info className="w-12 h-12 text-blue-500" />, ring: "ring-blue-100", btn: "bg-blue-600 hover:bg-blue-700" };
    }
  };

  const style = popup ? getPopupStyle(popup.type) : null;

  return (
    <NotificationContext.Provider value={{ showToast, showPopup }}>
      {children}

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-100 transition-all
            ${isExiting 
                ? "animate-out slide-out-to-top-10 fade-out duration-800 ease-in"
                : "animate-in slide-in-from-top-10 fade-in duration-800 ease-out"
            }
        `}>
          <div className="bg-white shadow-2xl rounded-xl px-6 py-4 flex items-center gap-4 border border-gray-100 min-w-[320px]">
            <div className={`p-2 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-green-100 text-green-600' : toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {toast.type === 'success' ? <CheckCircle size={20}/> : toast.type === 'error' ? <XCircle size={20}/> : <Info size={20}/>}
            </div>
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 capitalize">{toast.type}</p>
                <p className="text-sm text-gray-600 leading-tight">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-300 hover:text-gray-500 transition"><X size={16}/></button>
          </div>
        </div>
      )}

      {/* POPUP */}
      {popup && style && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-300 p-8 text-center relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-white border-[6px] border-white shadow-sm ring-8 ${style.ring}`}>
                {style.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{popup.title}</h3>
            
            {/* RENDER MESSAGE SEBAGAI COMPONENT (Bisa Teks / HTML / ReactNode) */}
            <div className="text-gray-500 text-sm leading-relaxed mb-8 px-2">
                {popup.message}
            </div>

            <div className="flex gap-3 justify-center">
                {popup.onConfirm && popup.type !== 'success' && (
                    <button onClick={closePopup} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Batal</button>
                )}
                <button 
                    onClick={() => { if (popup.onConfirm) popup.onConfirm(); closePopup(); }}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-md transition transform active:scale-95 ${style.btn}`}
                >
                    {popup.onConfirm ? (popup.type === 'success' ? "Lanjutkan" : "Ya, Lanjutkan") : "Tutup"}
                </button>
            </div>
          </div>
        </div>
      )}

    </NotificationContext.Provider>
  );
};