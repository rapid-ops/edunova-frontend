import { BarChart3 } from 'lucide-react';

const side = ['Dashboard', 'Students', 'Teachers', 'Classes', 'Subjects', 'Assignments', 'Exams', 'Results', 'Fees', 'Messages', 'Settings'];
const stats = [['Total Students', '1,250', 'bg-emerald-50 text-emerald-600'], ['Teachers', '68', 'bg-blue-50 text-blue-600'], ['Classes', '42', 'bg-violet-50 text-violet-600'], ['Pending Fees', '₦2,450,000', 'bg-orange-50 text-orange-600']];
const acts = [['New assignment submitted', 'JSS 2 - Mathematics'], ['Fee payment received', 'Mary Adeyemi - SS 1'], ['New message from parent', 'Adebayo Olamide'], ['Exam result published', 'SS 3 - WAEC Preparation']];
const bars = [38, 62, 30, 80, 68];

export default function PlatformMock() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex">
          <div className="hidden w-32 shrink-0 border-r border-slate-100 p-3 sm:block">
            <div className="mb-3 text-xs font-bold text-[#0b1a4a]">Edunova</div>
            {side.map((s, i) => (
              <div key={s} className={`mb-1 rounded px-2 py-1 text-[9px] ${i === 0 ? 'bg-blue-600 font-semibold text-white' : 'text-slate-500'}`}>{s}</div>
            ))}
          </div>
          <div className="flex-1 p-4">
            <div className="text-xs font-bold text-[#0b1a4a]">Good Morning, Admin</div>
            <div className="mb-3 text-[9px] text-slate-500">Here&apos;s what&apos;s happening at your school today.</div>
            <div className="mb-3 grid grid-cols-4 gap-2">
              {stats.map(([l, v, c]) => (
                <div key={l} className="rounded-lg border border-slate-100 p-2">
                  <div className={`mb-1 inline-block rounded px-1 text-[7px] ${c}`}>{l}</div>
                  <div className="text-[11px] font-bold text-[#0b1a4a]">{v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-100 p-2">
                <div className="mb-1 text-[9px] font-semibold text-[#0b1a4a]">Recent Activities</div>
                {acts.map(([t, s]) => (
                  <div key={t} className="mb-1.5 flex items-center gap-1.5">
                    <span className="h-4 w-4 shrink-0 rounded bg-blue-100" />
                    <span><span className="block text-[7px] font-medium text-slate-700">{t}</span><span className="block text-[6px] text-slate-400">{s}</span></span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-100 p-2">
                <div className="mb-1 flex items-center gap-1 text-[9px] font-semibold text-[#0b1a4a]"><BarChart3 className="h-3 w-3" />Student Performance</div>
                <div className="flex h-20 items-end justify-around">
                  {bars.map((h, i) => <span key={i} className={`w-2.5 rounded-t ${i === 4 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ height: `${h}%` }} />)}
                </div>
                <div className="mt-1 flex justify-around text-[6px] text-slate-400"><span>A</span><span>B</span><span>C</span><span>D</span><span>F</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -right-2 hidden w-32 rounded-[1.6rem] border-[5px] border-slate-900 bg-white p-2 shadow-2xl sm:block">
        <div className="text-[9px] font-bold text-[#0b1a4a]">Hello, Student</div>
        <div className="mb-1.5 text-[6px] text-slate-400">Keep learning, keep growing!</div>
        <div className="grid grid-cols-2 gap-1">
          {['bg-blue-600', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-400'].map((c) => <div key={c} className={`h-7 rounded ${c}`} />)}
        </div>
        <div className="mb-1 mt-2 text-[7px] font-semibold text-[#0b1a4a]">Today&apos;s Classes</div>
        {['Mathematics', 'English Language'].map((c) => <div key={c} className="mb-1 rounded bg-slate-50 px-1 py-1 text-[6px] text-slate-600">{c}</div>)}
      </div>
    </div>
  );
}
