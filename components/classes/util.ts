export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const errMsg = (e: any): string => e?.response?.data?.error || 'Something went wrong. Please try again.';
export const when = (d?: string | null): string =>
  d
    ? new Date(d).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';
export const toLocalInput = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
export const stateOf = (s: any): 'live' | 'upcoming' | 'past' => {
  if (!s.is_active) return 'past';
  if (!s.scheduled_at) return 'live';
  const start = new Date(s.scheduled_at).getTime();
  const end = start + (s.duration_minutes || 60) * 60000;
  if (Date.now() > end) return 'past';
  return start > Date.now() ? 'upcoming' : 'live';
};
export const byTime = (a: any, b: any): number => +new Date(a.scheduled_at) - +new Date(b.scheduled_at);
export const inputCls = 'w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-900';
