'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { ChevronLeft, Paperclip, CheckCircle, Clock } from 'lucide-react';

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline';

function SubmissionCard({ sub, total, onSaved }: { sub: any; total: number; onSaved: () => void }) {
  const [score, setScore] = useState<string>(sub.score != null ? String(sub.score) : '');
  const [feedback, setFeedback] = useState(sub.feedback || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      await api.put(`/assignments/submissions/${sub.id}/grade`, { score: Number(score), feedback });
      onSaved();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not save grade');
    }
    setSaving(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-sm truncate">{sub.student?.full_name || sub.student?.email || `Student ${sub.student_id}`}</p>
        <span className={`text-xs shrink-0 ${sub.status === 'graded' ? 'text-green-600' : 'text-blue-600'}`}>
          {sub.status === 'graded' ? `Graded ${sub.score}/${total}` : 'Needs grading'}
        </span>
      </div>
      <p className="text-xs text-gray-400">Submitted {fmt(sub.submitted_at)}</p>
      {sub.text_answer && <p className="text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-3">{sub.text_answer}</p>}
      {sub.file_url && (
        <a href={sub.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600">
          <Paperclip size={14} /> View attached file
        </a>
      )}
      <div className="flex gap-2">
        <input type="number" value={score} onChange={e => setScore(e.target.value)} placeholder={`/${total}`}
          className="w-24 bg-white border border-gray-200 rounded-lg p-2 text-sm" />
        <input value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Feedback"
          className="flex-1 bg-white border border-gray-200 rounded-lg p-2 text-sm" />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button onClick={save} disabled={saving || score === ''}
        className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50">
        {saving ? 'Saving...' : sub.status === 'graded' ? 'Update grade' : 'Save grade'}
      </button>
    </div>
  );
}

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [role, setRole] = useState('');
  const [assignment, setAssignment] = useState<any>(null);
  const [mySub, setMySub] = useState<any>(null);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async (r: string) => {
    try {
      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data.assignment);
      setMySub(res.data.submission);
      if (res.data.submission?.text_answer) setText(res.data.submission.text_answer);
      if (r !== 'student') {
        const s = await api.get(`/assignments/${id}/submissions`);
        setSubs(s.data.submissions || []);
      }
    } catch {
      setError('Could not load assignment');
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    let r = 'student';
    try { r = JSON.parse(localStorage.getItem('user') || '{}').role || 'student'; } catch {}
    setRole(r);
    load(r);
  }, [id]);

  const submit = async () => {
    setError(''); setNotice('');
    if (!text.trim() && !file) { setError('Write an answer or attach a file'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('text_answer', text);
      if (file) fd.append('file', file);
      const res = await api.post(`/assignments/${id}/submit`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNotice(res.data.late ? 'Submitted (marked late)' : 'Submitted successfully');
      setFile(null);
      await load(role);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Submission failed');
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingScreen />;
  if (!assignment) return <div className="p-6 text-sm text-red-600">{error || 'Not found'}</div>;

  const isStudent = role === 'student';
  const graded = mySub?.status === 'graded';
  const overdue = assignment.due_date && new Date(assignment.due_date) < new Date();
  const closed = overdue && assignment.allow_late === false;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <button onClick={() => router.push('/dashboard/assignments')} className="text-blue-600"><ChevronLeft size={22} /></button>
        <h1 className="text-lg font-bold truncate">{assignment.title}</h1>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} /> Due {fmt(assignment.due_date)} · {assignment.total_marks} marks
          </p>
          {assignment.instructions && <p className="text-sm whitespace-pre-wrap">{assignment.instructions}</p>}
          {assignment.attachment_url && (
            <a href={assignment.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600">
              <Paperclip size={14} /> Assignment file
            </a>
          )}
        </div>

        {isStudent ? (
          <>
            {graded && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-green-700 flex items-center gap-1">
                  <CheckCircle size={16} /> Graded: {mySub.score}/{assignment.total_marks}
                </p>
                {mySub.feedback && <p className="text-sm text-green-700 mt-1">{mySub.feedback}</p>}
              </div>
            )}
            {mySub && !graded && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-600">
                Submitted {fmt(mySub.submitted_at)}. You can resubmit until it is graded.
              </div>
            )}
            {mySub?.file_url && (
              <a href={mySub.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600">
                <Paperclip size={14} /> Your uploaded file
              </a>
            )}
            {closed && !graded && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">The deadline has passed</div>
            )}
            {!graded && !closed && (
              <>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Type your answer"
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm" />
                <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-500">
                  <Paperclip size={16} className="text-blue-600 shrink-0" />
                  <span className="truncate">{file ? file.name : 'Attach a file (optional)'}</span>
                  <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                </label>
                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}
                {notice && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">{notice}</div>}
                <button onClick={submit} disabled={submitting}
                  className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl disabled:opacity-50">
                  {submitting ? 'Submitting...' : mySub ? 'Resubmit' : 'Submit'}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <p className="text-sm font-semibold pt-2">Submissions ({subs.length})</p>
            {subs.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">No submissions yet</div>
            )}
            {subs.map(s => <SubmissionCard key={s.id} sub={s} total={assignment.total_marks} onSaved={() => load(role)} />)}
          </>
        )}
      </div>
    </div>
  );
}
