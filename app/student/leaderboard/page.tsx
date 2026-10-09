'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Medal } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type Period = 'all_time' | 'monthly' | 'weekly';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('all_time');
  const [loading, setLoading] = useState(true);

  useEffect(() => { useAuthStore.getState().hydrate(); }, []);

  useEffect(() => {
    if (!user?.school_id) return;
    setLoading(true);
    api.get(`/gamification/leaderboard/${user.school_id}?period=${period}`)
      .then(r => setEntries(r.data.entries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, period]);

  const medalColor = (rank: number) =>
    rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-gray-300';

  const rowBg = (rank: number, studentId: number) => {
    if (studentId === user?.id) return 'bg-blue-50 border-blue-200';
    if (rank === 1) return 'bg-yellow-50 border-yellow-100';
    if (rank === 2) return 'bg-gray-50 border-gray-100';
    if (rank === 3) return 'bg-amber-50 border-amber-100';
    return 'bg-white border-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="text-xs text-blue-600 mb-4 hover:underline">← Back</button>
      <div className="flex items-center gap-2 mb-6">
        <Trophy size={22} className="text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
      </div>

      <div className="flex gap-2 mb-5">
        {(['all_time', 'monthly', 'weekly'] as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 text-sm rounded-lg capitalize transition-colors ${period === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {p.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 text-sm py-10">Loading...</div>
      ) : !entries.length ? (
        <div className="text-center text-gray-400 text-sm py-10">No entries yet.</div>
      ) : (
        <div className="space-y-2">
          {entries.map((e: any) => (
            <div key={e.student_id} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${rowBg(e.rank, e.student_id)}`}>
              <div className="w-8 text-center">
                {e.rank <= 3
                  ? <Medal size={18} className={medalColor(e.rank)} />
                  : <span className="text-sm text-gray-400 font-medium">{e.rank}</span>}
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                {e.full_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {e.full_name} {e.student_id === user?.id && <span className="text-blue-600 text-xs">(You)</span>}
                </p>
                {e.level && <p className="text-xs text-gray-400">Level {e.level}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{e.points}</p>
                <p className="text-xs text-gray-400">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
