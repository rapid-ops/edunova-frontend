'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Task { id: number; title: string; description: string; company: string; difficulty: string; task_url: string; }
interface Submission { id: number; task_id: number; title: string; company: string; status: string; submitted_at: string; }
export default function ProofOfWorkPage() {
  const router = useRouter();
  const params = useSearchParams();
  const course_id = params.get('course_id');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [form, setForm] = useState({ title: '', description: '', company: '', task_url: '', difficulty: 'beginner' });
  const [submitUrl, setSubmitUrl] = useState('');
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = ['school_admin','super_admin','teacher'].includes(user.role);
  const load = () => {
    if (!course_id) return;
    fetch(`${API}/api/proof-of-work/tasks/${course_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setTasks(d.tasks || []));
    fetch(`${API}/api/proof-of-work/student/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setMySubmissions(d.submissions || []); setLoading(false); });
  };
  useEffect(() => { load(); }, [course_id]);
  const createTask = async () => { await fetch(`${API}/api/proof-of-work/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, course_id: Number(course_id), school_id: user.school_id }) }); setForm({ title: '', description: '', company: '', task_url: '', difficulty: 'beginner' }); setShowForm(false); load(); };
  const submitWork = async (task_id: number) => { if (!submitUrl.trim()) return; await fetch(`${API}/api/proof-of-work/submit`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ task_id, student_id: user.id, submission_url: submitUrl }) }); setSubmitUrl(''); setSelectedTask(null); load(); };
  const statusColor = (s: string) => s === 'approved' ? 'bg-green-100 text-green-700' : s === 'rejected' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-700';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Proof of Work</h1></div>
          {isAdmin && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ Add Task</button>}
        </div>
        {showForm && isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Company" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
              <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
            </div>
            <input value={form.task_url} onChange={e => setForm({ ...form, task_url: e.target.value })} placeholder="Task URL" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <div className="flex gap-3"><button onClick={createTask} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Create</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        <div className="space-y-4 mb-8">
          {tasks.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2"><div><div className="font-semibold text-gray-900">{t.title}</div><div className="text-xs text-gray-400 mt-1">{t.company} · {t.difficulty}</div></div>{t.task_url && <a href={t.task_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View Task →</a>}</div>
              <p className="text-sm text-gray-600 mb-3">{t.description}</p>
              {!isAdmin && (selectedTask === t.id ? (
                <div className="flex gap-3"><input value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} placeholder="Submission URL (GitHub, Drive, etc.)" className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" /><button onClick={() => submitWork(t.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Submit</button><button onClick={() => setSelectedTask(null)} className="bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-sm">Cancel</button></div>
              ) : <button onClick={() => setSelectedTask(t.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Submit Work</button>)}
            </div>
          ))}
          {tasks.length === 0 && <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No tasks yet.</div>}
        </div>
        {mySubmissions.length > 0 && (<div><h2 className="font-semibold text-gray-900 mb-3">My Submissions</h2><div className="space-y-3">{mySubmissions.map(s => (<div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"><div><div className="font-medium text-sm text-gray-900">{s.title}</div><div className="text-xs text-gray-400">{s.company}</div></div><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(s.status)}`}>{s.status}</span></div>))}</div></div>)}
      </div>
    </div>
  );
}
