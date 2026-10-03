'use client';
import { useEffect, useState } from 'react';
import { Mail, Phone, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface A { id: number; name: string; email: string; phone: string; programme: string; message: string; created_at: string }

export default function Applications() {
  const [rows, setRows] = useState<A[] | null>(null);
  const [sid, setSid] = useState('');
  const [msg, setMsg] = useState('');
  const [confirm, setConfirm] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        const id = new URLSearchParams(window.location.search).get('school') || u.school_id;
        if (!id) { setMsg('No school linked to this account.'); setRows([]); return; }
        setSid(String(id));
        const r = await api.get('/apply/school/' + id);
        setRows(r.data.applications || []);
      } catch (e: any) { setMsg(e?.response?.data?.error || 'Could not load applications.'); setRows([]); }
    })();
  }, []);

  const del = async (id: number) => {
    if (confirm !== id) { setConfirm(id); return; }
    try {
      await api.delete('/apply/school/' + sid + '/' + id);
      setRows(r => (r || []).filter(x => x.id !== id)); setConfirm(null);
    } catch (e: any) { setMsg(e?.response?.data?.error || 'Could not delete.'); }
  };

  if (rows === null) return <div className="p-6 text-slate-600">Loading...</div>;
  return (
    <div className="p-4 pb-28 text-slate-900 md:p-6">
      <h1 className="mb-4 text-xl font-bold">Applications ({rows.length})</h1>
      {msg && <div className="mb-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-800">{msg}</div>}
      {rows.length === 0 && !msg && <p className="text-slate-600">No applications yet. They appear here when someone applies on your school website.</p>}
      <div className="space-y-3">
        {rows.map(a => (
          <div key={a.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}{a.programme ? ' · ' + a.programme : ''}</div>
              </div>
              <button onClick={() => del(a.id)} className="flex min-h-11 shrink-0 items-center gap-1 text-sm text-red-600"><Trash2 className="h-4 w-4" />{confirm === a.id ? 'Tap to confirm' : 'Delete'}</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {a.email && <a href={'mailto:' + a.email} className="flex min-h-11 items-center gap-1 text-blue-600"><Mail className="h-4 w-4" />{a.email}</a>}
              {a.phone && <a href={'tel:' + a.phone} className="flex min-h-11 items-center gap-1 text-blue-600"><Phone className="h-4 w-4" />{a.phone}</a>}
            </div>
            {a.message && <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{a.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
