'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

interface Certificate {
  id: number;
  course_title: string;
  school_name: string;
  issued_at: string;
  certificate_url: string | null;
}

export default function CertificatesPage() {
  const router = useRouter();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    if (!user.id) return;
    fetch(`${API}/api/certificates/student/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setCerts(d.certificates || []); setLoading(false); });
  }, []);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button>
          <h1 className="text-xl font-bold text-gray-900">My Certificates</h1>
        </div>
        {certs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No certificates yet. Complete a course to earn one.</div>
        ) : (
          <div className="grid gap-4">
            {certs.map(c => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{c.course_title}</div>
                  <div className="text-sm text-gray-500">{c.school_name} · {new Date(c.issued_at).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  {c.certificate_url ? (
                    <a href={c.certificate_url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">View</a>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">Issued</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
