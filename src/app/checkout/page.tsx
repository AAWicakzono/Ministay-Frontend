import { Suspense } from "react";
import CheckoutView from "@/components/CheckoutView";

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center">Loading Checkout...</div>}>
        <CheckoutView isModal={false} />
      </Suspense>
    </main>
  );
}