"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Star, UserCircle, X } from "lucide-react";
import { Room } from "@/types";
import api from "@/lib/axios";
import { useNotification } from "@/context/NotificationContext";

interface Booking {
  id: number;
  room: Room;
  guestName: string;
  status: string;
  isReviewed: boolean;
}

export default function ReviewsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const { showToast, showPopup } = useNotification();

  // Load bookings completed
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get("/bookings/me");
        const mapped: Booking[] = res.data
          .filter((b: any) => b.status === "completed")
          .map((b: any) => ({
            id: b.id,
            room: b.room,
            guestName: b.user?.name || "Anda",
            status: b.status,
            isReviewed: b.reviews?.some((r: any) => r.user.id === b.user_id) || false,
          }));
        setBookings(mapped);
      } catch (err: any) {
        console.error(err);
        showToast("Gagal memuat booking", "error");
      }
    };
    fetchBookings();
  }, []);

  const handleStartReview = (b: Booking) => {
    setReviewBooking(b);
    setRating(5);
    setHoverRating(0);
    setComment("");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;

    try {
      await api.post("/ratings", {
        booking_id: reviewBooking.id,
        rating: Number(rating),
        comment: comment || "",
      });

      const updated = bookings.map(b =>
        b.id === reviewBooking.id ? { ...b, isReviewed: true } : b
      );
      setBookings(updated);

      showPopup("Ulasan Terkirim", "Terima kasih atas feedback Anda!", "success");
      setReviewBooking(null);
      setRating(5);
      setHoverRating(0);
      setComment("");
    } catch (err: any) {
      console.error(err);
      showToast("Gagal mengirim ulasan", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6 pt-8">
        <h1 className="font-bold text-3xl text-gray-900 mb-6">Beri Ulasan</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-500 mb-2">Belum ada booking selesai untuk diberi ulasan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                      <UserCircle className="w-6 h-6"/>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{b.room.name}</p>
                      <p className="text-sm text-gray-500">{b.guestName}</p>
                    </div>
                  </div>
                  {!b.isReviewed ? (
                    <button
                      onClick={() => handleStartReview(b)}
                      className="text-blue-600 font-bold hover:underline transition"
                    >
                      Tulis Ulasan
                    </button>
                  ) : (
                    <span className="text-green-600 font-medium">★ Ulasan Terkirim</span>
                  )}
                </div>
                <div className="text-gray-500 text-sm">Status: <span className="font-semibold">{b.status}</span></div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL REVIEW */}
        {reviewBooking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
              <button
                onClick={() => setReviewBooking(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5"/>
              </button>
              <h3 className="font-bold text-lg mb-4">Tulis Ulasan: {reviewBooking.room.name}</h3>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition transform ${
                        star <= (hoverRating || rating) ? "text-yellow-400 scale-110" : "text-gray-300"
                      }`}
                    >
                      <Star className="w-6 h-6"/>
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  placeholder="Ceritakan pengalamanmu..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 resize-none h-28 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow"
                >
                  Kirim Ulasan
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
