'use client';
import { useEffect, useState } from 'react';
import { FileText, Paperclip, Trash2, Upload } from 'lucide-react';
import api from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';
import { uploadLessonFile, MAX_MB } from '@/lib/lesson-upload';

interface Props {
  lessonId: number | string;
  name?: string | null;
  type?: string | null;
  size?: number | string | null;
  canManage?: boolean;
  onChanged?: () => void;
}

const mb = (n: number) => (n / 1024 / 1024).toFixed(1) + ' MB';

export default function LessonFile({ lessonId, name, type, size, canManage, onChanged }: Props) {
  const [url, setUrl] = useState('');
  const [fileType, setFileType] = useState(type || '');
  const [err, setErr] = useState<{ retry: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setErr(null); setUrl('');
    try {
      const r = await api.get(`/lessons/${lessonId}/file`);
      setUrl(r.data.file.url);
      setFileType(r.data.file.type);
    } catch (e: any) {
      const s = e?.response?.status;
      if (!e?.response) setErr({ retry: true, msg: 'Could not connect. Check your internet and try again.' });
      else if (s === 403) setErr({ retry: false, msg: e.response.data?.error || 'You do not have access to this file' });
      else setErr({ retry: true, msg: 'The file could not be opened. Please try again.' });
    }
  };

  useEffect(() => { if (name) load(); else { setUrl(''); setErr(null); } }, [lessonId, name]);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true); setPct(0); setMsg('');
    try { await uploadLessonFile(lessonId, f, setPct); setMsg('File uploaded.'); onChanged?.(); }
    catch (er: any) { setMsg(er.message); }
    setBusy(false);
  };

  const remove = async () => {
    if (!confirm('Remove this file from the lesson?')) return;
    try { await api.delete(`/lessons/${lessonId}/file`); setMsg('File removed.'); onChanged?.(); }
    catch { setMsg('The file could not be removed. Please try again.'); }
  };

  if (!name && !canManage) return null;

  return (
    <div className="bg-white rounded-xl border p-4 mb-4">
      <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2 text-sm"><Paperclip size={16} /> Lesson file</div>
      {name && (
        <>
          <p className="text-sm text-gray-700 break-words">{name}{size ? ` (${mb(Number(size))})` : ''}</p>
          {err && (
            <div className="mt-2">
              <p className="text-sm text-red-500">{err.msg}</p>
              {err.retry && <button onClick={load} className="mt-1 text-blue-600 text-sm min-h-[44px]">Retry</button>}
            </div>
          )}
          {url && fileType === 'video' && <div className="mt-3 rounded-xl overflow-hidden"><VideoPlayer url={url} lessonId={String(lessonId)} /></div>}
          {url && fileType === 'image' && <img src={url} alt={name} className="mt-3 max-w-full rounded-xl" />}
          {url && fileType !== 'video' && fileType !== 'image' && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 bg-blue-600 text-white px-4 min-h-[44px] rounded-lg text-sm">
              <FileText size={16} /> {fileType === 'pdf' ? 'Open file' : 'Download file'}
            </a>
          )}
        </>
      )}
      {canManage && (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className={`inline-flex items-center gap-2 px-4 min-h-[44px] rounded-lg text-sm cursor-pointer border border-gray-200 ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={16} /> {name ? 'Replace file' : 'Upload a file'}
              <input type="file" className="hidden" onChange={pick} accept=".mp4,.mov,.webm,.pdf,.docx,.pptx,.jpg,.jpeg,.png,.gif,.webp" />
            </label>
            {name && <button onClick={remove} className="inline-flex items-center gap-2 text-red-500 text-sm min-h-[44px]"><Trash2 size={16} /> Remove file</button>}
          </div>
          {busy && (
            <div className="mt-2">
              <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
              <p className="text-xs text-gray-500 mt-1">Uploading {pct}%</p>
            </div>
          )}
          <p className="mt-2 text-xs text-gray-400">Videos, PDF, Word, PowerPoint and pictures up to {MAX_MB} MB.</p>
        </>
      )}
      {msg && <p className="mt-2 text-sm text-gray-600">{msg}</p>}
    </div>
  );
}
