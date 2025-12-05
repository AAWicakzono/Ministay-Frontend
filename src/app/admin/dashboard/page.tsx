"use client";

import { useEffect, useState } from "react";
import { BedDouble, Calendar, Wallet, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { rooms as staticRooms } from "@/lib/data"; // Fallback data

export default function DashboardPage() {
  // State untuk Statistik
  const [stats, setStats] = useState({
    occupied: 0,
    totalRooms: 0,
    activeBookings: 0,
    revenue: 0,
    occupancyRate: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. AMBIL DATA DARI LOCAL STORAGE (Prioritas Utama)
    const storedBookings = JSON.parse(localStorage.getItem("ministay_bookings") || "[]");
    
    // Logic Kamar: Cek local dulu, jika kosong pakai static (9 kamar), DAN SIMPAN ke local agar sinkron
    let currentRooms = [];
    const storedRooms = localStorage.getItem("ministay_rooms");
    
    if (storedRooms) {
      currentRooms = JSON.parse(storedRooms);
    } else {
      currentRooms = staticRooms;
      localStorage.setItem("ministay_rooms", JSON.stringify(staticRooms)); // Inisialisasi data awal ke storage
    }

    // 2. HITUNG STATUS REAL-TIME (Berdasarkan Tanggal Hari Ini)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let occupiedCount = 0;

    // Cek setiap kamar, apakah hari ini sedang dibooking?
    currentRooms.forEach((room: any) => {
        const isBooked = storedBookings.some((b: any) => {
            if (b.roomId !== room.id || b.status === 'cancelled') return false;
            const start = new Date(b.checkIn);
            const end = new Date(b.checkOut);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            // Occupied jika: Start <= Hari Ini < End
            return today >= start && today < end;
        });
        if (isBooked) occupiedCount++;
    });

    const activeBookings = storedBookings.filter((b: any) => b.status === 'confirmed').length;
    
    // Hitung Total Pendapatan
    const totalRevenue = storedBookings
        .filter((b: any) => b.status === 'confirmed')
        .reduce((acc: number, curr: any) => acc + curr.totalPrice, 0);

    const totalRooms = currentRooms.length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

    setStats({
      occupied: occupiedCount,
      totalRooms,
      activeBookings,
      revenue: totalRevenue,
      occupancyRate
    });

    // 3. Olah Data Grafik
    const daysMap = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const newChartData = [
       { name: 'Sen', total: 0 }, { name: 'Sel', total: 0 }, { name: 'Rab', total: 0 },
       { name: 'Kam', total: 0 }, { name: 'Jum', total: 0 }, { name: 'Sab', total: 0 }, { name: 'Min', total: 0 }
    ];

    storedBookings.forEach((b: any) => {
        if (b.status === 'confirmed') {
            const date = new Date(b.checkIn);
            const dayIndex = date.getDay();
            const dayName = daysMap[dayIndex];
            const chartItem = newChartData.find(d => d.name === dayName);
            if (chartItem) chartItem.total += b.totalPrice;
        }
    });

    setChartData(newChartData);

  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Pantau performa bisnis kos Anda secara real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BedDouble size={20}/></div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${stats.occupied > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {stats.occupied > 0 ? 'Aktif' : 'Sepi'}
                </span>
            </div>
            <p className="text-gray-500 text-sm">Kamar Terisi (Hari Ini)</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.occupied} / {stats.totalRooms}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeBookings}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Wallet size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Total Pendapatan</p>
            <h3 className="text-2xl font-bold text-gray-900">Rp {stats.revenue.toLocaleString("id-ID")}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Tingkat Okupansi</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
        <h3 className="font-bold text-gray-900 mb-6">Grafik Pendapatan</h3>
        <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `Rp${value/1000}k`} />
                <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Pendapatan"]}
                />
                <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}