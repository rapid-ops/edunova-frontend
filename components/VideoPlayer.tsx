'use client';
import { useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface Props {
  url: string;
  lessonId: string;
  initialProgress?: number;
  onComplete?: () => void;
  onProgressSave?: (pct: number) => void;
}

export default function VideoPlayer({ url, lessonId, initialProgress = 0, onComplete, onProgressSave }: Props) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [lastSaved, setLastSaved] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [seeked, setSeeked] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!seeked && initialProgress > 0 && playerRef.current) {
      playerRef.current.seekTo(initialProgress / 100, 'fraction');
      setSeeked(true);
    }
  }, [initialProgress, seeked]);

  function resetHideTimer() {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }

  function handleProgress({ played: p }: { played: number }) {
    setPlayed(p);
    const pct = Math.round(p * 100);
    if (pct % 10 === 0 && pct !== lastSaved && pct > 0) {
      setLastSaved(pct);
      onProgressSave?.(pct);
    }
    if (pct >= 90 && !completed) {
      setCompleted(true);
      onComplete?.();
    }
  }

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  function toggleFullscreen() {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(f => !f);
  }

  return (
    <div ref={containerRef} className="relative bg-black rounded-xl overflow-hidden select-none"
      onMouseMove={resetHideTimer} onTouchStart={resetHideTimer}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={speed}
        width="100%"
        height="100%"
        style={{ aspectRatio: '16/9' }}
        onProgress={handleProgress}
        onDuration={setDuration}
        config={{ youtube: { playerVars: { controls: 0 } } }}
      />

      {/* Controls overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Seek bar */}
        <input type="range" min={0} max={1} step={0.001} value={played}
          onChange={e => { const v = Number(e.target.value); playerRef.current?.seekTo(v, 'fraction'); setPlayed(v); }}
          className="w-full h-1 accent-blue-500 mb-2 cursor-pointer" />

        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button onClick={() => setPlaying(p => !p)}>
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={() => setMuted(m => !m)}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
              onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
              className="w-16 h-1 accent-blue-500" />
            <span>{fmt(played * duration)} / {fmt(duration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
              className="bg-transparent text-white text-xs border border-white/30 rounded px-1 py-0.5">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => <option key={s} value={s}>{s}x</option>)}
            </select>
            <button onClick={toggleFullscreen}>
              {fullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Play button overlay */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => setPlaying(true)}>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Play size={28} className="text-white fill-white" />
          </div>
        </div>
      )}
    </div>
  );
}
