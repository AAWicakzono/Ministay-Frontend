import RoomDetailView from "@/components/RoomDetailView";

// Perhatikan tipe datanya sekarang pakai Promise
export default async function RoomDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <RoomDetailView roomId={Number(id)} isModal={false} />
    </main>
  );
  
}