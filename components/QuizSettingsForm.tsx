'use client';

export interface QuizSettings {
  title: string;
  instructions: string;
  due_date: string;
  time_limit_minutes: string;
  max_attempts: string;
  pass_percent: string;
  randomize_questions: boolean;
  awards_certificate: boolean;
}

export const emptySettings: QuizSettings = {
  title: '',
  instructions: '',
  due_date: '',
  time_limit_minutes: '',
  max_attempts: '1',
  pass_percent: '50',
  randomize_questions: false,
  awards_certificate: false,
};

export const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const settingsToPayload = (s: QuizSettings) => ({
  title: s.title.trim(),
  instructions: s.instructions.trim(),
  due_date: s.due_date ? new Date(s.due_date).toISOString() : null,
  time_limit_minutes: s.time_limit_minutes === '' ? null : Number(s.time_limit_minutes),
  max_attempts: s.max_attempts === '' ? 1 : Number(s.max_attempts),
  pass_percent: s.pass_percent === '' ? 50 : Number(s.pass_percent),
  randomize_questions: s.randomize_questions,
  awards_certificate: s.awards_certificate,
});

export default function QuizSettingsForm({ value, onChange }: { value: QuizSettings; onChange: (v: QuizSettings) => void }) {
  const set = (patch: Partial<QuizSettings>) => onChange({ ...value, ...patch });
  const input = 'w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900';
  const label = 'text-xs text-gray-400 mb-1 block';
  return (
    <div className="space-y-3">
      <input value={value.title} onChange={e => set({ title: e.target.value })} placeholder="Quiz title" className={input} />
      <textarea value={value.instructions} onChange={e => set({ instructions: e.target.value })} rows={3} placeholder="Instructions (optional)" className={input} />
      <div>
        <label className={label}>Closes on (optional)</label>
        <input type="datetime-local" value={value.due_date} onChange={e => set({ due_date: e.target.value })} className={input} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={label}>Minutes</label>
          <input type="number" min={1} value={value.time_limit_minutes} onChange={e => set({ time_limit_minutes: e.target.value })} placeholder="No limit" className={input} />
        </div>
        <div>
          <label className={label}>Attempts</label>
          <input type="number" min={1} max={20} value={value.max_attempts} onChange={e => set({ max_attempts: e.target.value })} className={input} />
        </div>
        <div>
          <label className={label}>Pass %</label>
          <input type="number" min={1} max={100} value={value.pass_percent} onChange={e => set({ pass_percent: e.target.value })} className={input} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value.randomize_questions} onChange={e => set({ randomize_questions: e.target.checked })} className="accent-blue-600" />
        Shuffle question order for each student
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={value.awards_certificate} onChange={e => set({ awards_certificate: e.target.checked })} className="accent-blue-600 mt-0.5" />
        <span>Passing this quiz gives the student the course certificate <span className="text-gray-400">(use for final exams)</span></span>
      </label>
    </div>
  );
}
