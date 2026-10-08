'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Users, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    Promise.all([
      api.get(`/dropout/${user.school_id}`).then(r => setPredictions(r.data.predictions || [])).catch(() => {}),
      api.get(`/courses/school/${user.school_id}`).then(r => setCourses(r.data.courses || [])).catch(() => {}),
      api.get(`/competencies/school/${user.school_id}`).then(r => setCompetencies(r.data.competencies || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const runPrediction = async () => {
    if (!user) return;
    setRunning(true);
    try { await api.post(`/dropout/predict/${user.school_id}`); load(); } catch {}
    setRunning(false);
  };

  const riskColor = (l: string) => l === 'critical' ? 'bg-red-100 text-red-600' : l === 'high' ? 'bg-orange-100 text-orange-600' : l === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
  const atRisk = predictions.filter(p => ['high','critical'].includes(p.risk_level)).length;
  const avgScore = courses.length ? Math.round(courses.reduce((a, c) => a + (c.avg_score || 0), 0) / courses.length) : 0;
  const totalStudents = courses.reduce((a, c) => a + (c.enrolled_count || 0), 0);
  const avgCompletion = courses.length ? Math.round(courses.reduce((a, c) => a + (c.completion_rate || 0), 0) / courses.length) : 0;

  // competency gap heatmap — count missing per competency across predictions
  const compGap = competencies.map((c: any) => ({
    name: c.name,
    missing: predictions.filter((p: any) => {
      const f = typeof p.factors === 'string' ? JSON.parse(p.factors) : p.factors || {};
      return f.missing_competencies && f.missing_competencies.includes(c.name);
    }).length,
  })).sort((a, b) => b.missing - a.missing);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button>
            <h1 className="text-xl font-bold">School Analytics</h1>
          </div>
          <button onClick={runPrediction} disabled={running} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{running ? 'Running...' : 'Run Dropout Prediction'}</button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
          {[{label:'Total Students',value:totalStudents,Icon:Users,color:'text-blue-600'},{label:'Avg Score',value:`${avgScore}%`,Icon:TrendingUp,color:'text-green-600'},{label:'Avg Completion',value:`${avgCompletion}%`,Icon:BookOpen,color:'text-purple-600'},{label:'At Risk',value:atRisk,Icon:AlertTriangle,color:'text-red-500'}].map(({label,value,Icon,color}) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {predictions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-gray-100 font-semibold text-sm">Dropout Risk</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{['Student','Risk Level','Score','Factors'].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500">{h}</th>)}</tr></thead>
                <tbody>
                  {predictions.map((p: any, i: number) => {
                    const f = typeof p.factors === 'string' ? JSON.parse(p.factors) : p.factors || {};
                    return (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{p.full_name}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${riskColor(p.risk_level)}`}>{p.risk_level}</span></td>
                        <td className="px-4 py-3 text-gray-600">{p.risk_score}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{Object.entries(f).map(([k,v]) => `${k}: ${v}`).join(' · ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-gray-100 font-semibold text-sm">Course Performance</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{['Course','Enrolled','Avg Score','Completion'].map(h => <th key={h} className="text-left px-4 py-2 text-xs font-medium text-gray-500">{h}</th>)}</tr></thead>
                <tbody>
                  {courses.map((c: any, i: number) => (
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{c.title}</td>
                      <td className="px-4 py-3 text-gray-600">{c.enrolled_count || 0}</td>
                      <td className="px-4 py-3 text-gray-600">{c.avg_score != null ? `${Math.round(c.avg_score)}%` : '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{c.completion_rate != null ? `${Math.round(c.completion_rate)}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {compGap.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="font-semibold text-sm mb-3">Competency Gap Heatmap</div>
            <div className="space-y-2">
              {compGap.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-700 w-40 truncate">{c.name}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: predictions.length ? `${(c.missing / predictions.length) * 100}%` : '0%' }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{c.missing}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
