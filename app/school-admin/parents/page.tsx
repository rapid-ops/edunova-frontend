'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Link2, Search, UserCheck, Users, X } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import Skeleton from '@/components/admin/Skeleton';
import Avatar from '@/components/admin/Avatar';

interface Child { id: number; full_name: string }
interface Parent { id: number; full_name: string; email: string; phone: string | null; children: Child[] }
interface Student { id: number; full_name: string; email?: string }

const errMsg = (e: any) => e?.response?.data?.error || e?.userMessage || 'Request failed. Please try again.';
const inputCls = 'h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500';
const primaryBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60';

export default function ParentsPage() {
  const user = useAuthStore((s) => s.user);
  const sid = user?.school_id;
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [onlyUnlinked, setOnlyUnlinked] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [pick, setPick] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [rowErr, setRowErr] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    if (!sid) return;
    setLoading(true); setError('');
    try {
      const [p, s] = await Promise.all([api.get(`/parents/school/${sid}`), api.get(`/schools/${sid}/students`)]);
      setParents(p.data.parents || []);
      setStudents(s.data.students || []);
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }, [sid]);
  useEffect(() => { if (sid) load(); else if (user) setLoading(false); }, [sid, user, load]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return parents.filter((p) => (!onlyUnlinked || p.children.length === 0) && (!t || p.full_name.toLowerCase().includes(t) || p.email.toLowerCase().includes(t)));
  }, [parents, q, onlyUnlinked]);
  const unlinked = parents.filter((p) => p.children.length === 0).length;

  const link = async (p: Parent) => {
    const studentId = Number(pick[p.id]);
    if (!studentId) { setRowErr((m) => ({ ...m, [p.id]: 'Choose a student first.' })); return; }
    setBusy(p.id); setRowErr((m) => ({ ...m, [p.id]: '' }));
    try {
      await api.post('/parents/link', { parent_id: p.id, student_id: studentId });
      const s = students.find((x) => x.id === studentId);
      setParents((list) => list.map((x) => (x.id === p.id ? { ...x, children: [...x.children, { id: studentId, full_name: s ? s.full_name : 'Student' }] } : x)));
      setPick((m) => ({ ...m, [p.id]: '' }));
    } catch (e) { setRowErr((m) => ({ ...m, [p.id]: errMsg(e) })); }
    finally { setBusy(null); }
  };
  const unlink = async (p: Parent, c: Child) => {
    setBusy(p.id); setRowErr((m) => ({ ...m, [p.id]: '' }));
    try {
      await api.delete('/parents/unlink', { data: { parent_id: p.id, student_id: c.id } });
      setParents((list) => list.map((x) => (x.id === p.id ? { ...x, children: x.children.filter((y) => y.id !== c.id) } : x)));
    } catch (e) { setRowErr((m) => ({ ...m, [p.id]: errMsg(e) })); }
    finally { setBusy(null); }
  };

  return (
    <div className="pb-24">
      <PageHeader title="Parents" subtitle="Link each parent to their children so they can follow progress." />
      <div className="space-y-4 px-4 lg:px-6">
        {user && !sid && <EmptyState icon={Users} title="No school selected" message="Open a school account to manage its parents." />}
        {sid && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Parents" value={parents.length} icon={Users} loading={loading} />
              <StatCard label="Not linked yet" value={unlinked} icon={UserCheck} tone="orange" loading={loading} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parents" aria-label="Search parents" className={`${inputCls} pl-9`} />
              </div>
              <button type="button" onClick={() => setOnlyUnlinked((v) => !v)} aria-pressed={onlyUnlinked}
                className={`min-h-11 rounded-xl border px-4 text-sm font-semibold ${onlyUnlinked ? 'border-blue-600 bg-blue-600 text-white' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
                Not linked only
              </button>
            </div>
            {loading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />)}
            {!loading && error && <ErrorState message={error} onRetry={load} />}
            {!loading && !error && parents.length === 0 && <EmptyState icon={Users} title="No approved parents yet" message="Parents appear here after you approve their sign-up." />}
            {!loading && !error && parents.length > 0 && shown.length === 0 && <EmptyState icon={Search} title="No parents match" message="Try a different search or clear the filter." />}
            {!loading && !error && shown.map((p) => {
              const isOpen = open === p.id;
              const linked = new Set(p.children.map((c) => c.id));
              const options = students.filter((s) => !linked.has(s.id));
              const n = p.children.length;
              return (
                <div key={p.id} className="rounded-2xl border border-blue-100 bg-white">
                  <div className="flex items-center gap-3 p-4">
                    <Avatar name={p.full_name} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0b1a4a]">{p.full_name}</p>
                      <p className="truncate text-xs text-slate-500">{p.email}{p.phone ? ` - ${p.phone}` : ''}</p>
                    </div>
                    <StatusBadge tone={n ? 'green' : 'orange'}>{n ? `${n} child${n === 1 ? '' : 'ren'}` : 'Not linked'}</StatusBadge>
                    <button type="button" onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen} aria-label={`Manage children of ${p.full_name}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50">
                      <ChevronDown className={`h-5 w-5 transition ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  {isOpen && (
                    <div className="space-y-3 border-t border-blue-50 p-4">
                      {n === 0 ? <p className="text-sm text-slate-500">No children linked yet.</p> : (
                        <ul className="space-y-2">
                          {p.children.map((c) => (
                            <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-blue-50/60 py-1 pl-3 pr-1">
                              <span className="truncate text-sm text-[#0b1a4a]">{c.full_name}</span>
                              <button type="button" onClick={() => unlink(p, c)} disabled={busy === p.id} aria-label={`Remove ${c.full_name}`}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"><X className="h-4 w-4" /></button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select value={pick[p.id] || ''} onChange={(e) => setPick((m) => ({ ...m, [p.id]: e.target.value }))} aria-label="Choose a student to link" className={`${inputCls} flex-1`}>
                          <option value="">{options.length ? 'Choose a student' : 'No more students to link'}</option>
                          {options.map((s) => <option key={s.id} value={s.id}>{s.full_name}{s.email ? ` (${s.email})` : ''}</option>)}
                        </select>
                        <button type="button" onClick={() => link(p)} disabled={busy === p.id || !options.length} className={primaryBtn}>
                          <Link2 className="h-4 w-4" />{busy === p.id ? 'Working...' : 'Link child'}
                        </button>
                      </div>
                      {rowErr[p.id] && <p role="alert" className="text-xs text-red-600">{rowErr[p.id]}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
