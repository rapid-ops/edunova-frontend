'use client';
import { useEffect, useState } from 'react';
import { ClipboardList, Users, BarChart2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

interface Row { id: number; title: string; type: string; course_title: string; due_date: string | null; total_marks: number; submission_count: number; avg_score: number | null; }

export default function AdminAssessments() {
  const { user } = useAuthStore();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<'all'|'quiz'|'assignment'|'exam'>('all');
  const [stats, setStats] = useState({ total: 0, submissions: 0, avg: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  useEffect(() => {
    if (!user?.school_id) return;
    (async () => {
      try {
        const cr = await api.get(`/courses/school/${user.school_id}`);
        const courses: { id: number; title: string }[] = cr.data.courses || [];
        const all: Row[] = [];
        await Promise.all(courses.map(async c => {
          try {
            const [qr, ar] = await Promise.all([
              api.get(`/quizzes/course/${c.id}`),
              api.get(`/assessments/course/${c.id}`),
            ]);
            const quizzes = (qr.data.quizzes || []).map((q: any) => ({
              ...q, type: 'quiz', course_title: c.title,
              submission_count: q.students_attempted || 0, avg_score: null,
            }));
            const ass = (ar.data.assessments || [])
              .filter((a: any) => a.type !== 'quiz')
              .map((a: any) => ({ ...a, course_title: c.title, submission_count: 0, avg_score: null }));
            all.push(...quizzes, ...ass);
          } catch {}
        }));
        setRows(all);
        const totalSubs = all.reduce((s, r) => s + (r.submission_count || 0), 0);
        setStats({ total: all.length, submissions: totalSubs, avg: 0 });
      } catch {}
      finally { setLoading(false); }
    })();
  }, [user]);

  const filtered = filter === 'all' ? rows : rows.filter(r => r.type === filter);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assessments Overview</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Assessments', value: stats.total, icon: ClipboardList },
          { label: 'Total Submissions', value: stats.submissions, icon: Users },
          { label: 'Avg Score', value: stats.avg ? `${stats.avg}%` : 'N/A', icon: BarChart2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1"><Icon size={16}/><span className="text-xs">{label}</span></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all','quiz','assignment','exam'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${filter===f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Course</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Due</th>
              <th className="text-right px-4 py-3">Submissions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No assessments found</td></tr>}
            {filtered.map(r => (
              <tr key={`${r.type}-${r.id}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                <td className="px-4 py-3 text-gray-500">{r.course_title}</td>
                <td className="px-4 py-3"><span className="capitalize text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{r.type}</span></td>
                <td className="px-4 py-3 text-gray-500">{r.due_date ? new Date(r.due_date).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.submission_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
