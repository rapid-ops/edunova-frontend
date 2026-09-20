'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import FileUpload from '@/components/ui/FileUpload';
import api from '@/lib/api';

export default function AssignmentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetchAssessments();
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;
    try {
      const enrollRes = await api.get(`/enrollments/student/${user.id}`);
      const allAssessments: any[] = [];
      await Promise.all(
        enrollRes.data.enrollments.map(async (e: any) => {
          const res = await api.get(`/assessments/course/${e.course_id}`);
          allAssessments.push(...res.data.assessments.map((a: any) => ({
            ...a,
            course_title: e.course_title,
          })));
        })
      );
      setAssessments(allAssessments);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/student')} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold">Assignments</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!selected ? (
          <>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : assessments.length === 0 ? (
              <p className="text-gray-400">No assignments yet.</p>
            ) : (
              <div className="space-y-3">
                {assessments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-5 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{a.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{a.course_title}</p>
                        <p className="text-gray-600 text-xs mt-1 capitalize">{a.type} · {a.total_marks} marks</p>
                      </div>
                      {a.due_date && (
                        <p className="text-yellow-400 text-xs">
                          Due: {new Date(a.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-sm mb-4">← Back</button>
            <h2 className="font-semibold text-lg mb-1">{selected.title}</h2>
            <p className="text-gray-500 text-sm mb-6">{selected.course_title} · {selected.total_marks} marks</p>

            <FileUpload
              endpoint="/upload/submission"
              label="Submit Assignment"
              accept={{
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'image/*': ['.jpg', '.jpeg', '.png'],
              }}
              extraData={{
                assessment_id: String(selected.id),
                student_id: String(user?.id),
              }}
              onSuccess={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
