'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, CheckCheck, Search, Send } from 'lucide-react';
import api from '@/lib/api';
import { getSocket, joinRoom } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';

interface Conv { other_user: number; full_name: string; role: string; content: string; created_at: string; sender_id: number; unread_count: number }
interface Msg { id: number; sender_id: number; receiver_id: number; content: string; created_at: string; is_read?: boolean | null }
interface Contact { id: number; full_name: string; role: string }
interface Row { id: number; name: string; role: string; last?: string; at?: string; mine?: boolean; unread: number }
interface Peer { id: number; name: string; role: string }

const TZ = 'Africa/Lagos';
const HOME: Record<string, string> = { school_admin: '/school-admin', teacher: '/teacher', student: '/student', parent: '/parent', super_admin: '/dashboard' };
const COLORS = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-orange-500', 'bg-rose-500', 'bg-cyan-600', 'bg-indigo-600', 'bg-teal-600'];
const ring = 'outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

const dayKey = (s: string) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(s));
const clock = (s: string) => new Intl.DateTimeFormat('en-NG', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(s));
const isToday = (s: string) => dayKey(s) === dayKey(new Date().toISOString());
const isYesterday = (s: string) => dayKey(s) === dayKey(new Date(Date.now() - 86400000).toISOString());
const dayLabel = (s: string) => (isToday(s) ? 'Today' : isYesterday(s) ? 'Yesterday' : new Intl.DateTimeFormat('en-NG', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(s)));
const listTime = (s: string) => (isToday(s) ? clock(s) : isYesterday(s) ? 'Yesterday' : new Intl.DateTimeFormat('en-GB', { timeZone: TZ, day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(s)));
const roleLabel = (r: string) => (r === 'school_admin' ? 'School admin' : r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' '));
const add = (list: Msg[], m: Msg) => (list.some((x) => x.id === m.id) ? list : [...list, m]);
const same = (a: Msg[], b: Msg[]) => a.length === b.length && a.every((m, i) => m.id === b[i].id && !!m.is_read === !!b[i].is_read);

function Avatar({ id, name, size }: { id: number; name: string; size: number }) {
  return (
    <span aria-hidden="true" style={{ width: size, height: size }} className={`flex shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${COLORS[Math.abs(id) % COLORS.length]}`}>
      {(name.trim().charAt(0) || '?').toUpperCase()}
    </span>
  );
}

