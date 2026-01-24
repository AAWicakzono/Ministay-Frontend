"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar, ChevronDown
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import api from "@/lib/axios";

interface ChartItem {
  label: string;
  income: number;
}

interface TopRoom {
  room_id: number;
  total_bookings: number;
  room: { name: string };
}


type Period = "weekly-chart" | "monthly-chart" | "yearly-chart";

export default function ReportPage() {
  const [period, setPeriod] = useState<Period>("weekly-chart");
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [topRooms, setTopRooms] = useState<TopRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("2026-W03");
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [draftPeriod, setDraftPeriod] = useState<Period>(period);
  const pickerRef = useRef<HTMLDivElement>(null);

  const fetchChart = useCallback(async () => {
    setLoading(true);
    try {
      let res;

      if (period === "weekly-chart") {
        const [year, week] = selectedWeek.split("-W");
        const start = new Date(`${year}-01-01`);
        start.setDate(start.getDate() + (Number(week) - 1) * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        res = await api.get<ChartItem[]>("/admin/reports/weekly-chart", {
          params: { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) },
        });
      } else if (period === "monthly-chart") {
        res = await api.get<ChartItem[]>("/admin/reports/monthly-chart", {
          params: { month: selectedMonth },
        });
      } else {
        res = await api.get<ChartItem[]>("/admin/reports/yearly-chart", {
          params: { year: selectedYear },
        });
      }

      setChartData(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [period, selectedWeek, selectedMonth, selectedYear]);

  const fetchTopRooms = useCallback(async () => {
    const res = await api.get("/admin/reports/top-rooms");
    setTopRooms(res.data);
  }, []);


  useEffect(() => { fetchChart(); }, [fetchChart]);
  useEffect(() => { fetchTopRooms(); }, [fetchTopRooms]);


  const handleApplyFilter = () => {
    setPeriod(draftPeriod);
    setShowPeriodPicker(false);
  };

  const totalRevenue = chartData.reduce((sum, item) => sum + item.income, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pendapatan</h1>
          <p className="text-sm text-gray-500">
            Ringkasan pemasukan & performa kamar
          </p>
        </div>
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setShowPeriodPicker(!showPeriodPicker)}
            className="border px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 bg-white"
          >
            <Calendar className="w-4 h-4" /> Periode <ChevronDown className="w-3 h-3"/>
          </button>

          {showPeriodPicker && (
            <div className="absolute top-12 right-0 bg-white shadow-xl rounded-2xl border p-4 w-[320px] z-50">
              <div className="flex gap-2 mb-4">
                {(['weekly-chart', 'monthly-chart', 'yearly-chart'] as Period[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDraftPeriod(tab)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg ${draftPeriod === tab ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
                  >
                    {tab === 'weekly-chart' ? 'Mingguan' : tab === 'monthly-chart' ? 'Bulanan' : 'Tahunan'}
                  </button>
                ))}
              </div>

              {draftPeriod === 'weekly-chart' && (
                <input type="week" value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} className="w-full border p-2 rounded-lg" />
              )}
              {draftPeriod === 'monthly-chart' && (
                <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full border p-2 rounded-lg" />
              )}
              {draftPeriod === 'yearly-chart' && (
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="w-full border p-2 rounded-lg">
                  {[2024, 2025, 2026].map(y => (<option key={y} value={y}>{y}</option>))}
                </select>
              )}

              <button onClick={handleApplyFilter} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-bold">
                Terapkan
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TOTAL PENDAPATAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border">
          <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
          <h3 className="text-3xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</h3>
        </div>
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-2xl border">
        <h3 className="font-bold mb-4">Grafik Pendapatan</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopOpacity={0.2} />
                  <stop offset="95%" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#2563EB" strokeWidth={3} fill="url(#income)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {loading && <p className="text-sm text-gray-400 mt-2">Memuat data...</p>}
      </div>

      {/* TOP ROOMS */}
      <div className="bg-white border rounded-2xl">
        <div className="p-4 border-b"><h2 className="font-bold">Kamar Terpopuler</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr><th className="p-4 text-left">Kamar</th><th className="p-4 text-right">Total Booking</th></tr>
          </thead>
          <tbody>
            {topRooms.map(r => (
              <tr key={r.room_id} className="border-t">
                <td className="p-4">{r.room.name}</td>
                <td className="p-4 text-right font-bold">{r.total_bookings}</td>
              </tr>
            ))}
            {topRooms.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-gray-400">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
