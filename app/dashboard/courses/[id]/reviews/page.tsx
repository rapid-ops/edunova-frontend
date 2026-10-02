'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';
import { ChevronLeft, Star, Trash2 } from 'lucide-react';

const Stars = ({ value, size = 16 }: { value: number; size?: number }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={size} className={n <= Math.round(value) ? 'text-blue-600 fill-blue-600' : 'text-gray-300'} />
    ))}
  </span>
);

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function CourseReviewsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmDel, setConfirmDel] = useState<string | number | null>(null);

  const load = async () => {
    try {
      const res = await api.get(`/reviews/course/${id}`);
      setData(res.data);
      if (res.data.my_review) {
        setRating(res.data.my_review.rating);
        setComment(res.data.my_review.comment || '');
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not load reviews');
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/auth/login'); return; }
    let r = 'student';
    try { r = JSON.parse(localStorage.getItem('user') || '{}').role || 'student'; } catch {}
    setRole(r);
    load();
  }, [id]);

  const save = async () => {
    setError(''); setNotice('');
    if (rating < 1) { setError('Tap a star to choose your rating'); return; }
    setSaving(true);
    try {
      await api.put(`/reviews/course/${id}`, { rating, comment });
      setNotice(data?.my_review ? 'Your review was updated' : 'Thanks for your review');
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not save your review');
    }
    setSaving(false);
  };

  const removeMine = async () => {
    setError(''); setNotice('');
    try {
      await api.delete(`/reviews/course/${id}/mine`);
      setRating(0); setComment(''); setConfirmDel(null);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not delete your review');
    }
  };

  const moderate = async (rid: number) => {
    setError(''); setNotice('');
    try {
      await api.delete(`/reviews/${rid}`);
      setConfirmDel(null);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Could not remove the review');
    }
  };

  if (loading) return <LoadingScreen />;
  if (!data) return <div className="p-6 text-sm text-red-600">{error || 'Not found'}</div>;

  const s = data.summary;
  const isAdmin = ['school_admin', 'super_admin'].includes(role);
  const others = (data.reviews || []).filter((v: any) => !v.mine);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <button onClick={() => router.push(`/dashboard/courses/${id}`)} className="text-blue-600"><ChevronLeft size={22} /></button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold truncate">Ratings and reviews</h1>
          <p className="text-xs text-gray-400 truncate">{data.course_title}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
          <div className="text-center shrink-0">
            <p className="text-3xl font-bold text-blue-600">{s.count ? s.average.toFixed(1) : '–'}</p>
            <Stars value={s.average} size={14} />
            <p className="text-xs text-gray-400 mt-1">{s.count} rating{s.count === 1 ? '' : 's'}</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map(n => (
              <div key={n} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2">{n}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${s.count ? (s.distribution[n] / s.count) * 100 : 0}%` }} />
                </div>
                <span className="w-4 text-right">{s.distribution[n]}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">{error}</div>}
        {notice && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3">{notice}</div>}

        {data.can_review && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold">{data.my_review ? 'Your review' : 'Rate this course'}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} star${n === 1 ? '' : 's'}`}>
                  <Star size={30} className={n <= rating ? 'text-blue-600 fill-blue-600' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} maxLength={1000}
              placeholder="Share what you thought (optional)"
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm" />
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="flex-1 bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-50">
                {saving ? 'Saving...' : data.my_review ? 'Update review' : 'Post review'}
              </button>
              {data.my_review && confirmDel !== 'mine' && (
                <button onClick={() => setConfirmDel('mine')} className="px-3 border border-gray-200 rounded-lg text-gray-400"><Trash2 size={16} /></button>
              )}
            </div>
            {confirmDel === 'mine' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <p className="text-sm text-red-600">Delete your review?</p>
                <div className="flex gap-2">
                  <button onClick={removeMine} className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg">Delete</button>
                  <button onClick={() => setConfirmDel(null)} className="flex-1 bg-white border border-gray-200 text-sm py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {role === 'student' && !data.can_review && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-500">Only students enrolled in this course can rate it.</div>
        )}

        {others.length === 0 && !data.my_review && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-sm text-gray-400">No reviews yet</div>
        )}

        {others.map((v: any) => (
          <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold truncate">{v.student_name}</p>
              <Stars value={v.rating} size={13} />
            </div>
            <p className="text-xs text-gray-400">{fmt(v.updated_at || v.created_at)}</p>
            {v.comment && <p className="text-sm whitespace-pre-wrap">{v.comment}</p>}
            {isAdmin && confirmDel !== v.id && (
              <button onClick={() => setConfirmDel(v.id)} className="text-xs text-red-500 pt-1">Remove review</button>
            )}
            {isAdmin && confirmDel === v.id && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2 mt-2">
                <p className="text-sm text-red-600">Remove this review?</p>
                <div className="flex gap-2">
                  <button onClick={() => moderate(v.id)} className="flex-1 bg-red-600 text-white text-sm font-medium py-2 rounded-lg">Remove</button>
                  <button onClick={() => setConfirmDel(null)} className="flex-1 bg-white border border-gray-200 text-sm py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
