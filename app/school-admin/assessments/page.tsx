'use client';
import { useEffect, useState } from 'react';
import { ClipboardList, Users, BarChart2 } from 'lucide-react';
import api from '@/lib/api';

interface Row {
  id: number; title: string; type: string; course_id: number; course_title: string;
  due_date: string | null; submission_count: number; graded_count: number; avg_percent: number | null;
}
interface Summary { total_assessments: number; total_submissions: number; average_percent: number | null; }
type TypeFilter = 'all' | 'quiz' | 'assignment' | 'exam';

export default function AdminAssessments() {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [type, setType] = useState<TypeFilter>('all');
  const [course, setCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get('/assessments/school-stats');
      setRows(r.data.assessments || []);
      setSummary(r.data.summary || null);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not load assessments');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const courses = rows.reduce<{ id: number; title: string }[]>((acc, r) =>
    acc.some(c => c.id === r.course_id) ? acc : [...acc, { id: r.course_id, title: r.course_title }], []);
  const filtered = rows.filter(r =>
    (type === 'all' || r.type === type) && (course === 'all' || String(r.course_id) === course));

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  if (error) return (
    <div className="p-6 max-w-xl mx-auto">
      <p className="text-red-500 text-sm mb-3">{error}</p>
      <button onClick={load} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">Try again</button>
    </div>
  );

  const cards = [
    { label: 'Total assessments', value: String(summary?.total_assessments ?? 0), Icon: ClipboardList },
    { label: 'Total submissions', value: String(summary?.total_submissions ?? 0), Icon: Users },
    { label: 'Average score', value: summary?.average_percent == null ? 'No grades yet' : summary.average_percent + '%', Icon: BarChart2 },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assessments Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2"><Icon size={15} /><span className="text-xs">{label}</span></div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-3 flex-wrap">
        {(['all', 'quiz', 'assignment', 'exam'] as TypeFilter[]).map(f => (
          <button key={f} onClick={() => setType(f)}
            className={'px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ' + (type === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{f}</button>
        ))}
      </div>
      <select value={course} onChange={e => setCourse(e.target.value)}
        className="w-full sm:w-64 border border-gray-200 rounded-xl p-2.5 text-sm mb-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="all">All courses</option>
        {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title}</option>)}
      </select>
      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-xs text-gray-400 uppercase">
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Course</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Due</th>
              <th className="text-right px-4 py-3">Submissions</th>
              <th className="text-right px-4 py-3">Graded</th>
              <th className="text-right px-4 py-3">Avg</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No assessments found</td></tr>}
            {filtered.map(r => (
              <tr key={r.type + '-' + r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{r.course_title}</td>
                <td className="px-4 py-3"><span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.type}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{r.due_date ? new Date(r.due_date).toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-right text-gray-700 font-medium">{r.submission_count}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.graded_count}</td>
                <td className="px-4 py-3 text-right text-gray-700">{r.avg_percent === null ? '-' : r.avg_percent + '%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
