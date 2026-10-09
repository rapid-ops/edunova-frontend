'use client';
import { useEffect, useState } from 'react';
import { Zap, Flame, Star } from 'lucide-react';
import api from '@/lib/api';

interface Props { studentId: number; }

export default function GamificationWidget({ studentId }: Props) {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!studentId) return;
    api.get(`/gamification/profile/${studentId}`)
      .then(r => setProfile(r.data.profile))
      .catch(() => {});
  }, [studentId]);

  if (!profile) return null;

  const xpInLevel = (profile.total_xp || 0) % 100;
  const pct = xpInLevel;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {profile.level}
        </div>
        <div>
          <p className="text-xs text-gray-400">Level {profile.level}</p>
          <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-0.5">
            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{xpInLevel}/100 XP</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-orange-500">
        <Flame size={16} />
        <span className="text-sm font-semibold">{profile.streak_days || 0}</span>
        <span className="text-xs text-gray-400">day streak</span>
      </div>
      <div className="flex items-center gap-1 text-yellow-500">
        <Zap size={16} />
        <span className="text-sm font-semibold">{profile.points || 0}</span>
        <span className="text-xs text-gray-400">pts</span>
      </div>
      {profile.badges?.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {profile.badges.slice(0, 3).map((b: any) => (
            <span key={b.id} className="flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full border border-yellow-200">
              <Star size={10} />{b.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
