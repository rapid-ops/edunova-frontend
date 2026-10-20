import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500"><AlertTriangle className="h-6 w-6" /></span>
      <p className="text-sm text-slate-600">{message}</p>
      {onRetry && <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-lg border border-blue-200 px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">Try again</button>}
    </div>
  );
}
