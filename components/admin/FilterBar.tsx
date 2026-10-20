import { Search } from 'lucide-react';

export const selectClass = 'h-11 rounded-xl border border-blue-100 bg-white px-3 text-sm text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

export default function FilterBar({ search, onSearch, placeholder = 'Search...', children }: { search: string; onSearch: (v: string) => void; placeholder?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
        <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        <input value={search} onChange={(e) => onSearch(e.target.value)} placeholder={placeholder} aria-label={placeholder}
          className="h-11 w-full rounded-xl border border-blue-100 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500" />
      </div>
      {children}
    </div>
  );
}
