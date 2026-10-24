'use client';
import LoadingScreen from '@/components/LoadingScreen';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function PlatformAnalyticsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [cohort, setCohort] = useState<any[]>([]);
  const [completion, setCompletion] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [dropout, setDropout] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/schools').then(r => {
      const list = r.data.schools || [];
      setSchools(list);
      if (list[0]) { setSelectedSchool(list[0]); loadSchoolData(list[0].id); }
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadSchoolData = async (id: number) => {
    setLoading(true);
    try {
      const [cohortRes, completionRes, instRes, dropRes] = await Promise.all([
        api.get(`/analytics/cohort/${id}`),
        api.get(`/analytics/completion/${id}`),
        api.get(`/analytics/instructor/${id}`),
        api.get(`/analytics/dropout/${id}`),
      ]);
      setCohort(cohortRes.data.data || []);
      setCompletion(completionRes.data.data || []);
      setInstructors(instRes.data.data || []);
      setDropout(dropRes.data.data || []);
    } catch {}
    setLoading(false);
  };

  const maxCohort = Math.max(...cohort.map((d: any) => Number(d.active_students) || 0), 1);
  const maxComp = Math.max(...completion.map((d: any) => Number(d.enrolled) || 0), 1);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-blue-600 text-sm">← Back</button>
        <h1 className="text-lg font-bold">Platform Analytics</h1>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{schools.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Schools</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{completion.reduce((s: number, c: any) => s + Number(c.enrolled || 0), 0)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Enrollments</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{instructors.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Teachers</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-1">
          <select value={selectedSchool?.id} onChange={e => { const s = schools.find((x: any) => x.id === Number(e.target.value)); setSelectedSchool(s); loadSchoolData(Number(e.target.value)); }} className="w-full px-3 py-2 text-sm outline-none bg-transparent">
            {schools.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {cohort.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Weekly Active Students</p>
            <div className="flex items-end gap-1 h-24">
              {cohort.slice(0,12).map((d: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-blue-200 rounded-t" style={{ height: `${Math.max(4, (Number(d.active_students) / maxCohort) * 80)}px` }} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">Last 12 weeks</p>
          </div>
        )}

        {completion.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Course Completion</p>
            <div className="space-y-2">
              {completion.slice(0,8).map((c: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-gray-600 truncate max-w-[60%]">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.completed}/{c.enrolled}</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${c.enrolled > 0 ? (c.completed / c.enrolled) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {instructors.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Instructor Performance</p>
            <div className="space-y-2">
              {instructors.slice(0,5).map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">{t.full_name}</p>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t.students} students</p>
                    {t.avg_score && <p className="text-xs text-blue-600">avg {Number(t.avg_score).toFixed(1)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {dropout.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Dropout Risk</p>
            <div className="space-y-2">
              {dropout.slice(0,10).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">{d.full_name || d.email}</p>
                  <p className="text-xs text-gray-400">{d.events_last_7d} events/7d</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
