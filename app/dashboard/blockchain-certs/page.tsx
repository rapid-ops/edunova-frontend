'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface BCert { id: number; course_title: string; tx_hash: string; chain: string; qr_code_url: string; metadata_url: string; issued_at: string; }
export default function BlockchainCertsPage() {
  const router = useRouter();
  const [certs, setCerts] = useState<BCert[]>([]);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useEffect(() => { fetch(`${API}/api/blockchain/student/${user.id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setCerts(d.certificates || []); setLoading(false); }); }, []);
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Blockchain Certificates</h1></div>
        {certs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400"><div className="text-4xl mb-3">🔗</div><p className="text-sm">No blockchain certificates yet. Complete a course to earn one.</p></div>
        ) : (
          <div className="space-y-4">
            {certs.map(c => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 flex gap-5">
                {c.qr_code_url && <img src={c.qr_code_url} alt="QR" className="w-20 h-20 rounded-lg border border-gray-100" />}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{c.course_title}</div>
                  <div className="text-xs text-gray-400 mb-2">{c.chain} · {new Date(c.issued_at).toLocaleDateString()}</div>
                  <div className="text-xs font-mono text-gray-500 truncate mb-3">{c.tx_hash}</div>
                  <div className="flex gap-3">
                    <a href={c.metadata_url} target="_blank" rel="noreferrer" className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg">Verify</a>
                    <button onClick={() => navigator.clipboard.writeText(c.tx_hash)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">Copy Hash</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
