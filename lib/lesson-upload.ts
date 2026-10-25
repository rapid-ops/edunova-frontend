import api from '@/lib/api';

export const MAX_MB = 50;
const ALLOWED = ['mp4', 'mov', 'webm', 'pdf', 'docx', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'webp'];

export async function uploadLessonFile(lessonId: number | string, file: File, onProgress?: (pct: number) => void) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED.includes(ext)) throw new Error('This file type is not allowed. You can upload videos, PDF, Word, PowerPoint and pictures.');
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`This file is too big. The limit is ${MAX_MB} MB. Try pasting a video link instead.`);
  const fd = new FormData();
  fd.append('file', file);
  try {
    await api.post(`/lessons/${lessonId}/file`, fd, {
      onUploadProgress: (e: any) => { if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100)); },
    });
  } catch (e: any) {
    if (!e?.response) throw new Error('Could not connect. Check your internet and try again.');
    throw new Error(e.response.data?.error || 'The file could not be uploaded. Please try again.');
  }
}
