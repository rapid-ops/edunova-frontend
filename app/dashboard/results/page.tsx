'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function ResultsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ student_id: '', score: '', feedback: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        api.get('/courses/school/1'),
        api.get('/auth/users/1'),
      ]);
      const courseIds = coursesRes.data.courses.map((c: any) => c.id);
      const allAssessments: any[] = [];
      await Promise.all(
        courseIds.map(async (id: number) => {
          const res = await api.get(`/assessments/course/${id}`);
          allAssessments.push(...res.data.assessments);
        })
      );
      setAssessments(allAssessments);
      setStudents(usersRes.data.users.filter((u: any) => u.role === 'student'));
    } catch (err) {}
  };

  const fetchResults = async (assessmentId: number) => {
    try {
      const res = await api.get(`/results/assessment/${assessmentId}`);
      setResults(res.data.results);
    } catch (err) {}
  };

  const handleSelectAssessment = (a: any) => {
    setSelected(a);
    fetchResults(a.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/results', {
        school_id: 1,
        student_id: form.student_id,
        assessment_id: selected.id,
        score: form.score,
        feedback: form.feedback,
      });
      setSuccess('Result saved');
      setForm({ student_id: '', score: '', feedback: '' });
      fetchResults(selected.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save result');
    }
  };

  const getGrade = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 70) return { grade: 'A', color: 'text-green-400' };
    if (pct >= 60) return { grade: 'B', color: 'text-blue-400' };
    if (pct >= 50) return { grade: 'C', color: 'text-yellow-400' };
    if (pct >= 45) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/dashboard')} className="text-gray-500 hover:text-gray-900">←</button>
        <h1 className="text-xl font-bold">Results & Grades</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!selected ? (
          <>
            <p className="text-gray-500 mb-4">Select an assessment to grade</p>
            {assessments.length === 0 ? (
              <p className="text-gray-500 text-sm">No assessments found.</p>
            ) : (
              <div className="space-y-3">
                {assessments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelectAssessment(a)}
                    className="w-full bg-white border border-gray-200 hover:border-blue-500 text-left px-5 py-4 rounded-xl transition"
                  >
                    <p className="font-medium">{a.title}</p>
                    <p className="text-gray-500 text-sm mt-1 capitalize">{a.type} · {a.total_marks} marks</p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-900 text-sm mb-4">← Back to assessments</button>
            <h2 className="font-semibold text-lg mb-1">{selected.title}</h2>
            <p className="text-gray-500 text-sm mb-6 capitalize">{selected.type} · {selected.total_marks} marks</p>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
              <h3 className="font-medium">Add / Update Result</h3>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-400 text-sm">{success}</p>}
              <div>
                <label className="text-gray-500 text-sm mb-1 block">Student</label>
                <select
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none"
                  required
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-sm mb-1 block">Score (out of {selected.total_marks})</label>
                <input
                  type="number"
                  max={selected.total_marks}
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-gray-500 text-sm mb-1 block">Feedback (optional)</label>
                <textarea
                  value={form.feedback}
                  onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  rows={2}
                  className="w-full bg-gray-100 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none resize-none"
                />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-gray-900 px-6 py-2 rounded-lg text-sm">
                Save Result
              </button>
            </form>

            <h3 className="font-medium mb-3">Submitted Results ({results.length})</h3>
            {results.length === 0 ? (
              <p className="text-gray-500 text-sm">No results yet.</p>
            ) : (
              <div className="space-y-3">
                {results.map((r) => {
                  const { grade, color } = getGrade(r.score, selected.total_marks);
                  return (
                    <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{r.student_name}</p>
                        <p className="text-gray-500 text-sm mt-1">{r.feedback || 'No feedback'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{r.score}/{selected.total_marks}</p>
                        <p className={`text-lg font-bold ${color}`}>{grade}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
