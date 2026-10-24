'use client';
import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { ExternalLink } from 'lucide-react';

const Player: any = ReactPlayer;

interface Props {
  url: string;
  lessonId: string;
  initialProgress?: number;
  onComplete?: () => void;
  onProgressSave?: (pct: number) => void;
}

function driveId(u: string) {
  try {
    const x = new URL(u);
    if (x.hostname !== 'drive.google.com') return null;
    const m = x.pathname.match(/\/file\/d\/([\w-]+)/);
    const id = m ? m[1] : x.searchParams.get('id');
    return id && /^[\w-]+$/.test(id) ? id : null;
  } catch { return null; }
}

function Fallback({ url }: { url: string }) {
  return (
    <div className="rounded-xl bg-gray-100 p-5 text-center">
      <p className="text-sm text-gray-700 mb-3">This video can&apos;t play inside Edunova.</p>
      {url.startsWith('https://') && (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 min-h-[44px] rounded-lg text-sm">
          <ExternalLink size={16} /> Open video in a new tab
        </a>
      )}
    </div>
  );
}

export default function VideoPlayer({ url, initialProgress = 0, onComplete, onProgressSave }: Props) {
  const ref = useRef<any>(null);
  const start = useRef(initialProgress);
  const seeked = useRef(false);
  const latest = useRef(initialProgress);
  const sent = useRef(initialProgress);
  const done = useRef(false);
  const save = useRef(onProgressSave);
  const finish = useRef(onComplete);
  const [failed, setFailed] = useState(false);
  const [finished, setFinished] = useState(false);
  const drive = driveId(url);

  useEffect(() => { save.current = onProgressSave; finish.current = onComplete; });

  useEffect(() => {
    if (drive) return;
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
      if (p >= 90 && !done.current) { done.current = true; sent.current = p; finish.current?.(); }
    }, 1000);
    const saver = setInterval(() => {
      if (latest.current > sent.current) { sent.current = latest.current; save.current?.(latest.current); }
    }, 30000);
    return () => {
      clearInterval(tick); clearInterval(saver);
      if (latest.current > sent.current) save.current?.(latest.current);
    };
  }, [drive]);

  if (!url.startsWith('https://') || failed) return <Fallback url={url} />;

  if (drive) {
    return (
      <div>
        <iframe
          src={`https://drive.google.com/file/d/${drive}/preview`}
          className="w-full aspect-video bg-black"
          allow="autoplay; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          title="Lesson video"
        />
        <div className="bg-white p-3 text-center">
          <p className="text-xs text-gray-500 mb-2">Progress for Google Drive videos is saved when you tap the button below.</p>
          <button
            disabled={finished}
            onClick={() => { setFinished(true); onComplete?.(); }}
            className="bg-blue-600 disabled:bg-gray-300 text-white px-4 min-h-[44px] rounded-lg text-sm"
          >
            {finished ? 'Marked as watched' : 'I finished watching'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-black">
      <Player ref={ref} src={url} controls playsInline width="100%" height="auto"
        style={{ aspectRatio: '16/9' }} onError={() => setFailed(true)} />
    </div>
  );
}
