'use client';
import { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

// types/react-player.d.ts declares the v2 API but the installed package is v3
// (src prop, HTMLMediaElement-style ref), so the component is typed loosely.
const Player: any = ReactPlayer;

interface Props {
  src: string;
  initialPercent: number;
  completed: boolean;
  onSave: (percent: number, done: boolean) => void;
}

export default function LessonPlayer({ src, initialPercent, completed, onSave }: Props) {
  const ref = useRef<any>(null);
  const start = useRef(initialPercent);
  const seeked = useRef(false);
  const latest = useRef(initialPercent);
  const sent = useRef(initialPercent);
  const done = useRef(completed);
  const save = useRef(onSave);

  useEffect(() => { save.current = onSave; });
  useEffect(() => { if (completed) done.current = true; }, [completed]);

  useEffect(() => {
    const finish = (p: number) => {
      if (done.current) return;
      done.current = true;
      sent.current = p;
      save.current(p, true);
    };

    const tick = setInterval(() => {
      const el = ref.current;
      if (!el || !el.duration || !Number.isFinite(el.duration)) return;
      if (!seeked.current) {
        seeked.current = true;
        if (start.current > 0 && start.current < 95) {
          el.currentTime = (start.current / 100) * el.duration;
          return;
        }
      }
      const p = Math.min(100, Math.round((el.currentTime / el.duration) * 100));
      latest.current = p;
      if (p >= 90) finish(p);
    }, 1000);

    const saver = setInterval(() => {
      if (latest.current > sent.current) {
        sent.current = latest.current;
        save.current(latest.current, done.current);
      }
    }, 30000);

    return () => {
      clearInterval(tick);
      clearInterval(saver);
      if (latest.current > sent.current) save.current(latest.current, done.current);
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <Player
        ref={ref}
        src={src}
        controls
        playsInline
        width="100%"
        height="auto"
        style={{ aspectRatio: '16/9' }}
      />
    </div>
  );
}
