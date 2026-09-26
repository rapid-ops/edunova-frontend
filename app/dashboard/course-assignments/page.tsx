'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Assignment { id: number; course_title: string; teacher_name: string; teacher_email: string; assigned_at: string; }
export default function CourseAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [form, setForm] = useState({ course_id: '', teacher_id: '' });
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/course-assignments/school/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setAssignments(d.assignments || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const assign = async () => { if (!form.course_id || !form.teacher_id) return; await fetch(`${API}/api/course-assignments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, course_id: Number(form.course_id), teacher_id: Number(form.teacher_id), school_id: user.school_id, assigned_by: user.id }) }); setForm({ course_id: '', teacher_id: '' }); load(); };
  const unassign = async (course_id: number, teacher_id: number) => { await fetch(`${API}/api/course-assignments/${course_id}/${teacher_id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Course Assignments</h1></div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Assign Course to Teacher</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} placeholder="Course ID" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <input value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })} placeholder="Teacher ID" className="bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
          </div>
          <button onClick={assign} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Assign</button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {assignments.length === 0 ? <div className="p-12 text-center text-gray-400">No assignments yet.</div> : assignments.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0">
              <div><div className="font-medium text-gray-900">{a.course_title}</div><div className="text-xs text-gray-400">{a.teacher_name} · {a.teacher_email}</div></div>
              <button onClick={() => unassign(a.course_id, a.teacher_id)} className="text-red-400 text-sm hover:text-red-600">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
