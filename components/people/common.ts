export interface SignIn { login_id: string; code: string; expires_at?: string | null; school_name?: string }
export interface Invitation { link: string; emailed: boolean }

export const errMsg = (e: any): string => {
  const r = e?.response;
  if (r?.data?.error) return r.data.error;
  if (!r) return 'We could not reach the server. Check your internet connection and try again.';
  if (r.status === 429) return 'You are doing this too quickly. Wait a few minutes and try again.';
  return 'Something went wrong. Please try again.';
};
export const fieldErrors = (e: any): Record<string, string> => e?.response?.data?.errors || {};
export const firstError = (e: any): string => Object.values(fieldErrors(e))[0] || errMsg(e);

export const inputCls = 'h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500';
export const primaryBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50';
export const ghostBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 text-sm font-medium text-slate-700 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50';
export const dangerBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white outline-none hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50';

export const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const copyText = async (t: string): Promise<boolean> => {
  try { await navigator.clipboard.writeText(t); return true; } catch {
    try {
      const a = document.createElement('textarea');
      a.value = t; a.style.position = 'fixed'; a.style.opacity = '0';
      document.body.appendChild(a); a.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(a);
      return ok;
    } catch { return false; }
  }
};
export const waLink = (t: string) => 'https://wa.me/?text=' + encodeURIComponent(t);
