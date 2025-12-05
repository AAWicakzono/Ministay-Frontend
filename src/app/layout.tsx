import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { NotificationProvider } from "@/context/NotificationContext";

export const metadata: Metadata = {
  title: "MiniStay - Booking Kos Harian",
  description: "Aplikasi pemesanan kos harian mudah dan cepat",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <body className="antialiased bg-gray-50 text-gray-900">
        <NotificationProvider>
            <AuthGuard>
                {children}
                {modal}
            </AuthGuard>
        </NotificationProvider>
      </body>
    </html>
  );
}