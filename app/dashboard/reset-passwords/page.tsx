'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { ChevronLeft, KeyRound, Search, Copy, CheckCircle } from 'lucide-react';

export default function ResetPasswordsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ name: string; email: string; password: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    let u: any = {};
    try { u = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
    if (!['school_admin', 'super_admin'].includes(u.role)) { setAllowed(false); setLoading(false); return; }
    if (!u.school_id) { setError('No school is linked to this account'); setLoading(false); return; }
    api.get(`/auth/users/${u.school_id}`)
      .then(res => setUsers((res.data.users || []).filter((x: any) => ['student', 'teacher', 'parent'].includes(x.role))))
      .catch(() => setError('Could not load users'))
      .finally(() => setLoading(false));
  }, []);

  const doReset = async (id: number) => {
    setError(''); setCopied(false); setBusy(true);
    try {
      const res = await api.post(`/auth/admin-reset/${id}`);
      setResult({ name: res.data.user.full_name, email: res.data.user.email, password: res.data.temp_password });
      setConfirmId(null);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Reset failed');
    }
    setBusy(false);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(result!.password); setCopied(true); } catch {}
  };

  if (loading) return <LoadingScreen />;
  if (!allowed) return <div className="p-6 text-sm text-gray-500">Only school administrators can reset passwords.</div>;

  const q = query.trim().toLowerCase();
  const shown = users.filter(u => !q || (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="text-blue-600"><ChevronLeft size={22} /></button>
        <h1 className="text-lg font-bold">Reset passwords</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
              <CheckCircle size={16} /> Password reset for {result.name}
            </p>
            <p className="text-xs text-green-700">{result.email}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-base font-mono tracking-wide">{result.password}</code>
              <button onClick={copy} className="bg-blue-600 text-white rounded-lg p-2.5"><Copy size={16} /></button>
            </div>
            <p className="text-xs text-green-700">{copied ? 'Copied. ' : ''}Shown once. Give it to the user and ask them to change it after signing in.</p>
            <button onClick={() => setResult(null)} className="text-xs text-green-700 underline">Dismiss</button>
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}

        <div className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or email"
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm" />
        </div>

        {shown.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">No users found</div>
        )}

        {shown.map(u => (
          <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <KeyRound size={18} className="text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{u.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email} · {u.role}</p>
              </div>
              {confirmId !== u.id && (
                <button onClick={() => { setConfirmId(u.id); setResult(null); setError(''); }}
                  className="text-sm text-blue-600 font-medium shrink-0">Reset</button>
              )}
            </div>
            {confirmId === u.id && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <p className="text-sm text-red-600">Replace {u.full_name}'s password with a new temporary one?</p>
                <div className="flex gap-2">
                  <button onClick={() => doReset(u.id)} disabled={busy}
                    className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
                    {busy ? 'Resetting...' : 'Confirm reset'}
                  </button>
                  <button onClick={() => setConfirmId(null)} className="flex-1 bg-white border border-gray-200 text-sm py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
