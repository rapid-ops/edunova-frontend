'use client';
import { CheckCircle, XCircle } from 'lucide-react';

const show = (v: any): string => {
  if (v === null || v === undefined || v === '') return 'No answer';
  if (Array.isArray(v)) return v.map((x: any) => (x && typeof x === 'object' && 'left' in x ? `${x.left} → ${x.right}` : String(x))).join(', ');
  if (typeof v === 'object') return Object.entries(v).map(([k, val]) => `${k} → ${val}`).join(', ');
  return String(v);
};

export default function QuizReview({ review }: { review: any[] }) {
  if (!Array.isArray(review) || review.length === 0) return null;
  return (
    <div className="space-y-3 text-left pt-3">
      <p className="text-sm font-semibold text-gray-900">Review your answers</p>
      {review.map((q, i) => (
        <div key={q.id ?? i} className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
          <p className="text-sm font-medium text-gray-900 flex items-start gap-2">
            {q.correct ? <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" /> : <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
            <span>{i + 1}. {q.question}</span>
          </p>
          <p className="text-sm text-gray-600">Your answer: {show(q.your_answer)}</p>
          {!q.correct && <p className="text-sm text-green-700">Correct answer: {show(q.correct_answer)}</p>}
          {q.explanation && <p className="text-xs text-gray-500">{q.explanation}</p>}
        </div>
      ))}
    </div>
  );
}
