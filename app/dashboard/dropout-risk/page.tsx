'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Prediction { id: number; full_name: string; email: string; risk_score: number; risk_level: string; factors: any; intervention_triggered: boolean; predicted_at: string; }
export default function DropoutRiskPage() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const load = () => fetch(`${API}/api/dropout/${user.school_id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setPredictions(d.predictions || []); setLoading(false); });
  useEffect(() => { load(); }, []);
  const run = async () => { setRunning(true); await fetch(`${API}/api/dropout/predict/${user.school_id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); setRunning(false); load(); };
  const riskColor = (l: string) => l === 'critical' ? 'bg-red-100 text-red-600' : l === 'high' ? 'bg-orange-100 text-orange-600' : l === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-700';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Dropout Risk Predictions</h1></div>
          <button onClick={run} disabled={running} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{running ? 'Running...' : 'Run Prediction'}</button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {predictions.length === 0 ? <div className="p-12 text-center text-gray-400">No predictions yet. Click Run Prediction.</div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="text-left px-5 py-3 text-gray-500 font-medium">Student</th><th className="text-center px-5 py-3 text-gray-500 font-medium">Risk</th><th className="text-center px-5 py-3 text-gray-500 font-medium">Score</th><th className="text-center px-5 py-3 text-gray-500 font-medium">7d Events</th><th className="text-center px-5 py-3 text-gray-500 font-medium">Intervened</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {predictions.map(p => (
                  <tr key={p.id}>
                    <td className="px-5 py-3"><div className="font-medium text-gray-900">{p.full_name}</div><div className="text-xs text-gray-400">{p.email}</div></td>
                    <td className="px-5 py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${riskColor(p.risk_level)}`}>{p.risk_level}</span></td>
                    <td className="px-5 py-3 text-center font-medium text-gray-900">{Math.round(p.risk_score)}%</td>
                    <td className="px-5 py-3 text-center text-gray-500">{p.factors?.events_7d || 0}</td>
                    <td className="px-5 py-3 text-center">{p.intervention_triggered ? <span className="text-xs text-green-600">✓ Yes</span> : <span className="text-xs text-gray-400">No</span>}</td>
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
