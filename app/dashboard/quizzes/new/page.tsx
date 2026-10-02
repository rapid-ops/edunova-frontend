'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import QuizSettingsForm, { QuizSettings, emptySettings, settingsToPayload } from '@/components/QuizSettingsForm';
import { ChevronLeft } from 'lucide-react';

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState(params.get('course_id') || '');
  const [settings, setSettings] = useState<QuizSettings>(emptySettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let u: any = {};
    try { u = JSON.parse(localStorage.getItem('user') || '{}'); } catch {}
    if (u.school_id) {
      api.get(`/courses/school/${u.school_id}`)
        .then(res => setCourses(res.data.courses || []))
        .catch(() => {});
    }
  }, []);

  const save = async () => {
    setError('');
    if (!courseId || !settings.title.trim()) { setError('Course and title are required'); return; }
    setSaving(true);
    try {
      const res = await api.post('/quiz', { course_id: Number(courseId), ...settingsToPayload(settings) });
      router.replace(`/dashboard/quizzes/${res.data.quiz.id}`);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not create quiz');
      setSaving(false);
    }
  };

  const input = 'w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <button onClick={() => router.back()} className="text-blue-600"><ChevronLeft size={22} /></button>
        <h1 className="text-lg font-bold">New Quiz</h1>
      </div>
      <div className="px-4 py-4 space-y-3">
        {courses.length > 0 ? (
          <select value={courseId} onChange={e => setCourseId(e.target.value)} className={input}>
            <option value="">Select a course</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        ) : (
          <input value={courseId} onChange={e => setCourseId(e.target.value)} type="number" placeholder="Course ID" className={input} />
        )}
        <QuizSettingsForm value={settings} onChange={setSettings} />
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}
        <button onClick={save} disabled={saving} className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl disabled:opacity-50">
          {saving ? 'Creating...' : 'Create and add questions'}
        </button>
      </div>
    </div>
  );
}

export default function NewQuizPage() {
  return <Suspense fallback={<LoadingScreen />}><Form /></Suspense>;
}
