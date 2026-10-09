export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 text-3xl">⚡</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">You are offline</h1>
      <p className="text-sm text-gray-400 mb-6">Check your connection and try again.</p>
      <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium">Retry</button>
    </div>
  );
}
