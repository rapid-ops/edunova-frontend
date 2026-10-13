'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import LoadingScreen from '@/components/LoadingScreen';

interface Log { id: number; action: string; entity: string; entity_id: number | null; full_name?: string; role?: string; created_at: string; }

export default function AuditLogsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    if (!user.school_id) { setLoading(false); return; }
    (async () => {
      try { const r = await api.get(`/audit-logs/${user.school_id}`); setLogs(r.data.logs || []); }
      catch (e: any) { setError(e?.response?.data?.error || e?.message || 'Failed to load logs'); }
      finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <LoadingScreen />;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => router.back()} className="text-sm text-blue-600">← Back</button>
          <h1 className="text-lg font-bold">Audit Logs</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        {!user?.school_id ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">Audit logs are per school. Sign in as a school admin to view them.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
            {logs.length === 0 ? <div className="p-12 text-center text-gray-400 text-sm">No logs yet.</div> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200"><tr>
                  {['Action', 'User', 'Entity', 'Time'].map((h) => <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{l.action}</td>
                      <td className="px-4 py-3 text-gray-900">{l.full_name || '-'} <span className="text-xs text-gray-400">{l.role ? `(${l.role})` : ''}</span></td>
                      <td className="px-4 py-3 text-gray-600">{l.entity}{l.entity_id ? ` #${l.entity_id}` : ''}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
