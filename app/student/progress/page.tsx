'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Brain, Clock, TrendingUp, Award, FileText, ChevronRight } from 'lucide-react';

const TABS = ['Overview', 'Skill Gap', 'Competencies'];

export default function StudentProgressPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tab, setTab] = useState('Overview');
  const [twin, setTwin] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [cvText, setCvText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [latest, setLatest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get(`/learning-twin/${user.id}?school_id=${user.school_id}`).then(r => setTwin(r.data.twin)).catch(() => {}),
      api.get(`/adaptive-learning/student/${user.id}`).then((r: any) => setProfiles(r.data.profiles || [])).catch(() => {}),
      api.get(`/competencies/student/${user.id}`).then(r => setCompetencies(r.data.competencies || [])).catch(() => {}),
      api.get(`/skill-gap/${user.id}`).then(r => { const a = r.data.analyses || []; setAnalyses(a); if (a[0]) setLatest(a[0]); }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user]);

  const runAnalysis = async () => {
    if (!cvText.trim() || !user) return;
    setAnalyzing(true);
    try {
      const r = await api.post('/skill-gap/analyze', { student_id: user.id, school_id: user.school_id, cv_text: cvText });
      const a = r.data.analysis;
      setLatest(a);
      setAnalyses(prev => [a, ...prev.slice(0, 4)]);
      setCvText('');
    } catch {}
    setAnalyzing(false);
  };

  const speedBadge = (s: string) => s === 'fast' ? 'bg-green-100 text-green-700' : s === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600';
  const barColor = (l: number) => l >= 7 ? 'bg-green-500' : l >= 4 ? 'bg-yellow-400' : 'bg-red-400';
  const parseJ = (v: any) => { if (!v) return []; if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } } return Array.isArray(v) ? v : []; };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button>
          <h1 className="text-xl font-bold">My Progress</h1>
        </div>
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>{t}</button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div className="space-y-5">
            {twin && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4"><Brain size={16} className="text-blue-600" /><span className="font-semibold text-sm">Learning Profile</span></div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {twin.learning_speed && <span className={`text-xs px-3 py-1 rounded-full font-medium ${speedBadge(twin.learning_speed)}`}>{twin.learning_speed === 'fast' ? 'Fast Learner' : twin.learning_speed === 'medium' ? 'Steady Learner' : 'Needs Support'}</span>}
                  {twin.best_study_time && <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-50 text-blue-700 flex items-center gap-1"><Clock size={11} />Best: {twin.best_study_time}</span>}
                </div>
                {parseJ(twin.revision_schedule).length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Next 3 Days</div>
                    <div className="grid grid-cols-3 gap-2">
                      {parseJ(twin.revision_schedule).map((s: any, i: number) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="text-xs text-gray-400 mb-1">{new Date(s.day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                          <div className="text-2xl font-bold text-blue-600">{s.sessions}</div>
                          <div className="text-xs text-gray-400">sessions</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {profiles.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-blue-600" /><span className="font-semibold text-sm">Course Levels</span></div>
                <div className="space-y-3">
                  {profiles.map((p: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 font-medium">{p.course_title || `Course ${p.course_id}`}</span>
                        <span className="text-gray-400">Level {p.difficulty_level}/10 · {Math.round(p.avg_score || 0)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor(p.difficulty_level)}`} style={{ width: `${(p.difficulty_level || 0) * 10}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!twin && profiles.length === 0 && <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">Complete lessons and quizzes to see your profile.</div>}
          </div>
        )}

        {tab === 'Skill Gap' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3"><FileText size={16} className="text-blue-600" /><span className="font-semibold text-sm">Analyze Your Skills</span></div>
              <textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder="Paste your CV or describe your current skills..." rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none resize-none mb-3" />
              <button onClick={runAnalysis} disabled={analyzing || !cvText.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">{analyzing ? 'Analyzing...' : 'Analyze'}</button>
            </div>
            {latest && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <span className="font-semibold text-sm">Latest Analysis</span>
                {parseJ(latest.gaps).length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Gaps</div>
                    <div className="flex flex-wrap gap-2">{parseJ(latest.gaps).map((g: string, i: number) => <span key={i} className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full">{g}</span>)}</div>
                  </div>
                )}
                {parseJ(latest.recommendations).length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recommendations</div>
                    <ul className="space-y-1">{parseJ(latest.recommendations).map((r: string, i: number) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><ChevronRight size={14} className="text-blue-400 mt-0.5 shrink-0" />{r}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
            {analyses.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">History</div>
                <div className="space-y-2">
                  {analyses.slice(1).map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString('en-GB')}</span>
                      <span className="text-xs text-gray-700">{parseJ(a.gaps).length} gaps found</span>
                      <button onClick={() => setLatest(a)} className="text-xs text-blue-600 hover:underline">View</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'Competencies' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4"><Award size={16} className="text-blue-600" /><span className="font-semibold text-sm">Achieved Competencies</span></div>
            {competencies.length === 0
              ? <div className="text-center text-gray-400 text-sm py-8">No competencies earned yet.</div>
              : <div className="flex flex-wrap gap-2">{competencies.map((c: any, i: number) => <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium border border-blue-100">{c.name}</span>)}</div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
