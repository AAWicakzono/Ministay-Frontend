"use client";

import { useEffect, useState } from "react";
import { BedDouble, Calendar, Wallet, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from "@/lib/axios";

export default function DashboardPage() {
  // State untuk Statistik
    const [stats, setStats] = useState<null | {
        total_rooms: number;
        occupied_rooms_today: number;
        active_bookings: number;
        revenue_today: number;
        occupancy_rate: number;
    }>(null);


    const [chartData, setChartData] = useState<
        { date: string; total: number }[]
    >([]);


  useEffect(() => {
    const fetchDashboard = async () => {
        try {
        const res = await api.get("/admin/dashboard");

        setStats(res.data.kpis);
        setChartData(res.data.revenue_chart);
        } catch (err) {
        console.error("Failed to load dashboard", err);
        }
    };

    fetchDashboard();
  }, []);

  if(!stats) {
    return <div className="p-6 text-gray-500">Memuat dashboard...</div>;
  }
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
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${stats?.occupied_rooms_today > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {stats?.occupied_rooms_today > 0 ? 'Aktif' : 'Sepi'}
                </span>
            </div>
            <p className="text-gray-500 text-sm">Kamar Terisi (Hari Ini)</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.occupied_rooms_today} / {stats?.total_rooms}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.active_bookings}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Wallet size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Total Pendapatan</p>
            <h3 className="text-2xl font-bold text-gray-900">Rp {(stats?.revenue_today ?? 0).toLocaleString("id-ID")}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Tingkat Okupansi</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.occupancy_rate}%</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
        <h3 className="font-bold text-gray-900 mb-6">Grafik Pendapatan</h3>
        <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
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