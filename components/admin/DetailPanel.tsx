import { ArrowLeft, X } from 'lucide-react';

export default function DetailPanel({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <aside aria-label={title} className="fixed inset-0 z-[60] overflow-y-auto bg-white lg:static lg:z-auto lg:rounded-2xl lg:border lg:border-slate-100 lg:shadow-sm">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-100 bg-white px-3 py-2">
        <button type="button" onClick={onClose} aria-label="Close details" className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500">
          <ArrowLeft className="h-5 w-5 lg:hidden" /><X className="hidden h-5 w-5 lg:block" />
        </button>
        <h2 className="text-sm font-semibold text-[#0b1a4a]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </aside>
  );
}