export default function ChatApp() {
  const router = useRouter();
  const sp = useSearchParams();
  const chatId = Number(sp.get('chat')) || null;
  const user = useAuthStore((s) => s.user);
  const uid = user?.id;
  const [convs, setConvs] = useState<Conv[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [ready, setReady] = useState(false);
  const [listError, setListError] = useState(false);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [threadReady, setThreadReady] = useState(false);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [vv, setVv] = useState<{ h: number; top: number } | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const pushing = useRef(false);
  const box = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  peerRef.current = peer;

  // overscroll-lock: on phones the page behind the chat must not scroll or shift.
  useEffect(() => {
    if (!window.matchMedia('(max-width: 767px)').matches) return;
    const html = document.documentElement, body = document.body;
    const prevH = html.style.overflow, prevB = body.style.overflow;
    html.style.overflow = 'hidden'; body.style.overflow = 'hidden';
    return () => { html.style.overflow = prevH; body.style.overflow = prevB; };
  }, []);

  // Phone: follow the visible area so the input stays above the keyboard.
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const v = window.visualViewport;
    const update = () => setVv(mq.matches ? { h: v ? v.height : window.innerHeight, top: v ? v.offsetTop : 0 } : null);
    update();
    v?.addEventListener('resize', update); v?.addEventListener('scroll', update);
    window.addEventListener('resize', update); mq.addEventListener('change', update);
    return () => { v?.removeEventListener('resize', update); v?.removeEventListener('scroll', update); window.removeEventListener('resize', update); mq.removeEventListener('change', update); };
  }, []);

  const loadConvs = useCallback(async () => {
    if (!uid) return;
    try { const r = await api.get(`/messages/inbox/${uid}`); setConvs(r.data.conversations || []); } catch {}
  }, [uid]);

  const loadThread = useCallback(async (otherId: number) => {
    if (!uid) return;
    try {
      const r = await api.get(`/messages/${uid}/${otherId}`);
      const next: Msg[] = r.data.messages || [];
      setMsgs((prev) => (same(prev, next) ? prev : next));
      setError((e) => (e === 'Could not load this chat' ? '' : e));
    } catch { setError('Could not load this chat'); }
    finally { setThreadReady(true); }
  }, [uid]);

  const markRead = useCallback((otherId: number): Promise<void> => {
    if (!uid) return Promise.resolve();
    setConvs((p) => p.map((c) => (c.other_user === otherId ? { ...c, unread_count: 0 } : c)));
    return api.patch(`/messages/read/${otherId}/${uid}`).then(() => { window.dispatchEvent(new Event('messages-read')); }).catch(() => {});
  }, [uid]);

  const show = (p: Peer) => { setPeer(p); setError(''); setMsgs([]); setThreadReady(false); loadThread(p.id); markRead(p.id); };
  const open = (p: Peer) => { pushing.current = true; show(p); router.push(`/dashboard/messages?chat=${p.id}`); };

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    loadConvs();
    api.get('/messages/contacts').then((r) => { if (alive) setContacts(r.data.contacts || []); }).catch(() => { if (alive) setListError(true); }).finally(() => { if (alive) setReady(true); });
    let s: ReturnType<typeof getSocket> | null = null;
    const onMsg = (m: Msg) => {
      const from = Number(m.sender_id), to = Number(m.receiver_id);
      if (from !== uid && to !== uid) return;
      const other = from === uid ? to : from;
      const cur = peerRef.current;
      if (cur && cur.id === other) {
        setMsgs((p) => add(p, m));
        if (from !== uid) { markRead(other).finally(loadConvs); return; }
      }
      loadConvs();
    };
    const rejoin = () => joinRoom(uid);
    try { s = getSocket(); s.on('new_message', onMsg); s.on('connect', rejoin); joinRoom(uid); } catch {}
    const poll = setInterval(() => {
      if (!s || !s.connected) loadConvs();
      const cur = peerRef.current;
      if (cur) loadThread(cur.id);
    }, 10000);
    return () => { alive = false; clearInterval(poll); try { if (s) { s.off('new_message', onMsg); s.off('connect', rejoin); } } catch {} };
  }, [uid, loadConvs, loadThread, markRead]);

  const lastId = msgs.length ? msgs[msgs.length - 1].id : 0;
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [lastId, peer?.id, vv?.h, threadReady]);

  const send = async () => {
    const content = text.trim();
    if (!content || !peer || !uid || sending) return;
    setSending(true); setError(''); setText('');
    try {
      const r = await api.post('/messages', { receiver_id: peer.id, content });
      setMsgs((p) => add(p, r.data.message));
      loadConvs();
    } catch (e: unknown) {
      setText(content);
      const m = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(m || 'Message not sent. Please try again.');
    } finally { setSending(false); inputRef.current?.focus(); }
  };

  const rows = useMemo(() => {
    const map = new Map<number, Row>();
    contacts.forEach((c) => map.set(c.id, { id: c.id, name: c.full_name, role: c.role, unread: 0 }));
    convs.forEach((c) => map.set(c.other_user, { id: c.other_user, name: c.full_name, role: c.role, last: c.content, at: c.created_at, mine: Number(c.sender_id) === Number(uid), unread: c.unread_count || 0 }));
    return Array.from(map.values()).sort((a, b) => (b.at ? +new Date(b.at) : 0) - (a.at ? +new Date(a.at) : 0) || a.name.localeCompare(b.name));
  }, [contacts, convs, uid]);
  const term = filter.trim().toLowerCase();
  const shown = term ? rows.filter((r) => r.name.toLowerCase().includes(term)) : rows;

  // The open chat lives in the address, so the device Back button returns to the list.
  useEffect(() => {
    if (!chatId) { if (peerRef.current && !pushing.current) setPeer(null); return; }
    pushing.current = false;
    if (peerRef.current && peerRef.current.id === chatId) return;
    const r = rows.find((x) => x.id === chatId);
    if (r) show({ id: r.id, name: r.name, role: r.role });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, rows]);

  const goBack = () => { if (window.history.length > 1) router.back(); else router.push(HOME[user?.role || ''] || '/'); };

  return (
    <div style={vv ? { height: vv.h, top: vv.top } : undefined}
      className="fixed inset-x-0 top-0 z-[60] flex h-[100dvh] flex-col bg-white md:static md:z-auto md:mx-auto md:my-4 md:h-[calc(100dvh-9rem)] md:max-w-5xl md:flex-row md:overflow-hidden md:rounded-xl md:border md:border-slate-200">

      <section aria-label="Chats" className={`${peer ? 'hidden md:flex' : 'flex'} min-h-0 w-full flex-1 flex-col md:w-80 md:flex-none md:shrink-0 md:border-r md:border-slate-200`}>
        <div className="flex h-14 shrink-0 items-center gap-1 border-b border-slate-100 bg-white px-2">
          <button type="button" onClick={goBack} aria-label="Go back" className={`flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-blue-50 ${ring}`}><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="flex-1 px-2 text-lg font-bold text-[#0b1a4a]">Messages</h1>
        </div>
        <div className="shrink-0 border-b border-slate-100 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Search people" placeholder="Search people" className={`h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-base text-slate-900 placeholder:text-slate-400 ${ring}`} />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!ready && <p className="px-4 py-8 text-center text-sm text-slate-500">Loading...</p>}
          {ready && listError && rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">Could not load your contacts. Please try again shortly.</p>}
          {ready && !listError && rows.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">There is no one to message yet.</p>}
          {ready && rows.length > 0 && shown.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-500">No one matches your search.</p>}
          <ul>
            {shown.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => open({ id: r.id, name: r.name, role: r.role })} aria-label={r.unread ? `${r.name}, ${r.unread} unread messages` : r.name}
                  className={`flex min-h-[68px] w-full items-center gap-3 border-b border-slate-50 px-3 py-2 text-left hover:bg-slate-50 ${ring} ${peer?.id === r.id ? 'bg-blue-50' : ''}`}>
                  <Avatar id={r.id} name={r.name} size={46} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-[15px] text-[#0b1a4a] ${r.unread ? 'font-bold' : 'font-medium'}`}>{r.name}</span>
                      {r.at && <span className={`shrink-0 text-xs ${r.unread ? 'font-semibold text-blue-600' : 'text-slate-400'}`}>{listTime(r.at)}</span>}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${r.unread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{r.last ? `${r.mine ? 'You: ' : ''}${r.last}` : roleLabel(r.role)}</span>
                      {r.unread > 0 && <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">{r.unread > 99 ? '99+' : r.unread}</span>}
                    </span>
                    {r.last && <span className="block truncate text-[11px] text-slate-400">{roleLabel(r.role)}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-label="Conversation" className={`${peer ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col bg-slate-50`}>
        {!peer ? (
          <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-slate-500">Choose someone to start chatting</div>
        ) : (
          <>
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-2">
              <button type="button" onClick={() => { if (window.history.length > 1) router.back(); else { setPeer(null); router.replace('/dashboard/messages'); } }} aria-label="Back to chats" className={`flex h-11 w-11 items-center justify-center rounded-full text-slate-700 hover:bg-blue-50 md:hidden ${ring}`}><ArrowLeft className="h-5 w-5" /></button>
              <Avatar id={peer.id} name={peer.name} size={38} />
              <div className="min-w-0"><p className="truncate text-[15px] font-semibold text-[#0b1a4a]">{peer.name}</p><p className="text-xs text-slate-500">{roleLabel(peer.role)}</p></div>
            </div>
            <div ref={box} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
              {!threadReady && <p className="py-6 text-center text-sm text-slate-500">Loading...</p>}
              {threadReady && msgs.length === 0 && <p className="py-6 text-center text-sm text-slate-500">No messages yet. Say hello.</p>}
              {msgs.map((m, i) => {
                const mine = Number(m.sender_id) === Number(uid);
                const newDay = i === 0 || dayKey(msgs[i - 1].created_at) !== dayKey(m.created_at);
                return (
                  <div key={m.id}>
                    {newDay && <div className="my-3 flex justify-center"><span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">{dayLabel(m.created_at)}</span></div>}
                    <div className={`mb-1 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-[15px] shadow-sm ${mine ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md bg-white text-slate-900'}`}>
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`mt-0.5 flex items-center justify-end gap-1 text-[11px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>
                          {clock(m.created_at)}
                          {mine && (m.is_read ? <CheckCheck className="h-3.5 w-3.5 text-sky-200" aria-label="Read" /> : <Check className="h-3.5 w-3.5" aria-label="Sent" />)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {error && <p role="alert" className="shrink-0 bg-white px-4 pt-2 text-xs text-red-600">{error}</p>}
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} enterKeyHint="send" aria-label="Type a message" placeholder="Type a message"
                className={`h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-base text-slate-900 placeholder:text-slate-400 ${ring}`} />
              <button type="submit" disabled={!text.trim() || sending} aria-label="Send message" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 ${ring}`}><Send className="h-5 w-5" /></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
