'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock, ExternalLink, School, Users, Video } from 'lucide-react';
import api from '@/lib/api';
import { DAYS, byTime, errMsg, stateOf, when } from './util';

export default function MyClass() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/class-hub/mine').then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  if (!data && !error) return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  if (!data) return <div className="p-6 text-sm text-red-600">{error}</div>;

  const classes: any[] = data.classes || [];
  const sessions: any[] = data.sessions || [];
  const isParent = data.role === 'parent';

  if (classes.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-5">
        <h1 className="text-xl font-bold text-gray-900">{isParent ? 'Class' : 'My class'}</h1>
        <p className="mt-4 rounded-xl border border-gray-200 bg-white p-5 text-center text-sm text-gray-500">
          {isParent ? 'Your child has not been added to a class yet.' : 'You have not been added to a class yet.'} The school office will add {isParent ? 'them' : 'you'}.
        </p>
      </div>
    );
  }

  const SessionCard = ({ s }: { s: any }) => {
    const st = stateOf(s);
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{s.title}</p>
            <p className="mt-0.5 text-xs text-gray-500">{[s.course_title, s.teacher_name].filter(Boolean).join(' - ')}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st === 'live' ? 'bg-green-100 text-green-700' : st === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            {st === 'live' ? 'Open now' : st === 'upcoming' ? 'Upcoming' : 'Ended'}
          </span>
        </div>
        {s.scheduled_at && (
          <p className="mt-2 flex items-center gap-1 text-xs text-gray-600"><Clock size={12} /> {when(s.scheduled_at)}{s.duration_minutes ? ` - ${s.duration_minutes} min` : ''}</p>
        )}
        {st !== 'past' && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {s.meeting_url && (
              <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white"><Video size={14} /> Join class</a>
            )}
            {s.code && <span className="rounded-lg bg-gray-100 px-2.5 py-2 text-xs text-gray-600">Q&amp;A code <b className="text-gray-900">{s.code}</b></span>}
            <Link href="/dashboard/class-sessions" className="inline-flex min-h-10 items-center gap-1 px-1 text-sm font-medium text-blue-600">Questions <ExternalLink size={12} /></Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-5 text-gray-900">
      <h1 className="text-xl font-bold">{isParent ? 'Class' : 'My class'}</h1>
      {classes.map((c) => {
        const courseIds = new Set<number>((c.courses || []).map((x: any) => Number(x.id)));
        const mine: any[] = sessions.filter((s) => Number(s.class_id) === Number(c.id) || courseIds.has(Number(s.course_id)));
        const live = mine.filter((s) => stateOf(s) === 'live');
        const upcoming = mine.filter((s) => stateOf(s) === 'upcoming').sort(byTime);
        const past = mine.filter((s) => stateOf(s) === 'past').slice(0, 5);
        const slots: any[] = c.timetable || [];
        return (
          <section key={c.id} className="space-y-5">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><School size={18} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold">{c.name}{c.grade_level ? ` - ${c.grade_level}` : ''}</p>
                  <p className="truncate text-xs text-gray-500">
                    {[c.teacher_name ? `Class teacher: ${c.teacher_name}` : 'No class teacher yet', c.room ? `Room ${c.room}` : ''].filter(Boolean).join(' - ')}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500"><Users size={13} /> {c.student_count}</span>
              </div>
              {isParent && c.children && c.children.length > 0 && <p className="mt-2 text-xs text-gray-500">For: {c.children.join(', ')}</p>}
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-700">Courses</h2>
              {(c.courses || []).length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-400">No courses added to this class yet.</p>}
              {(c.courses || []).map((co: any) => (
                <div key={co.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <p className="min-w-0 truncate text-sm font-medium">{co.title}</p>
                  <p className="shrink-0 text-xs text-gray-500">{co.teacher_name || 'No teacher yet'}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-700">Weekly timetable</h2>
              {slots.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-400">No lecture times have been set yet.</p>}
              {DAYS.map((day) => {
                const list = slots.filter((x) => x.day_of_week === day);
                if (!list.length) return null;
                return (
                  <div key={day} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <p className="border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{day}</p>
                    {list.map((x) => (
                      <div key={x.id} className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5 last:border-b-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{x.course_title}</p>
                          <p className="truncate text-xs text-gray-500">{x.teacher_name || ''}</p>
                        </div>
                        <p className="shrink-0 text-xs text-gray-600">{x.start_time} - {x.end_time}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Live sessions</h2>
              {mine.length === 0 && <p className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm text-gray-400">No live sessions yet.</p>}
              {live.length > 0 && <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Open now</p>}
              {live.map((s) => <SessionCard key={s.id} s={s} />)}
              {upcoming.length > 0 && <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Upcoming</p>}
              {upcoming.map((s) => <SessionCard key={s.id} s={s} />)}
              {past.length > 0 && <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Earlier</p>}
              {past.map((s) => <SessionCard key={s.id} s={s} />)}
            </div>

            {!isParent && (c.classmates || []).length > 0 && (
              <details className="rounded-xl border border-gray-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700">Classmates ({c.classmates.length})</summary>
                <ul className="mt-3 grid grid-cols-1 gap-1 text-sm text-gray-700 sm:grid-cols-2">
                  {c.classmates.map((n: string, i: number) => <li key={i} className="truncate">{n}</li>)}
                </ul>
              </details>
            )}
          </section>
        );
      })}
    </div>
  );
}
