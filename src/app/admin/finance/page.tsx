"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Wallet, TrendingUp, Calendar, 
  Download, ArrowUpRight, DollarSign, CreditCard, X, ChevronDown, Search, Filter, FileSpreadsheet, FileText 
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA ---

// 1. Data Mingguan (Output Hari: Senin - Minggu) - Menggantikan Data Harian (Jam)
const weeklyData = [
  { name: 'Senin', income: 450000 },
  { name: 'Selasa', income: 300000 },
  { name: 'Rabu', income: 200000 },
  { name: 'Kamis', income: 500000 },
  { name: 'Jumat', income: 750000 },
  { name: 'Sabtu', income: 1200000 },
  { name: 'Minggu', income: 900000 },
];

// 2. Data Bulanan (Output: Minggu 1 - 4)
const monthlyData = [
  { name: 'Minggu 1', income: 3500000 },
  { name: 'Minggu 2', income: 4200000 },
  { name: 'Minggu 3', income: 2800000 },
  { name: 'Minggu 4', income: 5100000 },
];

// 3. Data Tahunan (Output: Bulan)
const yearlyData = [
  { name: 'Jan', income: 12000000 },
  { name: 'Feb', income: 15000000 },
  { name: 'Mar', income: 11000000 },
  { name: 'Apr', income: 14000000 },
  { name: 'Mei', income: 18000000 },
  { name: 'Jun', income: 22000000 },
  { name: 'Jul', income: 21000000 },
  { name: 'Agu', income: 19000000 },
  { name: 'Sep', income: 23000000 },
  { name: 'Okt', income: 25000000 },
  { name: 'Nov', income: 20000000 },
  { name: 'Des', income: 28000000 },
];

// DATA TRANSAKSI
const allTransactions = [
  { id: "TRX-1005", guest: "Budi Santoso", room: "Kamar Deluxe A1", date: "Hari ini, 10:30", amount: 300000, method: "QRIS", status: "success" },
  { id: "TRX-1004", guest: "Siti Rahma", room: "Kamar Premium C3", date: "Kemarin, 14:20", amount: 400000, method: "Transfer Bank", status: "success" },
  { id: "TRX-1003", guest: "Ahmad Rizki", room: "Kamar Standard B2", date: "28 Nov, 09:15", amount: 150000, method: "E-Wallet", status: "pending" },
  { id: "TRX-1002", guest: "Joko Anwar", room: "Kamar Deluxe A1", date: "27 Nov, 20:00", amount: 300000, method: "Tunai", status: "success" },
  { id: "TRX-1001", guest: "Dewi Lestari", room: "Kamar Standard B1", date: "27 Nov, 18:30", amount: 150000, method: "QRIS", status: "success" },
  { id: "TRX-1000", guest: "Rina Nose", room: "Kamar Premium C2", date: "26 Nov, 12:00", amount: 400000, method: "Transfer Bank", status: "success" },
];

