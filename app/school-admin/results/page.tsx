'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, FileText, Download } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = 'https://edunova-backend-2x7h.onrender.com/api';
const TERMS = ['First Term', 'Second Term', 'Third Term'];

export default function AdminResultsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState('');
  const [term, setTerm] = useState(TERMS[0]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/auth/users/${user.school_id}`, { headers: h })
      .then(r => r.json())
      .then(d => { setStudents((d.users || []).filter((u: any) => u.role === 'student')); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const generate = async () => {
    if (!studentId) return;
    setGenerating(true); setPdfUrl(''); setError('');
    try {
      const res = await fetch(`${API}/reportcards/generate`, {
        method: 'POST', headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: Number(studentId), school_id: user.school_id, term }),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || 'Failed'); return; }
      const blob = new Blob([Uint8Array.from(atob(d.pdf), c => c.charCodeAt(0))], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
    } catch { setError('Network error'); }
    setGenerating(false);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()}><ChevronLeft size={22} className="text-blue-600" /></button>
        <h1 className="text-lg font-bold">Report Cards</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <select value={studentId} onChange={e => { setStudentId(e.target.value); setPdfUrl(''); }}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
          </select>
          <select value={term} onChange={e => setTerm(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none">
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={generate} disabled={!studentId || generating}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            <FileText size={16} />{generating ? 'Generating...' : 'Generate Report Card'}
          </button>
        </div>
        {pdfUrl && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
            <FileText size={32} className="text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-4">Report card ready</p>
            <a href={pdfUrl} download={`report-card.pdf`}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium">
              <Download size={15} />Download PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
