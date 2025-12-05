"use client";

import Navbar from "@/components/Navbar";
import InboxView from "@/components/InboxView";
import { Suspense } from "react";

export default function InboxPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-4 md:p-8 h-[calc(100vh-64px)]">
         <div className="h-full max-w-6xl mx-auto rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <Suspense fallback={<div>Loading Inbox...</div>}>
                <InboxView isModal={false} />
            </Suspense>
         </div>
      </div>
    </div>
  );
}