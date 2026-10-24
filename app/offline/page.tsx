'use client';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-500">
        <WifiOff size={28} />
      </div>
      <h1 className="mb-2 text-xl font-bold text-gray-900">You are offline</h1>
      <p className="mb-6 text-sm text-gray-400">Check your connection and try again.</p>
      <button onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white">Retry</button>
    </div>
  );
}
