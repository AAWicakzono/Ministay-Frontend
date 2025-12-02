// src/app/admin/dashboard/page.tsx
"use client";

import { BedDouble, Calendar, Wallet, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Data Mock Grafik
const data = [
  { name: 'Sen', total: 400000 },
  { name: 'Sel', total: 300000 },
  { name: 'Rab', total: 200000 },
  { name: 'Kam', total: 278000 },
  { name: 'Jum', total: 189000 },
  { name: 'Sab', total: 530000 }, // Weekend rame
  { name: 'Min', total: 450000 },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Selamat datang kembali, Admin!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BedDouble size={20}/></div>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">+2.5%</span>
            </div>
            <p className="text-gray-500 text-sm">Kamar Terisi</p>
            <h3 className="text-2xl font-bold text-gray-900">4 / 6</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Calendar size={20}/></div>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">+12%</span>
            </div>
            <p className="text-gray-500 text-sm">Booking Aktif</p>
            <h3 className="text-2xl font-bold text-gray-900">8 Tamu</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Wallet size={20}/></div>
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">+5%</span>
            </div>
            <p className="text-gray-500 text-sm">Pendapatan Minggu Ini</p>
            <h3 className="text-2xl font-bold text-gray-900">Rp 2.450.000</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><TrendingUp size={20}/></div>
            </div>
            <p className="text-gray-500 text-sm">Okupansi</p>
            <h3 className="text-2xl font-bold text-gray-900">67%</h3>
        </div>
      </div>

      {/* Grafik Pendapatan */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
        <h3 className="font-bold text-gray-900 mb-6">Analitik Pendapatan</h3>
        <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `Rp${value/1000}k`} />
                <Tooltip 
                    cursor={{fill: '#F3F4F6'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

