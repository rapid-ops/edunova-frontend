'use client';
import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

const API = process.env.NEXT_PUBLIC_API_URL;

const GRADES: [number, number, string, string][] = [
  [75, 100, 'A1', 'Excellent'], [70, 74, 'B2', 'Very Good'], [65, 69, 'B3', 'Good'],
  [60, 64, 'C4', 'Credit'], [55, 59, 'C5', 'Credit'], [50, 54, 'C6', 'Credit'],
  [45, 49, 'D7', 'Pass'], [40, 44, 'E8', 'Pass'], [0, 39, 'F9', 'Fail'],
];

function getGrade(score: number) {
  return GRADES.find(([lo, hi]) => score >= lo && score <= hi) || [0, 0, 'F9', 'Fail'];
}

export default function ReportCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('First Term');
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => { fetchCard(); }, [term]);

  async function fetchCard() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reportcard/${user.id}/${user.school_id}?term=${encodeURIComponent(term)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setData(d);
    } finally { setLoading(false); }
  }

  function printCard() {
    window.print();
  }

  if (loading) return <LoadingScreen />;

  const results = data?.results || [];
  const total = results.reduce((s: number, r: any) => s + (r.total_score || 0), 0);
  const avg = results.length ? Math.round(total / results.length) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Controls */}
      <div className="flex gap-3 mb-4 no-print">
        <select value={term} onChange={e => setTerm(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1">
          {['First Term', 'Second Term', 'Third Term'].map(t => <option key={t}>{t}</option>)}
        </select>
        <button onClick={printCard}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Printer size={16} /> Print
        </button>
      </div>

      {/* Report Card */}
      <div className="report-card bg-white border-2 border-gray-300 rounded-xl p-6 relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
          <p className="text-8xl font-black text-gray-500 rotate-[-30deg]">APPROVED</p>
        </div>

        {/* Header */}
        <div className="text-center border-b-2 pb-4 mb-4 relative z-10">
          <p className="text-2xl font-black text-blue-600">EDUNOVA</p>
          <h2 className="text-lg font-bold text-gray-800">{data?.school_name}</h2>
          <p className="text-xs text-gray-400">{data?.school_address}</p>
          <p className="mt-2 font-semibold text-gray-600 tracking-widest text-sm">STUDENT REPORT CARD</p>
        </div>

        {/* Student info */}
        <table className="w-full text-sm mb-4 relative z-10">
          <tbody>
            {[
              ['Name', data?.student_name],
              ['Class', data?.class_name],
              ['Term', term],
              ['Academic Year', data?.academic_year || '2025/2026'],
              ['Admission No.', data?.admission_number || '-'],
            ].map(([label, val]) => (
              <tr key={label}>
                <td className="py-1 font-semibold text-gray-500 w-32">{label}</td>
                <td className="py-1 text-gray-800">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Results table */}
        <table className="w-full text-sm border-collapse mb-4 relative z-10">
          <thead>
            <tr className="bg-blue-600 text-white">
              {['Subject', 'CA', 'Exam', 'Total', 'Grade', 'Remark'].map(h => (
                <th key={h} className="p-2 text-left text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r: any, i: number) => {
              const [,, grade, remark] = getGrade(r.total_score || 0);
              return (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-2">{r.subject_name}</td>
                  <td className="p-2">{r.ca_score ?? '-'}</td>
                  <td className="p-2">{r.exam_score ?? '-'}</td>
                  <td className="p-2 font-bold">{r.total_score}</td>
                  <td className="p-2 font-bold text-blue-600">{grade}</td>
                  <td className="p-2 text-gray-500 text-xs">{remark}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 text-center mb-4 relative z-10">
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="font-bold text-blue-600">{total}</p>
            <p className="text-xs text-gray-500">Total Marks</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <p className="font-bold text-green-600">{avg}%</p>
            <p className="text-xs text-gray-500">Average</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2">
            <p className="font-bold text-purple-600">{data?.position || '-'}</p>
            <p className="text-xs text-gray-500">Position</p>
          </div>
        </div>

        {/* Attendance */}
        <div className="border rounded-lg p-3 mb-4 text-sm relative z-10">
          <p className="font-semibold text-gray-700 mb-2">Attendance Summary</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-gray-500">Days Present</span><span>{data?.attendance?.present || 0}</span>
            <span className="text-gray-500">Days Absent</span><span>{data?.attendance?.absent || 0}</span>
            <span className="text-gray-500">Total School Days</span><span>{data?.attendance?.total || 0}</span>
            <span className="text-gray-500">Attendance %</span>
            <span className="font-bold text-blue-600">{data?.attendance?.percentage || 0}%</span>
          </div>
        </div>

        {/* Teacher comment */}
        <div className="border rounded-lg p-3 mb-4 relative z-10">
          <p className="text-xs font-semibold text-gray-500 mb-1">Class Teacher's Comment</p>
          <p className="text-sm text-gray-700">{data?.teacher_comment || 'No comment added'}</p>
        </div>

        {/* Signature */}
        <div className="flex justify-between text-xs text-gray-400 relative z-10">
          <div className="text-center">
            <div className="border-t border-gray-300 pt-1 w-32">Class Teacher</div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 pt-1 w-32">Principal</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .report-card { width: 210mm; min-height: 297mm; padding: 20mm; border: none !important; }
          body { margin: 0; }
        }
      `}</style>
    </div>
  );
}
