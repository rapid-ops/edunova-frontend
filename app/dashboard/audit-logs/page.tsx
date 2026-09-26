'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Log { id: number; action: string; entity: string; entity_id: number; full_name: string; role: string; created_at: string; }
export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useEffect(() => {
    fetch(`${API}/api/audit-logs/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setLogs(d.logs || []); setLoading(false); });
  }, []);
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Audit Logs</h1></div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {logs.length === 0 ? <div className="p-12 text-center text-gray-400">No logs yet.</div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left px-5 py-3 text-gray-500 font-medium">Action</th><th className="text-left px-5 py-3 text-gray-500 font-medium">User</th><th className="text-left px-5 py-3 text-gray-500 font-medium">Entity</th><th className="text-left px-5 py-3 text-gray-500 font-medium">Time</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{l.action}</td>
                    <td className="px-5 py-3 text-gray-900">{l.full_name} <span className="text-xs text-gray-400">({l.role})</span></td>
                    <td className="px-5 py-3 text-gray-500">{l.entity} #{l.entity_id}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
