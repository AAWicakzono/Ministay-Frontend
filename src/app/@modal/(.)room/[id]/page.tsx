import RoomDetailView from "@/components/RoomDetailView";

export default async function RoomModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm p-4">
      <RoomDetailView roomId={Number(id)} isModal={true} />
    </div>
  );
}