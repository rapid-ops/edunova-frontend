'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type Source = 'prompt' | 'pdf_text' | 'youtube_url';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const field = 'w-full min-h-[44px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500';
const primary = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50';

export default function AiCourseCreator() {
  const router = useRouter();
  const { user } = useAuthStore();
  const alive = useRef(true);
  const [source, setSource] = useState<Source>('prompt');
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'form' | 'working' | 'slow'>('form');
  const [error, setError] = useState('');

  useEffect(() => {
    alive.current = true;
    useAuthStore.getState().hydrate();
    return () => { alive.current = false; };
  }, []);

  const generate = async () => {
    const value = text.trim();
    if (source === 'youtube_url' && !/^https?:\/\/\S+$/i.test(value)) { setError('Paste the full YouTube link, starting with https://'); return; }
    if (source !== 'youtube_url' && value.length < 15) {
      setError(source === 'prompt' ? 'Describe the course in a sentence or two so the AI knows what to build.' : 'Paste a little more text from your document.');
      return;
    }
    setError('');
    setPhase('working');
    try {
      let baseline = 0;
      try {
        const m = await api.get('/courses/mine');
        baseline = Math.max(0, ...((m.data.courses || []).map((c: any) => Number(c.id) || 0)));
      } catch {}
      const body: Record<string, unknown> = { source_type: source, auto_create: true, school_id: user?.school_id, created_by: user?.id };
      if (source === 'prompt') body.prompt = value; else body.source_url = value;
      const r = await api.post('/ai/generate-course', body);
      const id = r.data.generation?.id;
      if (!id) throw new Error('missing');
      for (let i = 0; i < 80; i++) {
        await sleep(3000);
        if (!alive.current) return;
        let s: any = null;
        try { s = (await api.get('/ai/course-generations/' + id + '?after=' + baseline)).data; } catch {}
        if (s && s.status === 'ready' && s.course_id) { router.push('/teacher/courses/' + s.course_id + '?new=1'); return; }
        if (s && s.status === 'failed') {
          setPhase('form');
          setError('We could not build the course this time. Add a little more detail and try again.');
          return;
        }
      }
      setPhase('slow');
    } catch (e: any) {
      setPhase('form');
      setError(e.response?.data?.error || 'We could not start building the course. Please try again.');
    }
  };

  if (phase === 'working') {
    return (
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <Loader2 size={32} className="mx-auto animate-spin text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Building your course</h2>
        <p className="text-sm text-gray-600">This usually takes less than a minute. Please keep this page open. You will go to your new course as soon as it is ready.</p>
      </div>
    );
  }

  if (phase === 'slow') {
    return (
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">This is taking longer than usual</h2>
        <p className="text-sm text-gray-600">Your course is still being built. It will appear in My courses when it is ready.</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/teacher/courses" className={primary}>Go to My courses</Link>
          <button type="button" onClick={() => setPhase('form')} className="inline-flex min-h-[44px] items-center rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Create a course with AI</h2>
        <p className="mt-1 text-sm text-gray-600">The AI builds the course and its lessons. You can change everything afterwards and publish when you are happy.</p>
      </div>
      <div>
        <label htmlFor="src" className="mb-1 block text-sm font-medium text-gray-700">What should it use?</label>
        <select id="src" value={source} onChange={(e) => { setSource(e.target.value as Source); setText(''); setError(''); }} className={field}>
          <option value="prompt">Describe the course</option>
          <option value="pdf_text">Paste text from a document</option>
          <option value="youtube_url">Use a YouTube video</option>
        </select>
      </div>
      <div>
        <label htmlFor="src-text" className="mb-1 block text-sm font-medium text-gray-700">
          {source === 'prompt' ? 'Describe the course' : source === 'pdf_text' ? 'Paste the text' : 'YouTube link'}
        </label>
        {source === 'youtube_url' ? (
          <input id="src-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={field} />
        ) : (
          <textarea id="src-text" value={text} rows={source === 'prompt' ? 4 : 6} onChange={(e) => setText(e.target.value)}
            placeholder={source === 'prompt' ? 'For example: A beginner course on fractions for JSS1 students' : 'Paste the text of your notes or document here'} className={field} />
        )}
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button type="button" onClick={generate} className={primary}>Create course</button>
    </div>
  );
}
