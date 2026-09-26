'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Ticket { id: number; subject: string; status: string; priority: string; full_name: string; created_at: string; }
export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [form, setForm] = useState({ subject: '', body: '', priority: 'medium' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isAdmin = ['school_admin','super_admin'].includes(user.role);
  const load = () => {
    const url = isAdmin ? `${API}/api/tickets/school/${user.school_id}` : `${API}/api/tickets/user/${user.id}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setTickets(d.tickets || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);
  const create = async () => { await fetch(`${API}/api/tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, school_id: user.school_id, user_id: user.id }) }); setForm({ subject: '', body: '', priority: 'medium' }); setShowForm(false); load(); };
  const statusColor = (s: string) => s === 'open' ? 'bg-yellow-100 text-yellow-700' : s === 'resolved' ? 'bg-green-100 text-green-700' : s === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500';
  const priorityColor = (p: string) => p === 'urgent' ? 'text-red-500' : p === 'high' ? 'text-orange-500' : p === 'medium' ? 'text-yellow-500' : 'text-gray-400';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">Support Tickets</h1></div>
          {!isAdmin && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ New Ticket</button>}
        </div>
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Describe your issue..." rows={3} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
            <div className="flex gap-3"><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Submit</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        <div className="space-y-3">
          {tickets.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No tickets yet.</div> : tickets.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div><div className="font-medium text-gray-900">{t.subject}</div><div className="text-xs text-gray-400 mt-1">{isAdmin && `${t.full_name} · `}{new Date(t.created_at).toLocaleDateString()}</div></div>
                <div className="flex items-center gap-2"><span className={`text-xs font-medium capitalize ${priorityColor(t.priority)}`}>{t.priority}</span><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(t.status)}`}>{t.status}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
