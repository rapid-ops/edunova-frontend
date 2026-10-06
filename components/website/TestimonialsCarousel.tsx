'use client';
import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const T = [
  { quote: 'Edunova cut our admin work in half. Parents love the WhatsApp updates.', name: 'Mrs Funke Adeniyi', role: 'Principal, Greenfield Academy Lagos' },
  { quote: 'Our students now submit assignments online and get instant feedback. The AI tutor is incredible.', name: 'Mr Emmanuel Okoro', role: 'IT Coordinator, Royalgate Schools Abuja' },
  { quote: 'We moved from paper records to Edunova in one weekend. Setup was that easy.', name: 'Mrs Blessing Eze', role: 'Director, Heritage Montessori Enugu' },
];

export default function TestimonialsCarousel() {
  const [cur, setCur] = useState(0);
  const next = useCallback(() => setCur((c) => (c + 1) % T.length), []);
  const prev = () => setCur((c) => (c - 1 + T.length) % T.length);
  useEffect(() => { const id = setInterval(next, 4000); return () => clearInterval(id); }, [next]);
  const t = T[cur];
  return (
    <div className="relative max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12 text-center">
        <p className="text-slate-700 text-lg md:text-xl leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
        <p className="text-slate-900 font-semibold">{t.name}</p>
        <p className="text-blue-600 text-sm">{t.role}</p>
      </div>
      <button onClick={prev} aria-label="Previous" className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white border border-slate-200 rounded-full p-2 shadow-sm"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
      <button onClick={next} aria-label="Next" className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white border border-slate-200 rounded-full p-2 shadow-sm"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
      <div className="flex justify-center gap-2 mt-6">
        {T.map((_, i) => <button key={i} onClick={() => setCur(i)} aria-label={`${i + 1}`} className={`w-2 h-2 rounded-full transition-colors ${i === cur ? 'bg-blue-600' : 'bg-slate-300'}`} />)}
      </div>
    </div>
  );
}
