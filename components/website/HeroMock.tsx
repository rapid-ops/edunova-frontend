'use client';
import { motion } from 'framer-motion';

export default function HeroMock() {
  return (
    <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-lg bg-blue-50" />)}
        </div>
        <div className="mt-3 h-28 rounded-lg bg-gradient-to-r from-blue-100 to-emerald-100" />
        <div className="mt-3 space-y-2"><div className="h-3 w-3/4 rounded bg-slate-200" /><div className="h-3 w-1/2 rounded bg-slate-200" /></div>
      </div>
      <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="absolute -right-2 -top-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">AI Tutor</motion.div>
      <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="absolute -bottom-4 -left-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">Verified certificates</motion.div>
    </motion.div>
  );
}
