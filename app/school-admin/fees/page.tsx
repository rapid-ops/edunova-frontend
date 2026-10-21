'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, Clock, DollarSign, Plus, Wallet } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import PageHeader from '@/components/admin/PageHeader';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/admin/StatusBadge';
import DataTable, { Column } from '@/components/admin/DataTable';
import FilterBar, { selectClass } from '@/components/admin/FilterBar';
import Pagination from '@/components/admin/Pagination';
import DetailPanel from '@/components/admin/DetailPanel';
import EmptyState from '@/components/admin/EmptyState';
import ErrorState from '@/components/admin/ErrorState';
import Skeleton from '@/components/admin/Skeleton';

interface Invoice { id: number; student_id: number; student_name: string; description: string | null; amount: number; status: string; display_status: 'paid' | 'pending' | 'overdue'; due_date: string | null; paid_at: string | null; invoice_no: string; payment_method: string | null; payment_reference: string | null }
interface Summary { total_due: number; collected: number; outstanding: number; overdue_amount: number; invoices: number; paid_count: number; unpaid_count: number; overdue_count: number }
interface Pay { id: number; amount: number; method: string; reference: string | null; paid_at: string; student_name: string; invoice_no: string }
interface Student { id: number; full_name: string }
type Panel = { type: 'create' } | { type: 'pay'; invoice: Invoice } | null;

const PAGE = 20;
const naira = (n: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(n);
const fmtDate = (s: string) => new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium' }).format(new Date(s));
const todayLagos = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date());
const METHOD: Record<string, string> = { cash: 'Cash', bank_transfer: 'Bank transfer', pos: 'POS', cheque: 'Cheque', paystack: 'Online (Paystack)', other: 'Other' };
const FORM_METHODS = ['cash', 'bank_transfer', 'pos', 'cheque', 'other'];
const TONE = { paid: 'green', pending: 'orange', overdue: 'red' } as const;
const errMsg = (e: any) => e?.response?.data?.error || e?.userMessage || 'Request failed. Please try again.';
const inputCls = 'h-11 w-full rounded-xl border border-blue-100 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500';
const primaryBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60';
const smallBtn = 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-blue-200 px-3 text-xs font-semibold text-blue-600 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50';

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-[#0b1a4a]">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function CreateForm({ sid, onDone, onCancel }: { sid: number; onDone: () => void; onCancel: () => void }) {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [sErr, setSErr] = useState(false);
  const [f, setF] = useState({ student_id: '', amount: '', description: '', due_date: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [srv, setSrv] = useState('');

  const loadStudents = useCallback(async () => {
    setSErr(false);
    try {
      const r = await api.get(`/auth/users/${sid}`);
      setStudents((r.data.users || []).filter((u: any) => u.role === 'student').sort((a: any, b: any) => String(a.full_name).localeCompare(String(b.full_name))));
    } catch { setSErr(true); }
  }, [sid]);
  useEffect(() => { loadStudents(); }, [loadStudents]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    const amt = Number(f.amount);
    if (!f.student_id) x.student_id = 'Choose a student.';
    if (!f.amount || !Number.isFinite(amt) || amt <= 0) x.amount = 'Enter an amount greater than zero.';
    else if (amt > 99999999) x.amount = 'Amount is too large.';
    if (!f.description.trim()) x.description = 'Add a short description.';
    setErrs(x); setSrv('');
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      await api.post('/fees', { student_id: Number(f.student_id), amount: amt, description: f.description.trim(), due_date: f.due_date ? `${f.due_date}T23:59:00+01:00` : undefined });
      onDone();
    } catch (err) { setSrv(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {sErr && <ErrorState message="Could not load students." onRetry={loadStudents} />}
      {!sErr && !students && <Skeleton className="h-11 w-full" />}
      {!sErr && students && (
        <Field id="inv-student" label="Student" error={errs.student_id}>
          <select id="inv-student" value={f.student_id} onChange={(e) => setF({ ...f, student_id: e.target.value })} className={`${selectClass} w-full`}>
            <option value="">{students.length ? 'Select a student' : 'No students in this school yet'}</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
        </Field>
      )}
      <Field id="inv-amount" label="Amount (NGN)" error={errs.amount}>
        <input id="inv-amount" type="number" inputMode="decimal" min="0" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} className={inputCls} placeholder="0.00" />
      </Field>
      <Field id="inv-desc" label="Description" error={errs.description}>
        <input id="inv-desc" maxLength={255} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={inputCls} placeholder="e.g. First term tuition" />
      </Field>
      <Field id="inv-due" label="Due date (optional)">
        <input id="inv-due" type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} className={inputCls} />
      </Field>
      {srv && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{srv}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy || sErr || !students} className={`${primaryBtn} flex-1`}>{busy ? 'Creating...' : 'Create invoice'}</button>
        <button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500">Cancel</button>
      </div>
    </form>
  );
}

function PayForm({ inv, onDone, onCancel }: { inv: Invoice; onDone: () => void; onCancel: () => void }) {
  const [f, setF] = useState({ method: 'cash', reference: '', paid_on: todayLagos(), note: '' });
  const [busy, setBusy] = useState(false);
  const [srv, setSrv] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSrv(''); setBusy(true);
    try {
      await api.post(`/finance/fees/${inv.id}/payments`, { method: f.method, reference: f.reference.trim() || undefined, note: f.note.trim() || undefined, paid_at: f.paid_on ? `${f.paid_on}T12:00:00+01:00` : undefined });
      onDone();
    } catch (err) { setSrv(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-xl bg-blue-50 p-3 text-sm">
        <p className="font-semibold text-[#0b1a4a]">{inv.invoice_no}</p>
        <p className="text-slate-600">{inv.student_name}{inv.description ? ` - ${inv.description}` : ''}</p>
        <p className="mt-1 font-bold text-[#0b1a4a]">{naira(inv.amount)}</p>
      </div>
      <p className="text-xs text-slate-500">The payment is recorded for the full invoice amount and the invoice is marked paid.</p>
      <Field id="pay-method" label="Payment method">
        <select id="pay-method" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })} className={`${selectClass} w-full`}>
          {FORM_METHODS.map((m) => <option key={m} value={m}>{METHOD[m]}</option>)}
        </select>
      </Field>
      <Field id="pay-ref" label="Reference (optional)" hint="Receipt, transfer or teller number.">
        <input id="pay-ref" maxLength={100} value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} className={inputCls} />
      </Field>
      <Field id="pay-date" label="Date paid">
        <input id="pay-date" type="date" max={todayLagos()} value={f.paid_on} onChange={(e) => setF({ ...f, paid_on: e.target.value })} className={inputCls} />
      </Field>
      <Field id="pay-note" label="Note (optional)">
        <input id="pay-note" maxLength={255} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} className={inputCls} />
      </Field>
      {srv && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{srv}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={`${primaryBtn} flex-1`}>{busy ? 'Saving...' : `Record ${naira(inv.amount)}`}</button>
        <button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500">Cancel</button>
      </div>
    </form>
  );
}

