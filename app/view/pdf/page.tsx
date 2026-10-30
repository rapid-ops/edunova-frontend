'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Download } from 'lucide-react';
import { fileSource } from '@/lib/fileurl';

declare global { interface Window { pdfjsLib?: any } }
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';

function loadPdfJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve(window.pdfjsLib);
    const s = document.createElement('script');
    s.src = CDN + 'pdf.min.js';
    s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = CDN + 'pdf.worker.min.js'; resolve(window.pdfjsLib); };
    s.onerror = () => reject(new Error('viewer'));
    document.head.appendChild(s);
  });
}

function Viewer() {
  const router = useRouter();
  const sp = useSearchParams();
  const src = fileSource(sp.get('u'));
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error');

  useEffect(() => {
    if (!src) return;
    let dead = false;
    (async () => {
      try {
        const [lib, r] = await Promise.all([loadPdfJs(), fetch(src)]);
        if (!r.ok) throw new Error('fetch');
        const data = new Uint8Array(await r.arrayBuffer());
        const pdf = await lib.getDocument({ data }).promise;
        const el = box.current;
        if (!el || dead) return;
        el.innerHTML = '';
        const width = el.clientWidth;
        const dpr = window.devicePixelRatio || 1;
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const vp = page.getViewport({ scale: (width / base.width) * dpr });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          canvas.style.width = width + 'px';
          canvas.style.height = vp.height / dpr + 'px';
          canvas.className = 'mb-3 bg-white shadow';
          el.appendChild(canvas);
          if (n === 1) setState('ready');
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          if (dead) return;
        }
      } catch { if (!dead) setState('error'); }
    })();
    return () => { dead = true; };
  }, [src]);

  const back = () => { if (window.history.length > 1) router.back(); else window.close(); };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-3">
        <button onClick={back} aria-label="Back" className="text-blue-600"><ChevronLeft size={24} /></button>
        <h1 className="flex-1 text-base font-semibold">Document</h1>
        {src && <a href={src} download className="flex items-center gap-1 text-sm font-medium text-blue-600"><Download size={16} /> Download</a>}
      </div>
      <div className="mx-auto max-w-3xl px-3 py-3">
        {state === 'loading' && <p className="py-10 text-center text-sm text-gray-500">Opening document...</p>}
        {state === 'error' && <p className="py-10 text-center text-sm text-red-600">The document could not be opened. Please try again.</p>}
        <div ref={box} />
      </div>
    </div>
  );
}

export default function PdfViewerPage() {
  return <Suspense fallback={null}><Viewer /></Suspense>;
}
