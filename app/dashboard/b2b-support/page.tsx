'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
const API = process.env.NEXT_PUBLIC_API_URL;
interface Ticket { id: number; subject: string; body: string; type: string; status: string; priority: string; school_name: string; full_name: string; super_admin_reply: string; created_at: string; }
export default function B2BSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [form, setForm] = useState({ subject: '', body: '', type: 'enquiry', priority: 'medium' });
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isSuperAdmin = user.role === 'super_admin';
  const load = () => {
    const url = isSuperAdmin ? `${API}/api/b2b-tickets/all` : `${API}/api/b2b-tickets/school/${user.school_id}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => { setTickets(d.tickets || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);
  const create = async () => { await fetch(`${API}/api/b2b-tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...form, school_id: user.school_id, submitted_by: user.id }) }); setForm({ subject: '', body: '', type: 'enquiry', priority: 'medium' }); setShowForm(false); load(); };
  const reply = async (id: number) => { await fetch(`${API}/api/b2b-tickets/${id}/reply`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ super_admin_reply: replies[id], replied_by: user.id }) }); setReplies({ ...replies, [id]: '' }); load(); };
  const resolve = async (id: number) => { await fetch(`${API}/api/b2b-tickets/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'resolved' }) }); load(); };
  const statusColor = (s: string) => s === 'resolved' ? 'bg-green-100 text-green-700' : s === 'in_progress' ? 'bg-blue-100 text-blue-600' : s === 'closed' ? 'bg-gray-100 text-gray-400' : 'bg-yellow-100 text-yellow-700';
  const priorityColor = (p: string) => p === 'urgent' ? 'text-red-500' : p === 'high' ? 'text-orange-500' : p === 'medium' ? 'text-yellow-500' : 'text-gray-400';
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4"><button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">← Back</button><h1 className="text-xl font-bold">{isSuperAdmin ? 'School Support Inbox' : 'Contact Support'}</h1></div>
          {!isSuperAdmin && <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">+ New Ticket</button>}
        </div>
        {showForm && !isSuperAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none" />
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Describe your issue or enquiry..." rows={4} className="w-full bg-gray-100 rounded-lg px-4 py-3 text-sm outline-none resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none"><option value="enquiry">Enquiry</option><option value="complaint">Complaint</option><option value="billing">Billing</option><option value="bug">Bug Report</option><option value="other">Other</option></select>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
            </div>
            <div className="flex gap-3"><button onClick={create} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Submit</button><button onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-lg text-sm">Cancel</button></div>
          </div>
        )}
        <div className="space-y-4">
          {tickets.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">No tickets yet.</div> : tickets.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div><div className="font-semibold text-gray-900">{t.subject}</div><div className="text-xs text-gray-400 mt-1">{isSuperAdmin ? `${t.school_name} · ${t.full_name}` : t.type} · {new Date(t.created_at).toLocaleDateString()}</div></div>
                <div className="flex items-center gap-2"><span className={`text-xs font-medium ${priorityColor(t.priority)}`}>{t.priority}</span><span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(t.status)}`}>{t.status}</span></div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{t.body}</p>
              {t.super_admin_reply && <div className="bg-blue-50 rounded-lg p-3 mb-3"><p className="text-xs text-blue-600 font-medium mb-1">Edunova Support</p><p className="text-sm text-gray-700">{t.super_admin_reply}</p></div>}
              {isSuperAdmin && t.status !== 'resolved' && (
                <div className="space-y-2"><div className="flex gap-2"><input value={replies[t.id] || ''} onChange={e => setReplies({ ...replies, [t.id]: e.target.value })} placeholder="Reply to school..." className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none" /><button onClick={() => reply(t.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Reply</button></div><button onClick={() => resolve(t.id)} className="text-xs text-green-600 hover:underline">Mark Resolved</button></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
