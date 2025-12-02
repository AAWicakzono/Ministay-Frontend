import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniStay",
  description: "Aplikasi Booking Kos",
};

export default function RootLayout({
  children,
  modal, // <--- PASTIKAN ADA INI
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode; // <--- PASTIKAN ADA INI
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
        {modal} {/* <--- JANGAN LUPA RENDER DI SINI */}
      </body>
    </html>
  );
}

// import type { Metadata } from "next";
// import "./globals.css"; 

// export const metadata: Metadata = {
//   title: "MiniStay - Booking Kos Harian",
//   description: "Aplikasi pemesanan kos harian mudah dan cepat",
// };

// export default function RootLayout({
//   children,
//   modal,
// }: Readonly<{
//   children: React.ReactNode;
//   modal: React.ReactNode;
// }>) {
//   return (
//     <html lang="id">
//       <body className="antialiased bg-gray-50 text-gray-900">
//         {children}
//         {modal}
//       </body>
//     </html>
//   );
// }