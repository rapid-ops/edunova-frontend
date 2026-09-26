'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Post { id: number; content: string; full_name: string; upvotes: number; is_pinned: boolean; parent_id: number | null; created_at: string; }
export default function Discussion({ lesson_id, school_id }: { lesson_id: number; school_id: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = ['school_admin','super_admin','teacher'].includes(user.role);
  const load = () => fetch(`${API}/api/discussions/${lesson_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setPosts(d.discussions || []));
  useEffect(() => { load(); }, [lesson_id]);
  const submit = async () => {
    if (!content.trim()) return;
    await fetch(`${API}/api/discussions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ lesson_id, school_id, user_id: user.id, parent_id: replyTo, content }) });
    setContent(''); setReplyTo(null); load();
  };
  const upvote = async (id: number) => { await fetch(`${API}/api/discussions/${id}/upvote`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ user_id: user.id }) }); load(); };
  const pin = async (id: number) => { await fetch(`${API}/api/discussions/${id}/pin`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }); load(); };
  const del = async (id: number) => { await fetch(`${API}/api/discussions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); load(); };
  const roots = posts.filter(p => !p.parent_id);
  const replies = (id: number) => posts.filter(p => p.parent_id === id);
  return (
    <div className="mt-8">
      <h3 className="font-semibold text-gray-900 mb-4">Discussion</h3>
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        {replyTo && <div className="text-xs text-blue-600 mb-2">Replying to comment · <button onClick={() => setReplyTo(null)} className="underline">cancel</button></div>}
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write a comment..." rows={2} className="w-full bg-gray-100 text-gray-900 rounded-lg px-3 py-2 text-sm outline-none resize-none mb-2" />
        <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Post</button>
      </div>
      <div className="space-y-3">
        {roots.map(p => (
          <div key={p.id} className={`bg-white border rounded-xl p-4 ${p.is_pinned ? 'border-blue-300' : 'border-gray-200'}`}>
            {p.is_pinned && <span className="text-xs text-blue-600 font-medium">📌 Pinned</span>}
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm text-gray-900">{p.full_name}</span>
              <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">{p.content}</p>
            <div className="flex gap-3 text-xs">
              <button onClick={() => upvote(p.id)} className="text-gray-500 hover:text-blue-600">▲ {p.upvotes}</button>
              <button onClick={() => setReplyTo(p.id)} className="text-gray-500 hover:text-blue-600">Reply</button>
              {isAdmin && <button onClick={() => pin(p.id)} className="text-gray-500 hover:text-blue-600">{p.is_pinned ? 'Unpin' : 'Pin'}</button>}
              {(isAdmin || user.id === p.id) && <button onClick={() => del(p.id)} className="text-red-400 hover:text-red-600">Delete</button>}
            </div>
            {replies(p.id).map(r => (
              <div key={r.id} className="ml-6 mt-3 bg-gray-50 border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-xs text-gray-900">{r.full_name}</span>
                  <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700">{r.content}</p>
              </div>
            ))}
          </div>
        ))}
        {roots.length === 0 && <div className="text-center text-gray-400 text-sm py-6">No comments yet. Be first.</div>}
      </div>
    </div>
  );
}
