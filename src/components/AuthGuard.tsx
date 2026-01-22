"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNotification } from "@/context/NotificationContext"; // 1. Import

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // 2. Panggil Hook (PERHATIKAN: Hook ini hanya bekerja jika AuthGuard ada di dalam NotificationProvider di layout.tsx)
  // Tapi karena AuthGuard dipasang DI DALAM Provider di layout.tsx, ini aman.
  const { showPopup, showToast } = useNotification(); 

  useEffect(() => {
    const storedUser = localStorage.getItem("ministay_user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const adminPaths = ["/admin"];
    const protectedPaths = ["/my-bookings", "/checkout"];
    const publicPaths = ["/", "/login", "/room", "/reviews", "/chat"];

    if (protectedPaths.some(path => pathname.startsWith(path))) {
        if (!user) {
            router.push("/login");
            return;
        }
    }

    if (pathname === "/login") {
        if (user) {
            if (user.role === "admin") router.push("/admin/dashboard");
            else router.push("/");
            return;
        }
    }

    setIsAuthorized(true);

  }, [pathname, router, showToast]);

  if (!isAuthorized) {
    return null; 
  }

  return <>{children}</>;
}