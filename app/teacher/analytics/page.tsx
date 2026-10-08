'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Users, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';

export default function TeacherAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingC, setLoadingC] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get(`/courses/school/${user.school_id}`).then(r => {
      const all = r.data.courses || [];
      setCourses(all);
      if (all[0]) setSelected(all[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!selected || !user) return;
    setLoadingC(true);
    Promise.all([
      api.get(`/enrollments/course/${selected.id}`).then(r => {
        const e = r.data.enrollments || [];
        setStudents(e);
        const avg = e.length ? Math.round(e.reduce((a: number, b: any) => a + (b.avg_score || 0), 0) / e.length) : 0;
        const comp = e.filter((x: any) => x.completed).length;
        setStats({ count: e.length, avg, completion: e.length ? Math.round((comp / e.length) * 100) : 0 });
      }).catch(() => { setStudents([]); setStats(null); }),
      api.get(`/dropout/${user.school_id}`).then(r => setPredictions(r.data.predictions || [])).catch(() => {}),
      api.get(`/competencies/course/${selected.id}`).then(r => setCompetencies(r.data.competencies || [])).catch(() => {}),
    ]).finally(() => setLoadingC(false));
  }, [selected]);

  const riskColor = (l: string) => l === 'critical' ? 'bg-red-100 text-red-600' : l === 'high' ? 'bg-orange-100 text-orange-600' : l === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
  const atRisk = predictions.filter(p => ['high','critical'].includes(p.risk_level)).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button>
          <h1 className="text-xl font-bold">Analytics</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">Course</label>
          <select value={selected?.id || ''} onChange={e => setSelected(courses.find(c => c.id === Number(e.target.value)))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        {loadingC ? <div className="text-center text-gray-400 text-sm py-12">Loading...</div> : (
          <div className="space-y-5">
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[{label:'Students',value:stats.count,Icon:Users,color:'text-blue-600'},{label:'Avg Score',value:`${stats.avg}%`,Icon:TrendingUp,color:'text-green-600'},{label:'Completion',value:`${stats.completion}%`,Icon:BookOpen,color:'text-purple-600'},{label:'At Risk',value:atRisk,Icon:AlertTriangle,color:'text-red-500'}].map(({label,value,Icon,color}) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <Icon size={16} className={`${color} mb-2`} />
                    <div className="text-xl font-bold">{value}</div>
                    <div className="text-xs text-gray-400">{label}</div>
                  </div>
                ))}
              </div>
            )}
            {students.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 font-semibold text-sm">Student Performance</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>{['Name','Avg Score','Last Active','Risk'].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500">{h}</th>)}</tr></thead>
                    <tbody>
                      {students.map((s: any, i: number) => {
                        const pred = predictions.find((p: any) => Number(p.student_id) === Number(s.student_id || s.id));
                        return (
                          <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{s.full_name || s.student_name || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{s.avg_score != null ? `${Math.round(s.avg_score)}%` : '—'}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{s.last_active ? new Date(s.last_active).toLocaleDateString('en-GB') : '—'}</td>
                            <td className="px-4 py-3">{pred ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${riskColor(pred.risk_level)}`}>{pred.risk_level}</span> : <span className="text-xs text-gray-300">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {competencies.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="font-semibold text-sm mb-3">Course Competencies</div>
                <div className="flex flex-wrap gap-2">{competencies.map((c: any, i: number) => <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-100">{c.name}</span>)}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
