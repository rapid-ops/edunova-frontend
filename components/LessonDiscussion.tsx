'use client';
import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';

interface Post { id: number; content: string; full_name: string; is_pinned: boolean; parent_id: number | null; created_at: string; }

export default function LessonDiscussion({ lessonId }: { lessonId: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<Post | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/discussions/${lessonId}`);
      setPosts(r.data.discussions || []);
    } catch { setPosts([]); }
  }, [lessonId]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/discussions', { lesson_id: lessonId, content, parent_id: replyTo ? replyTo.id : undefined });
      setText('');
      setReplyTo(null);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Could not post');
    } finally { setBusy(false); }
  };

  const top = posts.filter((p) => !p.parent_id);
  const card = (p: Post, reply: boolean) => (
    <div key={p.id} className={`rounded-xl border border-gray-200 bg-white p-3 ${reply ? 'ml-6' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-700">{p.full_name || 'Student'}</p>
        <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
      </div>
      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{p.content}</p>
      {!reply && <button onClick={() => setReplyTo(p)} className="mt-2 text-xs text-blue-600">Reply</button>}
    </div>
  );

  return (
    <div className="space-y-3">
      {!top.length && <p className="py-4 text-center text-sm text-gray-400">No discussion yet. Ask the first question.</p>}
      {top.map((p) => (
        <div key={p.id} className="space-y-2">
          {card(p, false)}
          {posts.filter((c) => c.parent_id === p.id).map((c) => card(c, true))}
        </div>
      ))}
      {replyTo && (
        <p className="text-xs text-gray-500">
          Replying to {replyTo.full_name || 'Student'}{' '}
          <button onClick={() => setReplyTo(null)} className="text-blue-600">Cancel</button>
        </p>
      )}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder={replyTo ? 'Write a reply...' : 'Ask a question...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <button onClick={submit} disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">Post</button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
