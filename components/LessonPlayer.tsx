'use client';
import { useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

// types/react-player.d.ts declares the v2 API but the installed package is v3
// (src, onTimeUpdate, HTMLMediaElement-style ref), so the component is typed loosely.
const Player: any = ReactPlayer;

interface Props {
  src: string;
  initialPercent: number;
  completed: boolean;
  onSave: (percent: number, done: boolean) => void;
}

export default function LessonPlayer({ src, initialPercent, completed, onSave }: Props) {
  const ref = useRef<any>(null);
  const seeked = useRef(false);
  const latest = useRef(initialPercent);
  const sent = useRef(initialPercent);
  const done = useRef(completed);
  const save = useRef(onSave);

  useEffect(() => { save.current = onSave; });
  useEffect(() => { if (completed) done.current = true; }, [completed]);

  const percent = () => {
    const el = ref.current;
    if (!el || !el.duration || !Number.isFinite(el.duration)) return latest.current;
    return Math.min(100, Math.round((el.currentTime / el.duration) * 100));
  };

  const seek = () => {
    const el = ref.current;
    if (seeked.current || !el || !el.duration || !Number.isFinite(el.duration)) return;
    seeked.current = true;
    if (initialPercent > 0 && initialPercent < 95) el.currentTime = (initialPercent / 100) * el.duration;
  };

  const finish = (p: number) => {
    if (done.current) return;
    done.current = true;
    sent.current = p;
    save.current(p, true);
  };

  const onTime = () => {
    const p = percent();
    latest.current = p;
    if (p >= 90) finish(p);
  };

  useEffect(() => {
    const t = setInterval(() => {
      if (latest.current > sent.current) {
        sent.current = latest.current;
        save.current(latest.current, done.current);
      }
    }, 30000);
    return () => {
      clearInterval(t);
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
        onReady={seek}
        onDurationChange={seek}
        onTimeUpdate={onTime}
        onEnded={() => finish(100)}
      />
    </div>
  );
}
