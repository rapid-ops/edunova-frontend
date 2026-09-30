'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LoadingScreen from '@/components/LoadingScreen';
import { ArrowLeft, ArrowRight, CheckCircle, Video, BookOpen, MessageCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

function LessonContent() {
  const router = useRouter();
  const { id } = useParams();
  const [lesson, setLesson] = useState<any>(null);
  const [allLessons, setAllLessons] = useState<any[]>([]);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState('');
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const isStudent = user.role === 'student';

  useEffect(() => {
    fetchLesson();
    const saved = localStorage.getItem(`note_${id}`);
    if (saved) setNote(saved);
  }, [id]);

  const fetchLesson = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API}/lessons/${id}`, { headers });
      const d = await res.json();
      setLesson(d.lesson);
      if (d.lesson?.course_id) {
        const [lessonsRes, discRes] = await Promise.all([
          fetch(`${API}/lessons/course/${d.lesson.course_id}`, { headers }).then(r => r.json()),
          fetch(`${API}/discussions/${id}`, { headers }).then(r => r.json()),
        ]);
        setAllLessons(lessonsRes.lessons || []);
        setDiscussions(discRes.discussions || []);
        if (isStudent && user.id) {
          const progRes = await fetch(`${API}/progress/${user.id}/${d.lesson.course_id}`, { headers }).then(r => r.json());
          const prog = (progRes.progress || []).find((p: any) => p.lesson_id === Number(id));
          setCompleted(prog?.completed || false);
        }
        if (d.lesson.video_url) {
          const url = d.lesson.video_url;
          if (url.includes('youtube.com/watch?v=')) {
            setVideoEmbedUrl(`https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`);
          } else if (url.includes('youtu.be/')) {
            setVideoEmbedUrl(`https://www.youtube.com/embed/${url.split('youtu.be/')[1]?.split('?')[0]}`);
          }
        }
      }
    } catch {}
    setLoading(false);
  };

  const currentIndex = allLessons.findIndex(l => l.id === Number(id));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const markComplete = async () => {
    if (!isStudent || completed) return;
    setMarking(true);
    try {
      await fetch(`${API}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: user.id, lesson_id: Number(id), course_id: lesson.course_id, watch_percent: 100, completed: true, school_id: user.school_id }),
      });
      setCompleted(true);
    } catch {}
    setMarking(false);
  };

  const markAndNext = async () => {
    await markComplete();
    if (nextLesson) router.push(`/dashboard/lessons/${nextLesson.id}`);
    else router.push(`/dashboard/courses/${lesson?.course_id}`);
  };

  const saveNote = () => localStorage.setItem(`note_${id}`, note);

  const postComment = async () => {
    if (!comment.trim()) return;
    try {
      await fetch(`${API}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lesson_id: Number(id), school_id: user.school_id, user_id: user.id, content: comment }),
      });
      setComment('');
      const res = await fetch(`${API}/discussions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setDiscussions(d.discussions || []);
    } catch {}
  };

  const upvote = async (discussion_id: number) => {
    try {
      await fetch(`${API}/discussions/${discussion_id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: user.id }),
      });
      const res = await fetch(`${API}/discussions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setDiscussions(d.discussions || []);
    } catch {}
  };

  if (loading) return <LoadingScreen />;
  if (!lesson) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Lesson not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-32">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => router.push(`/dashboard/courses/${lesson.course_id}`)}><ArrowLeft size={20} className="text-gray-500" /></button>
        <div className="flex-1 mx-3 text-center">
          <p className="text-xs text-gray-400">Lesson {currentIndex + 1} of {allLessons.length}</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{lesson.title}</p>
        </div>
        {completed ? <CheckCircle size={20} className="text-green-500" /> : <div className="w-5" />}
      </div>

      {allLessons.length > 0 && (
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${((currentIndex + 1) / allLessons.length) * 100}%` }} />
        </div>
      )}

      <div className="px-4 py-5 space-y-4">
        {videoEmbedUrl && (
          <div className="bg-black rounded-xl overflow-hidden aspect-video">
            <iframe src={videoEmbedUrl} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
          </div>
        )}

        {lesson.video_url && !videoEmbedUrl && (
          <a href={lesson.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-600 font-medium text-sm">
            <Video size={16} />Watch Video
          </a>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
            <BookOpen size={16} className="text-blue-600" />
            <h2 className="font-bold text-gray-900">{lesson.title}</h2>
          </div>
          {lesson.content ? (
            <div className="prose prose-sm max-w-none text-gray-800 prose-headings:text-gray-900 prose-headings:font-bold prose-p:leading-relaxed prose-li:leading-relaxed">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No content added yet.</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setShowNotes(!showNotes)} className="w-full flex items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">My Notes</span>
            {showNotes ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {showNotes && (
            <div className="px-4 pb-4 border-t border-gray-50">
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Write your notes for this lesson..." rows={4} className="w-full bg-gray-50 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none resize-none mt-3 border border-gray-100 focus:ring-2 focus:ring-blue-500" />
              <button onClick={saveNote} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-medium">Save Notes</button>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button onClick={() => setShowDiscussion(!showDiscussion)} className="w-full flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle size={15} className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Discussion</span>
              {discussions.length > 0 && <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{discussions.length}</span>}
            </div>
            {showDiscussion ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {showDiscussion && (
            <div className="border-t border-gray-50">
              <div className="px-4 py-3 flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && postComment()} placeholder="Ask a question or share a thought..." className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={postComment} className="bg-blue-600 text-white w-9 h-9 rounded-lg flex items-center justify-center shrink-0"><Send size={14} /></button>
              </div>
              <div className="divide-y divide-gray-50">
                {discussions.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No comments yet. Be first.</p>}
                {discussions.map((d: any) => (
                  <div key={d.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-900">{d.full_name}</span>
                      <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{d.content}</p>
                    <button onClick={() => upvote(d.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600">▲ {d.upvotes} helpful</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => prevLesson && router.push(`/dashboard/lessons/${prevLesson.id}`)} disabled={!prevLesson} className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30">
            <ArrowLeft size={15} />Prev
          </button>
          {isStudent ? (
            <button onClick={markAndNext} disabled={marking} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 ${completed ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'}`}>
              {completed ? <><CheckCircle size={16} />{nextLesson ? 'Next Lesson' : 'Finish Course'}</> : marking ? 'Saving...' : nextLesson ? 'Complete & Continue' : 'Complete Course'}
            </button>
          ) : (
            <div className="flex-1" />
          )}
          <button onClick={() => nextLesson && router.push(`/dashboard/lessons/${nextLesson.id}`)} disabled={!nextLesson} className="flex items-center gap-1.5 bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30">
            Next<ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LessonContent />
    </Suspense>
  );
}
