"use client";

import { useState } from "react";
import { 
  Wallet, TrendingUp, TrendingDown, Calendar, 
  Download, ArrowUpRight, DollarSign, CreditCard 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA (Simulasi Data Database untuk Owner Tertentu) ---

// Data Grafik: Mingguan
const weeklyData = [
  { name: 'Sen', income: 450000 },
  { name: 'Sel', income: 300000 },
  { name: 'Rab', income: 200000 },
  { name: 'Kam', income: 500000 },
  { name: 'Jum', income: 750000 },
  { name: 'Sab', income: 1200000 }, // Weekend naik
  { name: 'Min', income: 900000 },
];

// Data Grafik: Bulanan
const monthlyData = [
  { name: 'Jan', income: 15000000 },
  { name: 'Feb', income: 12500000 },
  { name: 'Mar', income: 18000000 },
  { name: 'Apr', income: 14000000 },
  { name: 'Mei', income: 20000000 },
  { name: 'Jun', income: 22000000 },
];

// Data Riwayat Transaksi (Hanya milik Owner ini)
const transactions = [
  { id: "TRX-998", guest: "Budi Santoso", room: "Kamar Deluxe A1", date: "Hari ini, 10:30", amount: 300000, method: "QRIS", status: "success" },
  { id: "TRX-997", guest: "Siti Rahma", room: "Kamar Premium C3", date: "Kemarin, 14:20", amount: 400000, method: "Transfer Bank", status: "success" },
  { id: "TRX-996", guest: "Ahmad Rizki", room: "Kamar Standard B2", date: "28 Nov, 09:15", amount: 150000, method: "E-Wallet", status: "pending" },
  { id: "TRX-995", guest: "Joko Anwar", room: "Kamar Deluxe A1", date: "27 Nov, 20:00", amount: 300000, method: "Tunai", status: "success" },
];

export default function FinancePage() {
  const [filter, setFilter] = useState<'week' | 'month'>('week');

  // Pilih data grafik berdasarkan filter
  const chartData = filter === 'week' ? weeklyData : monthlyData;

  // Total Pendapatan (Hitung manual dari dummy data biar realistis)
  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.income, 0);

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Pendapatan</h1>
            <p className="text-gray-500 text-sm">Analisis performa bisnis kos Anda (Kos Mawar Melati)</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition">
                <Calendar className="w-4 h-4" /> Periode
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                <Download className="w-4 h-4" /> Export Laporan
            </button>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Pendapatan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} className="text-blue-600"/></div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={20}/></div>
                <p className="text-gray-500 text-sm font-medium">Total Pendapatan ({filter === 'week' ? 'Minggu Ini' : 'Tahun Ini'})</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Rp {totalRevenue.toLocaleString("id-ID")}</h3>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold">
                <TrendingUp size={14}/> +12.5% <span className="text-gray-400 font-normal">dari periode lalu</span>
            </div>
        </div>

        {/* Card 2: Rata-rata Harian */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20}/></div>
                <p className="text-gray-500 text-sm font-medium">Rata-rata Harian</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Rp {(totalRevenue / (filter === 'week' ? 7 : 12)).toLocaleString("id-ID", {maximumFractionDigits: 0})}</h3>
             <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold">
                <TrendingUp size={14}/> Stabil <span className="text-gray-400 font-normal"> minggu ini</span>
            </div>
        </div>

        {/* Card 3: Saldo Belum Cair */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><CreditCard size={20}/></div>
                <p className="text-gray-500 text-sm font-medium">Menunggu Pencairan</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Rp 450.000</h3>
            <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
                Akan cair otomatis setiap Senin
            </div>
        </div>
      </div>

      {/* --- GRAFIK ANALITIK --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Grafik Pendapatan</h3>
            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
                <button 
                    onClick={() => setFilter('week')}
                    className={`px-3 py-1 rounded-md transition ${filter === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Mingguan
                </button>
                <button 
                    onClick={() => setFilter('month')}
                    className={`px-3 py-1 rounded-md transition ${filter === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Bulanan
                </button>
            </div>
        </div>
        
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6B7280', fontSize: 12}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#6B7280', fontSize: 12}} 
                        tickFormatter={(value) => `Rp${value/1000}k`}
                    />
                    <Tooltip 
                        contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)'}}
                        formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Pendapatan"]}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#2563EB" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorIncome)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* --- TABEL TRANSAKSI TERBARU --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Transaksi Terbaru</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1">
                Lihat Semua <ArrowUpRight className="w-4 h-4"/>
            </button>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                <tr>
                    <th className="p-4 pl-6">ID Transaksi</th>
                    <th className="p-4">Tamu</th>
                    <th className="p-4">Kamar</th>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Metode</th>
                    <th className="p-4">Jumlah</th>
                    <th className="p-4 text-center">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 pl-6 font-mono text-gray-500 text-xs">{trx.id}</td>
                        <td className="p-4 font-medium text-gray-900">{trx.guest}</td>
                        <td className="p-4 text-gray-600">{trx.room}</td>
                        <td className="p-4 text-gray-500 text-xs">{trx.date}</td>
                        <td className="p-4">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                                {trx.method}
                            </span>
                        </td>
                        <td className="p-4 font-bold text-gray-900">Rp {trx.amount.toLocaleString("id-ID")}</td>
                        <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                trx.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>
                                {trx.status === 'success' ? 'Lunas' : 'Pending'}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
}