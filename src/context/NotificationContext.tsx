"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X, Trash2, LogOut } from "lucide-react"; // Import icon

// Tipe Notifikasi
type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationContextType {
  showToast: (message: string, type?: NotificationType) => void;
  showPopup: (title: string, message: string, type?: NotificationType, onConfirm?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  
  // STATE TOAST (Kecil, Melayang)
  const [toast, setToast] = useState<{ message: string; type: NotificationType } | null>(null);
  
  // STATE POPUP (Besar, Tengah Layar)
  const [popup, setPopup] = useState<{ 
    title: string; 
    message: string; 
    type: NotificationType; 
    onConfirm?: () => void; 
  } | null>(null);

  const showToast = (message: string, type: NotificationType = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Hilang otomatis 3 detik
  };

  const showPopup = (title: string, message: string, type: NotificationType = "info", onConfirm?: () => void) => {
    setPopup({ title, message, type, onConfirm });
  };

  const closePopup = () => setPopup(null);

  // Helper untuk Warna & Icon Popup
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

      {/* === TOAST COMPONENT (Pojok Kanan Atas) === */}
      {toast && (
        <div className="fixed top-6 right-6 z-100 animate-in slide-in-from-right-5 fade-in duration-300">
          <div className="bg-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100 min-w-[300px]">
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-green-100 text-green-600' : toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {toast.type === 'success' ? <CheckCircle size={16}/> : toast.type === 'error' ? <XCircle size={16}/> : <Info size={16}/>}
            </div>
            <p className="text-sm font-medium text-gray-700">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={14}/></button>
          </div>
        </div>
      )}

      {/* === POPUP MODAL (Tengah Layar - Gaya Referensi) === */}
      {popup && style && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200 p-8 text-center relative">
            
            {/* Icon Besar dengan Ring */}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-white border-[6px] border-white shadow-sm ring-[8px] ${style.ring}`}>
                {style.icon}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">{popup.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2">{popup.message}</p>

            <div className="flex gap-3 justify-center">
                {popup.onConfirm && (
                    <button 
                        onClick={closePopup}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                    >
                        Batal
                    </button>
                )}
                
                <button 
                    onClick={() => {
                        if (popup.onConfirm) popup.onConfirm();
                        closePopup();
                    }}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-md transition transform active:scale-95 ${style.btn}`}
                >
                    {popup.onConfirm ? "Ya, Lanjutkan" : "Tutup"}
                </button>
            </div>
          </div>
        </div>
      )}

    </NotificationContext.Provider>
  );
};