"use client";

import { useEffect, useState } from "react";
import { BedDouble, Calendar, Wallet, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { rooms as staticRooms } from "@/lib/data"; // Data default jika kosong

export default function DashboardPage() {
  // State untuk Statistik
  const [stats, setStats] = useState({
    occupied: 0,
    totalRooms: 0,
    activeBookings: 0,
    revenue: 0,
    occupancyRate: 0
  });

  // State untuk Grafik (Senin - Minggu)
  const [chartData, setChartData] = useState([
    { name: 'Sen', total: 0 },
    { name: 'Sel', total: 0 },
    { name: 'Rab', total: 0 },
    { name: 'Kam', total: 0 },
    { name: 'Jum', total: 0 },
    { name: 'Sab', total: 0 },
    { name: 'Min', total: 0 },
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Ambil Data dari LocalStorage
    const storedBookings = JSON.parse(localStorage.getItem("ministay_bookings") || "[]");
    const storedRooms = JSON.parse(localStorage.getItem("ministay_rooms") || "[]");

    // Fallback ke data statis jika local kosong (baru pertama buka)
    const currentRooms = storedRooms.length > 0 ? storedRooms : staticRooms;

    // 2. Hitung Statistik Kartu
    const totalRooms = currentRooms.length;
    const occupied = currentRooms.filter((r: any) => r.status === 'occupied').length;
    const activeBookings = storedBookings.filter((b: any) => b.status === 'confirmed' || b.status === 'pending').length;
    
    // Hitung Total Pendapatan (Semua booking confirmed)
    const totalRevenue = storedBookings
        .filter((b: any) => b.status === 'confirmed')
        .reduce((acc: number, curr: any) => acc + curr.totalPrice, 0);

    const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    setStats({
      occupied,
      totalRooms,
      activeBookings,
      revenue: totalRevenue,
      occupancyRate
    });

    // 3. Olah Data untuk Grafik (Pendapatan berdasarkan Hari Check-in)
    const daysMap = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const newChartData = [
       { name: 'Sen', total: 0 }, { name: 'Sel', total: 0 }, { name: 'Rab', total: 0 },
       { name: 'Kam', total: 0 }, { name: 'Jum', total: 0 }, { name: 'Sab', total: 0 }, { name: 'Min', total: 0 }
    ];

    storedBookings.forEach((b: any) => {
        if (b.status === 'confirmed') {
            const date = new Date(b.checkIn);
            const dayIndex = date.getDay(); // 0 = Minggu, 1 = Senin
            const dayName = daysMap[dayIndex];

            // Tambahkan pendapatan ke hari yang sesuai
            const chartItem = newChartData.find(d => d.name === dayName);
            if (chartItem) {
                chartItem.total += b.totalPrice;
            }
        }
    });

    setChartData(newChartData);

  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Pantau performa bisnis kos Anda secara real-time.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Kamar Terisi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BedDouble size={20}/></div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${stats.occupied > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {stats.occupied > 0 ? 'Aktif' : 'Sepi'}
                </span>
            </div>
            <p className="text-gray-500 text-sm">Kamar Terisi</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.occupied} / {stats.totalRooms}</h3>
        </div>

        {/* Card 2: Booking Aktif */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Total Booking</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeBookings} Tamu</h3>
        </div>

        {/* Card 3: Pendapatan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Wallet size={20}/></div>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">+100%</span>
            </div>
            <p className="text-gray-500 text-sm">Total Pendapatan</p>
            <h3 className="text-2xl font-bold text-gray-900">Rp {stats.revenue.toLocaleString("id-ID")}</h3>
        </div>

        {/* Card 4: Okupansi */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Tingkat Okupansi</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</h3>
        </div>
      </div>

      {/* Grafik Pendapatan */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
        <h3 className="font-bold text-gray-900 mb-6">Grafik Pendapatan (Berdasarkan Hari Check-In)</h3>
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