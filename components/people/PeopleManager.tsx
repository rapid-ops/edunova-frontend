'use client';
import { useCallback, useEffect, useState } from 'react';
import { Clock, UserCheck, UserPlus, Users } from 'lucide-react';
import api from '@/lib/api';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import Avatar from '@/components/admin/Avatar';
import Pagination from '@/components/admin/Pagination';
import FilterBar from '@/components/admin/FilterBar';
import DataTable from '@/components/admin/DataTable';
import DetailPanel from '@/components/admin/DetailPanel';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import AddPersonModal from './AddPersonModal';
import { SignInSlip, InviteLinkCard } from './SignInSlip';
import { errMsg, firstError, fmtDate, inputCls, primaryBtn, ghostBtn, dangerBtn, SignIn, Invitation } from './common';

type Status = 'active' | 'invited' | 'pending' | 'suspended';
interface Person { id: number; full_name: string; email: string | null; phone: string | null; role: string; login_id: string | null; created_at: string; status: Status; code_expired?: boolean; suspension_reason?: string | null }
interface Detail extends Person { parents?: { id: number; full_name: string; email: string | null; phone: string | null }[]; attendance_rate?: number | null; average_score?: number | null }

const TONE: Record<Status, 'green' | 'blue' | 'orange' | 'red'> = { active: 'green', invited: 'blue', pending: 'orange', suspended: 'red' };
const LABEL: Record<Status, string> = { active: 'Active', invited: 'Invited', pending: 'Pending approval', suspended: 'Suspended' };
const PAGE = 10;

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2 text-sm">
    <dt className="text-slate-500">{label}</dt>
    <dd className="min-w-0 break-words text-right font-medium text-slate-900">{children}</dd>
  </div>
);

