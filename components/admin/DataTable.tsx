import type { ReactNode } from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export interface Column<T> { key: string; header: string; render?: (row: T) => ReactNode; className?: string; primary?: boolean; hideOnMobile?: boolean }

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, rows, rowKey, onRowClick, loading, emptyTitle = 'Nothing here yet', emptyMessage }: Props<T>) {
  const cell = (c: Column<T>, r: T): ReactNode => (c.render ? c.render(r) : String((r as unknown as Record<string, unknown>)[c.key] ?? '-'));
  if (loading) return <div className="space-y-3 p-4">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
  if (rows.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />;
  const primary = columns.find((c) => c.primary) || columns[0];
  const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);
  const click = (r: T) => (onRowClick ? () => onRowClick(r) : undefined);
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-slate-100 text-xs font-semibold text-[#0b1a4a]">{columns.map((c) => <th key={c.key} scope="col" className={`px-4 py-3 ${c.className || ''}`}>{c.header}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={rowKey(r)} onClick={click(r)} onKeyDown={(e) => { if (e.key === 'Enter' && onRowClick) onRowClick(r); }} tabIndex={onRowClick ? 0 : undefined}
                className={`border-b border-slate-50 text-slate-700 ${onRowClick ? 'cursor-pointer hover:bg-blue-50/40 focus-visible:bg-blue-50' : ''}`}>
                {columns.map((c) => <td key={c.key} className={`px-4 py-3 ${c.className || ''}`}>{cell(c, r)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 p-3 md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)} onClick={click(r)} className={`rounded-xl border border-slate-100 bg-white p-4 ${onRowClick ? 'cursor-pointer active:bg-blue-50/40' : ''}`}>
            <div className="mb-2 text-sm font-semibold text-[#0b1a4a]">{cell(primary, r)}</div>
            <dl className="space-y-1.5">
              {rest.map((c) => (
                <div key={c.key} className="flex items-center justify-between gap-3 text-xs"><dt className="text-slate-500">{c.header}</dt><dd className="text-right text-slate-700">{cell(c, r)}</dd></div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
