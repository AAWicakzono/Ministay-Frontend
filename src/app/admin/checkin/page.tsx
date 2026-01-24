"use client";

import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/lib/axios";

export default function AdminCheckin() {
  const [message, setMessage] = useState("");

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          const res = await api.post("/admin/checkin", { booking_code: decodedText });
          setMessage(res.data.message);
        } catch (err: any) {
          setMessage(err.response?.data?.message || "Check-in gagal");
        } finally {
          scanner.clear(); // stop scanning
        }
      },
      (errorMessage) => {
        // ignore scan failures per frame
      }
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Check-in</h1>
      <div id="reader" className="w-full max-w-md mx-auto mb-4"></div>
      <button
        onClick={startScanner}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg"
      >
        Mulai Scan QR
      </button>
      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </div>
  );
}
