export interface Child { id: number; full_name: string; email?: string; avatar_url?: string | null; }

export interface ChildData {
  results: { id: number; score: string | number | null; assessment_title: string; total_marks: number | null; type?: string; created_at: string }[];
  attendance: { present: string | number | null; absent: string | number | null; late: string | number | null } | null;
  fees: { id: number; amount: string | number; description: string | null; status: string | null; due_date: string | null }[];
  enrollments: { id: number; course_id: number; course_title: string; enrolled_at?: string }[];
}

export const attendanceStats = (a: ChildData['attendance']) => {
  const present = Number(a?.present) || 0;
  const absent = Number(a?.absent) || 0;
  const late = Number(a?.late) || 0;
  const total = present + absent + late;
  return { present, absent, late, total, rate: total ? Math.round(((present + late) / total) * 100) : null };
};

export const outstanding = (fees: ChildData['fees']) => fees.filter((f) => String(f.status || '').toLowerCase() !== 'paid');

export const naira = (n: string | number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(n) || 0);

export const recentResults = (r: ChildData['results'], n = 3) =>
  [...r].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, n);

export const scoreText = (r: ChildData['results'][number]) =>
  r.total_marks ? `${Number(r.score) || 0}/${r.total_marks}` : String(Number(r.score) || 0);
