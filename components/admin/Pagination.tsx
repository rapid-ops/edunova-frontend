import { ChevronLeft, ChevronRight } from 'lucide-react';

const btn = 'flex h-11 min-w-11 items-center justify-center rounded-lg text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-9 sm:min-w-9';

export default function Pagination({ page, pageSize, total, onPage, noun = 'items' }: { page: number; pageSize: number; total: number; onPage: (p: number) => void; noun?: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const nums: (number | '...')[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== '...') nums.push('...');
  }
  return (
    <div className="flex flex-col items-center justify-between gap-3 px-2 py-3 sm:flex-row">
      <p className="text-xs text-slate-500">Showing {from}-{to} of {total} {noun}</p>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className={`${btn} text-slate-500 disabled:text-slate-300`}><ChevronLeft className="h-4 w-4" /></button>
        {nums.map((n, i) => n === '...'
          ? <span key={`e${i}`} className="px-1 text-slate-400">...</span>
          : <button key={n} type="button" onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined} className={`${btn} ${n === page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'}`}>{n}</button>)}
        <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className={`${btn} text-slate-500 disabled:text-slate-300`}><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
