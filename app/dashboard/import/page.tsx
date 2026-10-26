'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Download, Send, Upload, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { errMsg, fmtDate } from '@/components/people/common';

const MAX_ROWS = 500;
const HEAD = 'full_name,email,phone,role,class,parent_email';
const SAMPLES: Record<string, string[]> = {
  student: ['Dare Adeola,,08012345678,student,JSS 1A,parent@example.com', 'Ada Okafor,ada@example.com,08098765432,student,JSS 1B,'],
  teacher: ['Mrs Bello,bello@example.com,08011112222,teacher,,'],
  parent: ['Mr Adeola,adeola@example.com,08033334444,parent,,'],
};
const btn = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50';

const cell = (v: unknown) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
};
const toCsv = (head: string[], rows: unknown[][]) => [head.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))].join('\r\n');
const save = (name: string, text: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
};

function ImportInner() {
  const sp = useSearchParams();
  const raw = sp.get('role');
  const role = raw === 'student' || raw === 'teacher' || raw === 'parent' ? raw : null;
  const noun = role === 'student' ? 'students' : role === 'teacher' ? 'teachers' : role === 'parent' ? 'parents' : 'people';
  const back = role === 'teacher' ? '/school-admin/teachers' : '/school-admin/students';
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState(0);
  const [preview, setPreview] = useState<string[][]>([]);
  const [fileErr, setFileErr] = useState('');
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'upload' | 'save'>('upload');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [sheetSaved, setSheetSaved] = useState(false);
  const [pending, setPending] = useState(0);
  const [sending, setSending] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');

  useEffect(() => { api.get('/imports/invitations').then((r) => setPending(r.data.pending || 0)).catch(() => {}); }, []);
  useEffect(() => {
    if (!(result?.sign_ins?.length && !sheetSaved)) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [result, sheetSaved]);

  const handleFile = (f: File) => {
    setFileErr(''); setError('');
    if (!/\.csv$/i.test(f.name)) { setFileErr('Choose a CSV file. In Excel or Google Sheets, use Save as CSV.'); return; }
    if (f.size > 1024 * 1024) { setFileErr('This file is too large. Use a CSV under 1 MB.'); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = String(e.target?.result || '').split(/\r?\n/).filter((l) => l.trim());
      setRows(Math.max(lines.length - 1, 0));
      setPreview(lines.slice(0, 6).map((l) => l.split(',')));
    };
    reader.readAsText(f);
  };

  const template = () => {
    const samples = role ? SAMPLES[role] : [...SAMPLES.student, ...SAMPLES.teacher];
    save(`${role || 'people'}_import_template.csv`, HEAD + '\r\n' + samples.join('\r\n') + '\r\n');
  };

  const start = async () => {
    if (!file || rows > MAX_ROWS) return;
    setUploading(true); setProgress(0); setPhase('upload'); setError('');
    const form = new FormData();
    form.append('file', file);
    if (role) form.append('role', role);
    try {
      const r = await api.post('/imports/students', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
        onUploadProgress: (e) => {
          const total = e.total || file.size;
          setProgress(Math.min(100, Math.round((e.loaded / total) * 100)));
          if (e.loaded >= total) setPhase('save');
        },
      });
      setResult(r.data); setPending(r.data.pending_invites || 0); setSheetSaved(!(r.data.sign_ins?.length));
    } catch (e) { setError(errMsg(e)); } finally { setUploading(false); }
  };

  const reset = () => { setResult(null); setFile(null); setPreview([]); setRows(0); setProgress(0); setError(''); setSheetSaved(false); };

  const sendInvites = async () => {
    setSending(true); setInviteMsg('');
    try {
      const r = await api.post('/imports/invitations', {}, { timeout: 120000 });
      setPending(r.data.remaining);
      setInviteMsg(`Sent ${r.data.sent} ${r.data.sent === 1 ? 'invitation' : 'invitations'}. ${r.data.remaining} still waiting.${r.data.failed ? ` ${r.data.failed} could not be sent. They stay in the list. Try again in a few minutes.` : ''}`);
    } catch (e) { setInviteMsg(errMsg(e)); } finally { setSending(false); }
  };

  const tooMany = rows > MAX_ROWS;
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link href={back} className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-blue-600"><ArrowLeft size={16} />Back to {role === 'teacher' ? 'teachers' : 'students'}</Link>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Import {noun}</h1>
        <button type="button" onClick={template} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-blue-600"><Download size={14} />Template</button>
      </div>

      {pending > 0 && (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-sm font-semibold text-slate-900">{pending} {pending === 1 ? 'parent has' : 'parents have'} not been sent an invitation email</p>
          <p className="mt-1 text-xs text-slate-600">Importing never sends email by itself. Send invitations 20 at a time.</p>
          <button type="button" onClick={sendInvites} disabled={sending} className={`${btn} mt-3 bg-blue-600 text-white`}><Send size={16} />{sending ? 'Sending... this can take up to 15 seconds' : 'Send invitations (next 20)'}</button>
          {inviteMsg && <p className="mt-2 text-sm text-slate-700" role="status">{inviteMsg}</p>}
        </div>
      )}

      {!result && (
        <>
          <p className="mb-3 text-xs text-slate-500">Up to {MAX_ROWS} rows per file. Students and teachers do not need an email: they sign in with a school ID and a one-time code that you download after the import. The class column is ignored for now.</p>
          <button type="button"
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            className={`mb-4 w-full rounded-2xl border-2 border-dashed p-10 text-center transition ${drag ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}>
            <Upload size={32} className="mx-auto mb-2 text-blue-600" />
            <span className="block font-medium text-slate-700">{file ? file.name : 'Drop a CSV here or tap to choose one'}</span>
            <span className="mt-1 block text-xs text-slate-400">CSV files only</span>
          </button>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" aria-label="Choose a CSV file" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          {fileErr && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{fileErr}</p>}
          {tooMany && <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">This file has {rows} rows. You can import up to {MAX_ROWS} at a time. Split the file and import it in parts.</p>}
          {preview.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <p className="mb-2 text-sm font-semibold text-slate-600">Preview ({rows} {rows === 1 ? 'row' : 'rows'}):</p>
              <table className="w-full border-collapse text-xs">
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className={i === 0 ? 'bg-blue-600 text-white' : 'border-b'}>
                      {r.map((c, j) => <td key={j} className="border p-1.5">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {uploading && (
            <div className="mb-4" role="status">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full bg-blue-600 transition-all ${phase === 'save' ? 'animate-pulse' : ''}`} style={{ width: `${phase === 'save' ? 100 : progress}%` }} /></div>
              <p className="mt-1 text-center text-xs text-slate-500">{phase === 'upload' ? `Uploading ${progress}%` : 'Creating accounts... this can take a minute for large files. Please keep this page open.'}</p>
            </div>
          )}
          {error && <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
          {file && <button type="button" onClick={start} disabled={uploading || tooMany || rows < 1} className={`${btn} bg-blue-600 text-white`}>{uploading ? 'Importing...' : `Import ${rows} ${rows === 1 ? 'row' : 'rows'}`}</button>}
        </>
      )}

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-green-50 p-4 text-center"><CheckCircle className="mx-auto mb-1 text-green-500" size={24} /><p className="text-2xl font-bold text-green-600">{result.created}</p><p className="text-xs text-slate-500">Added</p></div>
            <div className="rounded-2xl bg-red-50 p-4 text-center"><XCircle className="mx-auto mb-1 text-red-400" size={24} /><p className="text-2xl font-bold text-red-500">{result.failed}</p><p className="text-xs text-slate-500">Not added</p></div>
          </div>
          {result.ignored?.length > 0 && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">The class column was ignored. Assigning classes is not available yet.</p>}
          {result.sign_ins?.length > 0 && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-sm font-semibold text-slate-900">Sign-in details for {result.sign_ins.length} {result.sign_ins.length === 1 ? 'person' : 'people'}</p>
              <p className="mt-1 text-xs text-slate-600">Download the sheet now and give each person their school ID and one-time code. The codes cannot be shown again.</p>
              <button type="button" className={`${btn} mt-3 bg-blue-600 text-white`} onClick={() => {
                save('sign-in-sheet.csv', toCsv(['Name', 'Role', 'School ID', 'One-time code', 'Valid until'], result.sign_ins.map((s: any) => [s.full_name, s.role, s.login_id, s.code, fmtDate(s.expires_at)])));
                setSheetSaved(true);
              }}><Download size={16} />{sheetSaved ? 'Download the sign-in sheet again' : 'Download the sign-in sheet'}</button>
            </div>
          )}
          {result.errors?.length > 0 && (
            <div className="overflow-hidden rounded-2xl border">
              <p className="bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">Rows that were not added</p>
              {result.errors.slice(0, 50).map((e: any, i: number) => (
                <div key={i} className="border-t px-3 py-2 text-sm"><span className="font-medium">Line {e.line}: {e.row}</span><span className="mt-0.5 block text-xs text-slate-500">{e.reason}</span></div>
              ))}
              {result.errors.length > 50 && <p className="border-t px-3 py-2 text-xs text-slate-500">And {result.errors.length - 50} more. They are all in the error report.</p>}
              <div className="border-t p-3"><button type="button" className={`${btn} bg-slate-100 text-slate-700`} onClick={() => save('import-errors.csv', toCsv(['Line', 'Row', 'What to fix'], result.errors.map((e: any) => [e.line, e.row, e.reason])))}><Download size={16} />Download the error report</button></div>
            </div>
          )}
          <button type="button" onClick={reset} className={`${btn} bg-slate-100 text-slate-700`}>Import another file</button>
        </div>
      )}
    </div>
  );
}

export default function ImportPage() {
  return <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading...</div>}><ImportInner /></Suspense>;
}
