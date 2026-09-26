'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Announcement { id: number; title: string; body: string; author_name: string; author_role: string; target_role: string; created_at: string; }
export default function AnnouncementsPage() {
  const router = useRouter();
  const [list, setList] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: '', body: '', target_role: 'all', class_id: '', course_id: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = ['school_admin', 'super_admin'].includes(user.role);
  const isTeacher = user.role === 'teacher';
  const load = () => {
    const url = user.role === 'student' ? `${API}/api/announcements/student/${user.id}/${user.school_id}` : user.role === 'teacher' ? `${API}/api/announcements/teacher/${user.id}/${user.school_id}` : `${API}/api/announcements/school/${user.school_id}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setList(d.announcements || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);
  const create = async () => { if (!form.title || !form.body) return; await fetch(`${API}/api/announcements`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, school_id: user.school_id, created_by: user.id, class_id: form.class_id || null, course_id: form.course_id || null }) }); setForm({ title: '', body: '', target_role: 'all', class_id: '', course_id: '' }); setShowForm(false); load(); };
  const del = async (id: number) => { await fetch(`${API}/api/announcements/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  const roleColor = (r: string) => r === 'student' ? 'bg-blue-50 text-blue-600' : r === 'teacher' ? 'bg-purple-50 text-purple-600' : r === 'parent' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Announcements</h1></div>
          {(isAdmin || isTeacher) && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ Post</button>}
        </div>
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Announcement title" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Write your announcement..." rows={3} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            {isAdmin && <select value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })} className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none"><option value="all">Everyone</option><option value="student">Students only</option><option value="teacher">Teachers only</option><option value="parent">Parents only</option></select>}
            <div className="flex gap-3"><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Post</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        <div className="space-y-4">
          {list.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No announcements yet.</div> : list.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div><div className="font-semibold text-gray-900">{a.title}</div><div className="flex items-center gap-2 mt-1"><span className="text-xs text-gray-400">{a.author_name}</span><span className={`text-xs px-2 py-0.5 rounded-full ${roleColor(a.target_role)}`}>{a.target_role}</span></div></div>
                <div className="flex items-center gap-2"><span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</span>{isAdmin && <button onClick={() => del(a.id)} className="text-red-400 text-xs hover:text-red-600">Delete</button>}</div>
              </div>
              <p className="text-sm text-gray-700 mt-2">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
