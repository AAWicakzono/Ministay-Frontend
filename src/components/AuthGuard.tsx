"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Ambil data user
    const storedUser = localStorage.getItem("ministay_user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    // 2. Daftar Halaman
    const adminPaths = ["/admin"]; // Semua di bawah /admin
    const protectedPaths = ["/my-bookings", "/checkout"]; // Butuh login user biasa
    const publicPaths = ["/", "/login", "/room", "/reviews", "/chat"]; // Bisa diakses siapa saja (Chat boleh public dulu, atau redirect di dalamnya)

    // --- LOGIKA PROTEKSI ---

    // A. Cek Halaman Admin
    if (pathname.startsWith("/admin")) {
        if (!user || user.role !== "admin") {
            alert("⚠️ Akses Ditolak: Halaman khusus Admin!");
            router.push("/login"); // Tendang ke login
            return;
        }
    }

    // B. Cek Halaman User Private (Booking, Checkout)
    if (protectedPaths.some(path => pathname.startsWith(path))) {
        if (!user) {
            // alert("Silakan login untuk melanjutkan."); // Optional, kadang mengganggu
            router.push("/login"); // Tendang ke login
            return;
        }
    }

    // C. Cek Halaman Login (Jika sudah login, jangan masuk sini lagi)
    if (pathname === "/login") {
        if (user) {
            if (user.role === "admin") router.push("/admin/dashboard");
            else router.push("/");
            return;
        }
    }

    // Jika lolos semua cek, izinkan render halaman
    setIsAuthorized(true);

  }, [pathname, router]);

  // Tampilkan loading screen sederhana saat pengecekan berlangsung
  // Agar halaman terlarang tidak sempat "berkedip" muncul
  if (!isAuthorized) {
    return null; // Atau return <div className="min-h-screen bg-white"></div>;
  }

  return <>{children}</>;
}