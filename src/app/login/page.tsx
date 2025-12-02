import LoginForm from "@/components/LoginForm";

// WAJIB ada 'export default'
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Memanggil komponen form untuk tampilan halaman penuh */}
      <LoginForm isModal={false} />
    </main>
  );
}