'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Download, FileText } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

export default function StudentResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [gradebook, setGradebook] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genPdf, setGenPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [transcriptUrl, setTranscriptUrl] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/results/student/${user.id}`, { headers: h }).then(r => r.json()),
      fetch(`${API}/gradebooks/student/${user.id}`, { headers: h }).then(r => r.json()),
    ]).then(([rd, gd]) => {
      setResults(rd.results || []);
      setGradebook(gd.gradebook || gd.entries || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const gpa = gradebook.length
    ? (gradebook.reduce((sum: number, g: any) => sum + Number(g.score || 0), 0) / gradebook.length / 25).toFixed(2)
    : null;

  const downloadReportCard = async () => {
    setGenPdf(true);
    try {
      const res = await fetch(`${API}/reportcards/generate`, {
        method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.id, school_id: user.school_id, term: 'Current Term' }),
      });
      const d = await res.json();
      if (!d.pdf) return;
      const blob = new Blob([Uint8Array.from(atob(d.pdf), c => c.charCodeAt(0))], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
    } catch {} finally { setGenPdf(false); }
  };

  const downloadTranscript = async () => {
    try {
      const res = await fetch(`${API}/transcripts/pdf/${user.id}`, { headers: h });
      const d = await res.json();
      if (!d.pdf) return;
      const blob = new Blob([Uint8Array.from(atob(d.pdf), c => c.charCodeAt(0))], { type: 'application/pdf' });
      setTranscriptUrl(URL.createObjectURL(blob));
    } catch {}
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
        <h1 className="text-lg font-bold">My Results</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {gpa && (
          <div className="bg-blue-600 rounded-xl p-5 text-white text-center">
            <p className="text-xs opacity-80 mb-1">Cumulative GPA</p>
            <p className="text-4xl font-bold">{gpa}</p>
            <p className="text-xs opacity-60 mt-1">out of 4.00</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={downloadReportCard} disabled={genPdf}
            className="flex-1 bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">
            <FileText size={15} className="text-blue-600" />{genPdf ? 'Generating...' : 'Report Card'}
          </button>
          <button onClick={downloadTranscript}
            className="flex-1 bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-medium">
            <Download size={15} className="text-blue-600" />Transcript
          </button>
        </div>
        {(pdfUrl || transcriptUrl) && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            {pdfUrl && <a href={pdfUrl} download="report-card.pdf"
              className="block text-sm text-green-700 font-medium">Download Report Card PDF</a>}
            {transcriptUrl && <a href={transcriptUrl} download="transcript.pdf"
              className="block text-sm text-green-700 font-medium">Download Transcript PDF</a>}
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold">Results ({results.length})</h2>
          </div>
          {results.length === 0
            ? <p className="p-8 text-center text-gray-400 text-sm">No results yet.</p>
            : results.map(r => (
              <div key={r.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.assessment_title}</p>
                    <p className="text-xs text-gray-400 capitalize">{r.type} · {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold ${Number(r.score) >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                    {r.score}/{r.total_marks}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
