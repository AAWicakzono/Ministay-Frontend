"use client";

import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import api from "@/lib/axios";

interface Booking {
  id: string;
  guestName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'pending_payment' | 'paid' | 'cancelled' | 'completed';
}
interface BookingApiResponse {
  id: number;
  status: Booking['status'];
  total_price: number;
  check_in_date: string;
  check_out_date: string;
  user: {
    name: string;
  };
  room: {
    name: string;
  };
}


export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { showToast } = useNotification();

  
  

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await api.get<BookingApiResponse[]>('/admin/bookings');

      const mapped: Booking[] = data.map((b) => ({
        id: b.id.toString(),
        guestName: b.user?.name ?? "-",
        roomName: b.room?.name ?? "-",
        checkIn: new Date(b.check_in_date).toLocaleDateString("id-ID"),
        checkOut: new Date(b.check_out_date).toLocaleDateString("id-ID"),
        totalPrice: b.total_price,
        status: b.status,
      }));

      setBookings(mapped);
    } catch {
      showToast("Gagal mengambil data booking", "error");
    }
  }, [showToast]);

  const markPaid = async (id: string) => {
    try {
      await api.post(`/admin/bookings/${id}/paid`);
      showToast("Booking di terima", 'success');
      fetchBookings();
    } catch {
      showToast("Gagal menerima booking", "error");
    }
  };
  const cancelBooking = async (id: string) => {
    try {
      await api.put(`/admin/bookings/${id}/cancel`);
      showToast("Booking dibatalkan", "success");
      fetchBookings();
    } catch {
      showToast("Gagal membatalkan booking", "error");
    }
  };


  useEffect(() => {
    fetchBookings()
  }, [fetchBookings]);



  const filteredBookings = bookings.filter((item) => {
    const matchesStatus = filter === "all" ? true : item.status === filter;
    const matchesSearch =
      item.guestName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.includes(search) ||
      item.roomName.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Booking['status']) => {
    const map = {
      pending_payment: "bg-yellow-100 text-yellow-700",
      paid: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      completed: "bg-gray-100 text-gray-700",
    };
    return `px-2 py-1 rounded-full border text-xs font-bold uppercase ${map[status]}`;
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Booking Masuk</h1>
          <p className="text-sm text-gray-500">Verifikasi pembayaran transfer manual</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            className="pl-9 pr-4 py-2 border rounded-xl text-sm"
            placeholder="Cari booking..."
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
            <tr>
              <th className="p-4">Tamu</th>
              <th className="p-4">Jadwal</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id} className="border-t">
                <td className="p-4">
                  <p className="font-bold">{b.guestName}</p>
                  <p className="text-xs text-gray-500">{b.roomName}</p>
                </td>
                <td className="p-4 text-xs">
                  IN {b.checkIn}<br/>OUT {b.checkOut}
                </td>
                <td className="p-4 font-bold">
                  Rp {b.totalPrice.toLocaleString("id-ID")}
                </td>
                <td className="p-4">
                  <span className={getStatusBadge(b.status)}>
                    {b.status.replace('_',' ')}
                  </span>
                </td>
                <td className="p-4 text-center space-x-2">
                  {b.status === "pending_payment" && (
                    <>
                      <button
                        onClick={() => markPaid(b.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
