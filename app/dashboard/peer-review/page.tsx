'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Review { id: number; full_name: string; score: number; feedback: string; credits_earned: number; created_at: string; }
export default function PeerReviewPage() {
  const router = useRouter();
  const params = useSearchParams();
  const submission_id = params.get('submission_id');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [credits, setCredits] = useState(0);
  const [form, setForm] = useState({ score: '', feedback: '' });
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => {
    if (!submission_id) return;
    fetch(`${API}/api/peer-review/${submission_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setReviews(d.reviews || []); setLoading(false); });
    fetch(`${API}/api/peer-review/credits/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setCredits(d.credits?.credits || 0));
  };
  useEffect(() => { load(); }, [submission_id]);
  const submit = async () => { if (!form.score || !form.feedback.trim()) return; await fetch(`${API}/api/peer-review`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ submission_id: Number(submission_id), reviewer_id: user.id, score: Number(form.score), feedback: form.feedback }) }); setForm({ score: '', feedback: '' }); load(); };
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Peer Reviews</h1></div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium">{credits} Credits</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Submit Review <span className="text-xs text-green-600 font-normal">+1 credit</span></h2>
          <div className="flex gap-3 mb-3"><input type="number" value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} placeholder="Score (0-100)" min="0" max="100" className="w-32 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" /></div>
          <textarea value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} placeholder="Write your feedback..." rows={3} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none mb-3" />
          <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Submit Review</button>
        </div>
        <div className="space-y-3">
          {reviews.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No reviews yet.</div> : reviews.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2"><span className="font-medium text-sm text-gray-900">{r.full_name}</span><span className="text-blue-600 font-bold">{r.score}/100</span></div>
              <p className="text-sm text-gray-700">{r.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