export default function PeopleManager({ role, title, subtitle, tabs }: { role: 'student' | 'teacher'; title: string; subtitle: string; tabs?: React.ReactNode }) {
  const word = role === 'student' ? 'student' : 'teacher';
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [panelErr, setPanelErr] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [slip, setSlip] = useState<SignIn | null>(null);
  const [parentInv, setParentInv] = useState<{ name: string; email: string; inv: Invitation } | null>(null);
  const [editing, setEditing] = useState(false);
  const [ed, setEd] = useState({ name: '', phone: '' });
  const [confirmCode, setConfirmCode] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState('');
  const [addingParent, setAddingParent] = useState(false);
  const [pf, setPf] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    const t = setTimeout(() => { setDq(q.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/people', { params: { role, q: dq || undefined, status: status || undefined, page, limit: PAGE } });
      setPeople(r.data.people || []); setTotal(r.data.total || 0); setSummary(r.data.summary || null);
    } catch (e) { setError(errMsg(e)); } finally { setLoading(false); }
  }, [role, dq, status, page]);
  useEffect(() => { load(); }, [load]);

  const reloadDetail = async (id: number) => {
    const r = await api.get('/people/' + id);
    setDetail(r.data.person);
  };
  const openDetail = async (id: number) => {
    setOpenId(id); setDetail(null); setPanelErr(''); setNote(''); setSlip(null); setParentInv(null);
    setEditing(false); setConfirmCode(false); setSuspending(false); setReason(''); setAddingParent(false);
    try { await reloadDetail(id); } catch (e) { setPanelErr(errMsg(e)); }
  };
  const act = async (fn: () => Promise<void>) => {
    setBusy(true); setPanelErr(''); setNote('');
    try { await fn(); } catch (e) { setPanelErr(firstError(e)); } finally { setBusy(false); }
  };

  const saveEdit = () => act(async () => {
    await api.patch('/people/' + detail!.id, { full_name: ed.name, phone: ed.phone });
    setEditing(false); setNote('Details saved.');
    await reloadDetail(detail!.id); load();
  });
  const reissue = () => act(async () => {
    const r = await api.post('/people/' + detail!.id + '/invite');
    setConfirmCode(false);
    if (r.data.sign_in) setSlip(r.data.sign_in);
    await reloadDetail(detail!.id); load();
  });
  const suspend = () => act(async () => {
    if (reason.trim().length < 3) { setPanelErr('Give a reason of at least 3 characters.'); return; }
    await api.post('/schools/users/' + detail!.id + '/suspend', { reason: reason.trim() });
    setSuspending(false); setReason(''); setNote('Account suspended.');
    await reloadDetail(detail!.id); load();
  });
  const reactivate = () => act(async () => {
    await api.post('/schools/users/' + detail!.id + '/reactivate', {});
    setNote('Account reactivated.');
    await reloadDetail(detail!.id); load();
  });
  const addParent = () => act(async () => {
    const r = await api.post('/people/' + detail!.id + '/parents', { parent: { full_name: pf.name.trim(), email: pf.email.trim(), phone: pf.phone.trim() || undefined } });
    setAddingParent(false);
    if (r.data.parent?.invitation) setParentInv({ name: r.data.parent.full_name, email: pf.email.trim(), inv: r.data.parent.invitation });
    else setNote(`${r.data.parent.full_name} is now linked as parent or guardian.`);
    setPf({ name: '', email: '', phone: '' });
    await reloadDetail(detail!.id);
  });
  const removeParent = (pid: number) => {
    if (!window.confirm('Remove this parent or guardian from the student?')) return;
    act(async () => { await api.delete('/people/' + detail!.id + '/parents/' + pid); setNote('Parent removed.'); await reloadDetail(detail!.id); });
  };

  const columns = [
    { key: 'name', header: role === 'student' ? 'Student' : 'Teacher', primary: true, render: (p: Person) => (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={p.full_name} />
        <div className="min-w-0"><p className="truncate font-medium text-slate-900">{p.full_name}</p><p className="truncate text-xs text-slate-500">{p.login_id || ''}</p></div>
      </div>) },
    { key: 'contact', header: 'Contact', render: (p: Person) => (
      <div className="min-w-0 text-sm"><p className="truncate text-slate-700">{p.email || 'No email'}</p>{p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}</div>) },
    { key: 'status', header: 'Status', render: (p: Person) => <StatusBadge tone={TONE[p.status]}>{LABEL[p.status]}</StatusBadge> },
    { key: 'added', header: 'Added', hideOnMobile: true, render: (p: Person) => fmtDate(p.created_at) },
  ];

  const s = summary || {};
  const attention = (s.invited || 0) + (s.pending || 0) + (s.suspended || 0);
  const empty = !loading && !error && total === 0 && !dq && !status;
  const first = detail?.full_name.split(' ')[0] || 'this person';

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <PageHeader title={title} subtitle={subtitle} actions={<button type="button" onClick={() => setAdding(true)} className={primaryBtn}><UserPlus size={16} />Add {word}</button>} />
      {tabs}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={`Total ${word}s`} value={s.total ?? 0} icon={Users} tone="blue" loading={loading && !summary} />
        <StatCard label="Active" value={s.active ?? 0} icon={UserCheck} tone="green" loading={loading && !summary} />
        <StatCard label="New this month" value={s.new_30d ?? 0} icon={UserPlus} tone="purple" loading={loading && !summary} />
        <StatCard label="Needs attention" value={attention} icon={Clock} tone="orange" hint="Invited, pending or suspended" loading={loading && !summary} />
      </div>
      {error ? <ErrorState message={error} onRetry={load} /> : empty ? (
        <EmptyState title={`Add your first ${word}`} message="Add one person at a time. You will get their sign-in details to hand over." action={<button type="button" onClick={() => setAdding(true)} className={`${primaryBtn} min-h-14 px-6 text-base`}><UserPlus size={18} />Add your first {word}</button>} />
      ) : (
        <>
          <FilterBar search={q} onSearch={setQ} placeholder="Search by name, email or school ID">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={inputCls} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="pending">Pending approval</option>
              <option value="suspended">Suspended</option>
            </select>
          </FilterBar>
          <DataTable columns={columns} rows={people} rowKey={(r: Person) => r.id} onRowClick={(r: Person) => openDetail(r.id)} loading={loading} emptyTitle={`No ${word}s found`} emptyMessage="Try a different search or filter." />
          <Pagination page={page} pageSize={PAGE} total={total} onPage={setPage} noun={`${word}s`} />
        </>
      )}

      <AddPersonModal role={role} open={adding} onClose={() => setAdding(false)} onCreated={() => load()} />

      <DetailPanel open={openId !== null} title={detail?.full_name || 'Details'} onClose={() => setOpenId(null)}>
        {panelErr && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{panelErr}</p>}
        {note && <p className="mb-3 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{note}</p>}
        {!detail ? <p className="text-sm text-slate-500">{panelErr ? '' : 'Loading...'}</p> : (
          <div className="space-y-5">
            <section>
              <div className="mb-2 flex items-center gap-2"><StatusBadge tone={TONE[detail.status]}>{LABEL[detail.status]}</StatusBadge></div>
              {detail.status === 'invited' && <p className="mb-2 text-xs text-slate-600">Waiting for {first} to choose a password.{detail.code_expired ? ' The code has expired. Give a new code.' : ''}</p>}
              {detail.status === 'suspended' && detail.suspension_reason && <p className="mb-2 text-xs text-slate-600">Reason: {detail.suspension_reason}</p>}
              <dl className="divide-y divide-blue-50">
                <Row label="School ID">{detail.login_id || '-'}</Row>
                <Row label="Email">{detail.email || 'No email'}</Row>
                <Row label="Phone">{detail.phone || '-'}</Row>
                <Row label="Added">{fmtDate(detail.created_at)}</Row>
              </dl>
            </section>

            {(detail.attendance_rate != null || detail.average_score != null) && (
              <section className="grid grid-cols-2 gap-3">
                {detail.attendance_rate != null && <div className="rounded-xl bg-blue-50 p-3 text-center"><p className="text-xl font-bold text-slate-900">{detail.attendance_rate}%</p><p className="text-xs text-slate-500">Attendance</p></div>}
                {detail.average_score != null && <div className="rounded-xl bg-green-50 p-3 text-center"><p className="text-xl font-bold text-slate-900">{detail.average_score}%</p><p className="text-xs text-slate-500">Average score</p></div>}
              </section>
            )}

            {detail.role === 'student' && (
              <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Parent or guardian</h3>
                {detail.parents?.length ? detail.parents.map((p) => (
                  <div key={p.id} className="mb-2 flex items-start justify-between gap-2 rounded-xl border border-blue-100 p-3">
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-slate-900">{p.full_name}</p>
                      <p className="truncate text-xs text-slate-500">{p.email || 'No email'}</p>
                      {p.phone && <p className="text-xs text-slate-500">{p.phone}</p>}
                    </div>
                    <button type="button" disabled={busy} onClick={() => removeParent(p.id)} className="min-h-11 shrink-0 px-2 text-xs font-medium text-red-600">Remove</button>
                  </div>
                )) : <p className="mb-2 text-sm text-slate-500">No parent or guardian linked yet.</p>}
                {parentInv && <div className="mb-2"><InviteLinkCard name={parentInv.name} email={parentInv.email} inv={parentInv.inv} /></div>}
                {addingParent ? (
                  <div className="space-y-2 rounded-xl border border-blue-100 p-3">
                    <input className={inputCls} placeholder="Parent full name" value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} maxLength={100} />
                    <input type="email" className={inputCls} placeholder="Parent email" value={pf.email} onChange={(e) => setPf({ ...pf, email: e.target.value })} />
                    <input type="tel" className={inputCls} placeholder="Parent phone (optional)" value={pf.phone} onChange={(e) => setPf({ ...pf, phone: e.target.value })} />
                    <div className="flex gap-2">
                      <button type="button" disabled={busy} onClick={addParent} className={primaryBtn}>{busy ? 'Saving...' : 'Save parent'}</button>
                      <button type="button" onClick={() => setAddingParent(false)} className={ghostBtn}>Cancel</button>
                    </div>
                  </div>
                ) : <button type="button" onClick={() => setAddingParent(true)} className={ghostBtn}>Add parent or guardian</button>}
              </section>
            )}

            {slip && <SignInSlip name={detail.full_name} s={slip} />}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Actions</h3>
              {editing ? (
                <div className="space-y-2 rounded-xl border border-blue-100 p-3">
                  <input className={inputCls} value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} maxLength={100} aria-label="Full name" />
                  <input type="tel" className={inputCls} value={ed.phone} onChange={(e) => setEd({ ...ed, phone: e.target.value })} placeholder="Phone number" aria-label="Phone number" />
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={saveEdit} className={primaryBtn}>{busy ? 'Saving...' : 'Save'}</button>
                    <button type="button" onClick={() => setEditing(false)} className={ghostBtn}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={ghostBtn} onClick={() => { setEd({ name: detail.full_name, phone: detail.phone || '' }); setEditing(true); }}>Edit details</button>
                  <button type="button" className={ghostBtn} disabled={busy || detail.status === 'suspended' || detail.status === 'pending'} onClick={() => setConfirmCode(true)}>Give a new code</button>
                  {detail.status === 'suspended'
                    ? <button type="button" className={primaryBtn} disabled={busy} onClick={reactivate}>Reactivate</button>
                    : <button type="button" className={dangerBtn} disabled={busy} onClick={() => setSuspending(true)}>Suspend</button>}
                </div>
              )}
              {detail.status === 'pending' && <p className="text-xs text-slate-500">This person is waiting for approval. Approve them on the Approvals page first.</p>}
              {confirmCode && (
                <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p>A new code replaces the current code or password. {first} will need to choose a new password.</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={reissue} className={primaryBtn}>{busy ? 'Working...' : 'Give a new code'}</button>
                    <button type="button" onClick={() => setConfirmCode(false)} className={ghostBtn}>Cancel</button>
                  </div>
                </div>
              )}
              {suspending && (
                <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for suspension" maxLength={300} aria-label="Reason for suspension" />
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={suspend} className={dangerBtn}>{busy ? 'Working...' : 'Confirm suspend'}</button>
                    <button type="button" onClick={() => { setSuspending(false); setReason(''); }} className={ghostBtn}>Cancel</button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </DetailPanel>
    </div>
  );
}