export default function FinancePage() {
  // State Filter Periode
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'year'>('week'); // Default Mingguan
  const [viewType, setViewType] = useState<'week' | 'month' | 'year'>('week');
  
  const [selectedWeek, setSelectedWeek] = useState("2024-W48"); // YYYY-Www
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  // UI States
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPeriodPicker(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplyFilter = () => {
    setViewType(activeTab);
    setShowPeriodPicker(false);
  };

  // Mock function untuk simulasi export
  const handleExport = (type: 'view' | 'all') => {
    setShowExportMenu(false);
    const msg = type === 'view' 
        ? `Mengekspor data grafik periode ${viewType}... (CSV)` 
        : "Mengekspor seluruh riwayat transaksi... (Excel)";
    alert(msg);
  };

  // Logika Data Grafik
  let chartData;
  let periodDisplayLabel;
  let averageLabel;
  let divisor;

  switch (viewType) {
    case 'week':
        chartData = weeklyData;
        periodDisplayLabel = `Minggu ke-${selectedWeek.split('-W')[1]} Tahun ${selectedWeek.split('-W')[0]}`;
        averageLabel = 'Rata-rata Harian';
        divisor = 7;
        break;
    case 'month':
        chartData = monthlyData;
        const [y, m] = selectedMonth.split('-');
        const dateObj = new Date(Number(y), Number(m) - 1);
        periodDisplayLabel = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        averageLabel = 'Rata-rata Mingguan';
        divisor = 4;
        break;
    case 'year':
        chartData = yearlyData;
        periodDisplayLabel = `Tahun ${selectedYear}`;
        averageLabel = 'Rata-rata Bulanan';
        divisor = 12;
        break;
  }

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.income, 0);

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
            <p className="text-gray-500 text-sm">Analisis pendapatan: <span className="font-semibold text-blue-600">{periodDisplayLabel}</span></p>
        </div>
        
        <div className="flex gap-2">
            
            {/* 1. FILTER PERIODE */}
            <div className="relative" ref={pickerRef}>
                <button 
                    onClick={() => setShowPeriodPicker(!showPeriodPicker)}
                    className={`border px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${showPeriodPicker ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <Calendar className="w-4 h-4" /> 
                    Periode
                    <ChevronDown className={`w-3 h-3 transition-transform ${showPeriodPicker ? 'rotate-180' : ''}`}/>
                </button>

                {showPeriodPicker && (
                    <div className="absolute top-12 right-0 bg-white shadow-2xl rounded-2xl border border-gray-100 p-4 w-[320px] z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-800">Pilih Periode</h3>
                            <button onClick={() => setShowPeriodPicker(false)}><X className="w-4 h-4 text-gray-400 hover:text-red-500"/></button>
                        </div>
                        {/* Tabs: Mingguan - Bulanan - Tahunan */}
                        <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                            {(['week', 'month', 'year'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab === 'week' ? 'Mingguan' : tab === 'month' ? 'Bulanan' : 'Tahunan'}
                                </button>
                            ))}
                        </div>
                        <div className="mb-4">
                            {activeTab === 'week' && (
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-medium">Pilih Minggu</label>
                                    <input type="week" value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                                </div>
                            )}
                            {activeTab === 'month' && (
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-medium">Pilih Bulan</label>
                                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"/>
                                </div>
                            )}
                            {activeTab === 'year' && (
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-medium">Pilih Tahun</label>
                                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                        {[2023, 2024, 2025, 2026].map(y => (<option key={y} value={y}>{y}</option>))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <button onClick={handleApplyFilter} className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">Terapkan Filter</button>
                    </div>
                )}
            </div>

            {/* 2. TOMBOL EXPORT (DENGAN DROPDOWN) */}
            <div className="relative" ref={exportRef}>
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                >
                    <Download className="w-4 h-4" /> Export
                </button>

                {showExportMenu && (
                    <div className="absolute top-12 right-0 bg-white shadow-xl rounded-xl border border-gray-100 w-64 z-40 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-3 border-b border-gray-50">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pilih Opsi Export</p>
                        </div>
                        <button 
                            onClick={() => handleExport('view')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition"
                        >
                            <FileText className="w-4 h-4"/>
                            <div>
                                <p className="font-semibold">Sesuai Tampilan</p>
                                <p className="text-xs text-gray-500">Data grafik {viewType === 'week' ? 'minggu' : viewType === 'month' ? 'bulan' : 'tahun'} ini</p>
                            </div>
                        </button>
                        <button 
                            onClick={() => handleExport('all')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition border-t border-gray-50"
                        >
                            <FileSpreadsheet className="w-4 h-4"/>
                            <div>
                                <p className="font-semibold">Semua Data</p>
                                <p className="text-xs text-gray-500">Laporan transaksi lengkap</p>
                            </div>
                        </button>
                    </div>
                )}
            </div>

        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} className="text-blue-600"/></div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Wallet size={20}/></div>
                <p className="text-gray-500 text-sm font-medium">Total Pendapatan</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Rp {totalRevenue.toLocaleString("id-ID")}</h3>
            <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold">
                <TrendingUp size={14}/> +12.5% <span className="text-gray-400 font-normal">vs Periode Lalu</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20}/></div>
                <p className="text-gray-500 text-sm font-medium">{averageLabel}</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Rp {(totalRevenue / divisor).toLocaleString("id-ID", {maximumFractionDigits: 0})}</h3>
             <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold">
                <TrendingUp size={14}/> Stabil <span className="text-gray-400 font-normal"> periode ini</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><CreditCard size={20}/></div>
                <p className="text-gray-500 text-sm font-medium">Menunggu Pencairan</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">Rp 450.000</h3>
            <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">Akan cair otomatis setiap Senin</div>
        </div>
      </div>

      {/* --- GRAFIK --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-gray-900 mb-6">Grafik Pendapatan</h3>
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} tickFormatter={(value) => `Rp${value/1000}k`}/>
                    <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)'}} formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Pendapatan"]}/>
                    <Area type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* --- TABEL TRANSAKSI DASHBOARD --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Transaksi Terbaru</h3>
            <button 
                onClick={() => setShowAllTransactions(true)}
                className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
            >
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
                    <th className="p-4">Jumlah</th>
                    <th className="p-4 text-center">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {allTransactions.slice(0, 5).map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 pl-6 font-mono text-gray-500 text-xs">{trx.id}</td>
                        <td className="p-4 font-medium text-gray-900">{trx.guest}</td>
                        <td className="p-4 text-gray-600">{trx.room}</td>
                        <td className="p-4 text-gray-500 text-xs">{trx.date}</td>
                        <td className="p-4 font-bold text-gray-900">Rp {trx.amount.toLocaleString("id-ID")}</td>
                        <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                trx.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>
                                {trx.status}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* --- MODAL LIHAT SEMUA TRANSAKSI --- */}
      {showAllTransactions && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Riwayat Transaksi Lengkap</h2>
                        <p className="text-sm text-gray-500">Menampilkan semua transaksi masuk</p>
                    </div>
                    <button 
                        onClick={() => setShowAllTransactions(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
                    >
                        <X className="w-6 h-6"/>
                    </button>
                </div>

                {/* Modal Toolbar */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-3 shrink-0 overflow-x-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                        <input 
                            type="text" 
                            placeholder="Cari ID, Nama Tamu..." 
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 flex items-center gap-2 hover:bg-gray-100">
                        <Filter className="w-4 h-4"/> Filter Status
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 flex items-center gap-2 hover:bg-gray-100">
                        <Download className="w-4 h-4"/> Export CSV
                    </button>
                </div>

                {/* Modal Table */}
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 pl-6 bg-gray-50">ID Transaksi</th>
                                <th className="p-4 bg-gray-50">Tamu</th>
                                <th className="p-4 bg-gray-50">Kamar</th>
                                <th className="p-4 bg-gray-50">Tanggal</th>
                                <th className="p-4 bg-gray-50">Jumlah</th>
                                <th className="p-4 bg-gray-50 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {allTransactions.map((trx) => (
                                <tr key={trx.id} className="hover:bg-blue-50 transition cursor-pointer">
                                    <td className="p-4 pl-6 font-mono text-gray-500 text-xs">{trx.id}</td>
                                    <td className="p-4 font-medium text-gray-900">{trx.guest}</td>
                                    <td className="p-4 text-gray-600">{trx.room}</td>
                                    <td className="p-4 text-gray-500 text-xs">{trx.date}</td>
                                    <td className="p-4 font-bold text-gray-900">Rp {trx.amount.toLocaleString("id-ID")}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                            trx.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}