export default function FeesFinancePage() {
  const user = useAuthStore((s) => s.user);
  const sid = user?.school_id;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [rows, setRows] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [pays, setPays] = useState<Pay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<Panel>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const seq = useRef(0);

  useEffect(() => { const t = setTimeout(() => { setDq(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(null), 5000); return () => clearTimeout(t); }, [notice]);

  const load = useCallback(async () => {
    if (!sid) return;
    const my = ++seq.current;
    setLoading(true); setErr('');
    try {
      const [inv, pay] = await Promise.all([
        api.get(`/finance/school/${sid}/invoices`, { params: { status: status || undefined, q: dq || undefined, page, limit: PAGE } }),
        api.get(`/finance/school/${sid}/payments`).catch(() => null),
      ]);
      if (my !== seq.current) return;
      setSummary(inv.data.summary); setRows(inv.data.invoices); setTotal(inv.data.total);
      setPays(pay ? pay.data.payments : null);
    } catch (e: any) {
      if (my !== seq.current) return;
      setErr(e?.response?.status === 403 ? 'You do not have access to Fees & Finance.' : errMsg(e));
    } finally { if (my === seq.current) setLoading(false); }
  }, [sid, status, dq, page]);
  useEffect(() => { load(); }, [load]);

  const remind = async (inv: Invoice) => {
    setBusyId(inv.id);
    try { const r = await api.post(`/finance/fees/${inv.id}/remind`); setNotice({ ok: true, text: `Reminder sent to ${r.data.sent} recipient${r.data.sent === 1 ? '' : 's'}.` }); }
    catch (e) { setNotice({ ok: false, text: errMsg(e) }); }
    finally { setBusyId(null); }
  };
  const done = (text: string) => { setPanel(null); setNotice({ ok: true, text }); load(); };

  const cols: Column<Invoice>[] = [
    { key: 'invoice_no', header: 'Invoice', primary: true, render: (r) => <div><p className="font-semibold text-[#0b1a4a]">{r.invoice_no}</p>{r.description && <p className="max-w-[220px] truncate text-xs text-slate-500">{r.description}</p>}</div> },
    { key: 'student_name', header: 'Student' },
    { key: 'amount', header: 'Amount', render: (r) => <span className="font-semibold">{naira(r.amount)}</span> },
    { key: 'due_date', header: 'Due', render: (r) => (r.due_date ? fmtDate(r.due_date) : 'No due date') },
    { key: 'display_status', header: 'Status', render: (r) => <StatusBadge tone={TONE[r.display_status]}>{r.display_status.charAt(0).toUpperCase() + r.display_status.slice(1)}</StatusBadge> },
    { key: 'actions', header: 'Actions', render: (r) => r.display_status === 'paid'
      ? <span className="text-xs text-slate-500">{r.payment_method ? METHOD[r.payment_method] || r.payment_method : 'Paid'}{r.paid_at ? ` on ${fmtDate(r.paid_at)}` : ''}</span>
      : <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPanel({ type: 'pay', invoice: r })} className={smallBtn}>Record payment</button>
          <button type="button" onClick={() => remind(r)} disabled={busyId === r.id} aria-label={`Send reminder for ${r.invoice_no}`} className={smallBtn}><Bell className="h-3.5 w-3.5" />{busyId === r.id ? 'Sending...' : 'Remind'}</button>
        </div> },
  ];

  const header = <PageHeader title="Fees & Finance" subtitle="Invoices and payments for your school" actions={<button type="button" onClick={() => setPanel({ type: 'create' })} className={primaryBtn}><Plus className="h-4 w-4" />Create invoice</button>} />;
  if (user && !sid) return <>{header}<div className="px-4 lg:px-6"><EmptyState title="No school selected" message="This account is not linked to a school." /></div></>;

  const S = summary;
  const L = loading && !S;
  return (
    <div className="pb-6">
      {header}
      <div className="space-y-4 px-4 pt-3 lg:px-6">
        {notice && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-medium ${notice.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{notice.text}</p>}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total due" value={S ? naira(S.total_due) : ''} icon={DollarSign} tone="blue" loading={L} hint={S ? `${S.invoices} invoice${S.invoices === 1 ? '' : 's'}` : undefined} />
          <StatCard label="Collected" value={S ? naira(S.collected) : ''} icon={Wallet} tone="green" loading={L} hint={S ? `${S.paid_count} paid` : undefined} />
          <StatCard label="Outstanding" value={S ? naira(S.outstanding) : ''} icon={Clock} tone="orange" loading={L} hint={S ? `${S.unpaid_count} unpaid` : undefined} />
          <StatCard label="Overdue" value={S ? naira(S.overdue_amount) : ''} icon={AlertTriangle} tone="red" loading={L} hint={S ? `${S.overdue_count} overdue` : undefined} />
        </div>

        <div className={panel ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-4' : ''}>
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-50 p-3">
                <FilterBar search={q} onSearch={setQ} placeholder="Search student, invoice or description">
                  <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={selectClass}>
                    <option value="">All statuses</option><option value="pending">Pending</option><option value="overdue">Overdue</option><option value="paid">Paid</option>
                  </select>
                </FilterBar>
              </div>
              {err ? <ErrorState message={err} onRetry={load} /> : (
                <>
                  <DataTable columns={cols} rows={rows} rowKey={(r) => r.id} loading={loading} emptyTitle={dq || status ? 'No invoices match your filters' : 'No invoices yet'} emptyMessage={dq || status ? 'Try a different search or status.' : 'Create an invoice to start tracking fees.'} />
                  {!loading && total > 0 && <Pagination page={page} pageSize={PAGE} total={total} onPage={setPage} noun="invoices" />}
                </>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="border-b border-slate-50 px-4 py-3"><h2 className="text-sm font-bold text-[#0b1a4a]">Recent payments</h2></div>
              {loading && !pays ? <div className="space-y-3 p-4"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-full" /></div>
                : pays === null ? <p className="px-4 py-6 text-center text-sm text-slate-500">Recent payments are unavailable right now.</p>
                : pays.length === 0 ? <EmptyState icon={Wallet} title="No payments recorded yet" message="Payments you record will appear here." />
                : pays.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 border-b border-slate-50 px-4 py-3 last:border-0">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-[#0b1a4a]">{p.student_name}</p><p className="truncate text-xs text-slate-500">{p.invoice_no} - {METHOD[p.method] || p.method}{p.reference ? ` - ${p.reference}` : ''} - {fmtDate(p.paid_at)}</p></div>
                    <span className="shrink-0 text-sm font-bold text-emerald-600">{naira(p.amount)}</span>
                  </div>
                ))}
            </section>
          </div>

          <DetailPanel open={!!panel} title={panel?.type === 'pay' ? 'Record payment' : 'Create invoice'} onClose={() => setPanel(null)}>
            {panel?.type === 'create' && sid && <CreateForm sid={sid} onDone={() => done('Invoice created.')} onCancel={() => setPanel(null)} />}
            {panel?.type === 'pay' && <PayForm key={panel.invoice.id} inv={panel.invoice} onDone={() => done('Payment recorded.')} onCancel={() => setPanel(null)} />}
          </DetailPanel>
        </div>
      </div>
    </div>
  );
}
