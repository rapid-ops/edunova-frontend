'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function ParentChildrenPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, any>>({});
  const [aiSummary, setAiSummary] = useState<Record<number, string>>({});
  const [aiLoading, setAiLoading] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/parents/children')
      .then(r => setChildren(r.data.children || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const toggleChild = async (child: any) => {
    if (expanded === child.id) { setExpanded(null); return; }
    setExpanded(child.id);
    if (details[child.id]) return;
    try {
      const [enr, grades, att] = await Promise.all([
        api.get(`/enrollments/student/${child.id}`).catch(() => ({ data: { enrollments: [] } })),
        api.get(`/gradebooks/student/${child.id}`).catch(() => ({ data: { grades: [] } })),
        api.get(`/attendances/student/${child.id}`).catch(() => ({ data: {} }))
      ]);
      setDetails(prev => ({
        ...prev,
        [child.id]: {
          enrollments: enr.data.enrollments || [],
          grades: grades.data.grades || [],
          attendance: att.data.summary || att.data
        }
      }));
    } catch {}
  };

  const getAiSummary = async (child: any) => {
    setAiLoading(prev => ({ ...prev, [child.id]: true }));
    try {
      const r = await api.post('/ai/school-admin-query', {
        query: `Summarize academic progress for student ${child.full_name}`,
        student_id: child.id
      });
      setAiSummary(prev => ({ ...prev, [child.id]: r.data.response || r.data.answer || 'No summary available.' }));
    } catch {
      setAiSummary(prev => ({ ...prev, [child.id]: 'AI summary unavailable right now.' }));
    } finally { setAiLoading(prev => ({ ...prev, [child.id]: false })); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="text-xs text-blue-600 mb-4 hover:underline">← Back</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Children</h1>

      {!children.length ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
          No linked children. Contact school admin.
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child: any) => {
            const open = expanded === child.id;
            const d = details[child.id];
            return (
              <div key={child.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => toggleChild(child)} className="w-full flex items-center justify-between p-4">
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{child.full_name}</p>
                    <p className="text-xs text-gray-400">{child.class_name || 'Class not set'} · {child.school_name || ''}</p>
                  </div>
                  {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {open && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {!d ? (
                      <p className="text-gray-400 text-sm">Loading...</p>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Enrolled Courses</p>
                          {d.enrollments.length ? d.enrollments.map((e: any) => (
                            <p key={e.id} className="text-sm text-gray-700">{e.course_title}</p>
                          )) : <p className="text-sm text-gray-400">None</p>}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Recent Grades</p>
                          {d.grades.length ? d.grades.slice(0, 5).map((g: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm text-gray-700">
                              <span>{g.subject || g.course_title || 'Subject'}</span>
                              <span className="font-medium">{g.score ?? g.grade ?? '—'}</span>
                            </div>
                          )) : <p className="text-sm text-gray-400">No grades yet</p>}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Attendance Rate</p>
                          <p className="text-sm text-gray-700">{d.attendance?.rate ?? '—'}%</p>
                        </div>
                        <div>
                          {aiSummary[child.id] ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-gray-700">
                              {aiSummary[child.id]}
                            </div>
                          ) : (
                            <button
                              onClick={() => getAiSummary(child)}
                              disabled={aiLoading[child.id]}
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                              <Brain size={15} />{aiLoading[child.id] ? 'Generating...' : 'AI Progress Summary'}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
