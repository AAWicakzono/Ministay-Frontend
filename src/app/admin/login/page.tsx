import LoginForm from "@/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Ministay<span className="text-blue-600">Admin</span></h1>
        <p className="text-gray-400 text-sm">Sistem Manajemen Kost & Penginapan</p>
      </div>
      
      <LoginForm/>
      
      <p className="mt-8 text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Ministay Corp. Restricted Access.
      </p>
    </main>
  );
}