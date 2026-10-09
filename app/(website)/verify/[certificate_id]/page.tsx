import { BadgeCheck, XCircle, GraduationCap, School, Calendar } from 'lucide-react';

const API = 'https://edunova-backend-2x7h.onrender.com/api';

async function getCertificate(id: string) {
  try {
    const res = await fetch(`${API}/certificates/verify/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const d = await res.json();
    return d.certificate || null;
  } catch { return null; }
}

export default async function VerifyPage({ params }: { params: Promise<{ certificate_id: string }> }) {
  const { certificate_id } = await params;
  const cert = await getCertificate(certificate_id);

  if (!cert) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 rounded-2xl p-10 max-w-md w-full text-center">
          <XCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Certificate Not Found</h1>
          <p className="text-gray-500 text-sm">This certificate ID is invalid or does not exist in our records.</p>
          <p className="text-xs text-gray-400 mt-4 font-mono">ID: {certificate_id}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full shadow-sm">
        {/* Verified badge */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-100 rounded-full p-4 mb-3">
            <BadgeCheck size={40} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-green-700">Verified Certificate</h1>
          <p className="text-sm text-gray-500 mt-1">This certificate is authentic and issued by Edunova.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
            <GraduationCap size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Student</p>
              <p className="font-semibold text-gray-900">{cert.student_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
            <School size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Course</p>
              <p className="font-semibold text-gray-900">{cert.course_title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{cert.school_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
            <Calendar size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Issued on</p>
              <p className="font-semibold text-gray-900">
                {new Date(cert.issued_at).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {cert.certificate_url && (
          <a href={cert.certificate_url} target="_blank" rel="noreferrer"
            className="mt-5 block text-center bg-blue-600 text-white py-3 rounded-xl text-sm font-medium">
            View Certificate Document
          </a>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">Certificate ID: {cert.id}</p>
      </div>
    </main>
  );
}
