'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Grade { id: number; assessment_title: string; type: string; score: number; total_marks: number; weight: number; letter_grade: string; }
export default function GradebookPage() {
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gpa, setGpa] = useState<{ avg_score: string; gpa: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState('');
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    if (!user.id) return;
    const cid = new URLSearchParams(window.location.search).get('course_id') || '';
    setCourseId(cid);
    if (cid) {
      fetch(`${API}/api/gradebook/student/${user.id}/${cid}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => { setGrades(d.grades || []); setLoading(false); });
    }
    fetch(`${API}/api/gradebook/gpa/${user.id}/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setGpa(d));
  }, []);
  const color = (l: string) => l === 'A' ? 'text-green-600' : l === 'B' ? 'text-blue-600' : l === 'C' ? 'text-yellow-600' : l === 'D' ? 'text-orange-500' : 'text-red-500';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button>
          <h1 className="text-xl font-bold text-gray-900">Gradebook</h1>
        </div>
        {gpa && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-blue-600">{gpa.gpa}</div>
              <div className="text-sm text-gray-500 mt-1">GPA</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-gray-900">{gpa.avg_score}%</div>
              <div className="text-sm text-gray-500 mt-1">Average Score</div>
            </div>
          </div>
        )}
        {grades.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No grades yet for this course.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Assessment</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Type</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium">Score</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map(g => (
                  <tr key={g.id}>
                    <td className="px-5 py-3 text-gray-900">{g.assessment_title}</td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{g.type}</td>
                    <td className="px-5 py-3 text-center text-gray-900">{g.score}/{g.total_marks}</td>
                    <td className={`px-5 py-3 text-center font-bold ${color(g.letter_grade)}`}>{g.letter_grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
