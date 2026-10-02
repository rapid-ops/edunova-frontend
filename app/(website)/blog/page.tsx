import Link from 'next/link';
import { posts } from '@/lib/blog';

export const metadata = { title: 'Blog | Edunova', description: 'EdTech ideas for Nigerian schools.' };

export default function Blog() {
  return (
    <section className="px-4 py-16"><div className="mx-auto max-w-6xl">
      <h1 className="mb-10 text-4xl font-bold tracking-tight text-slate-900">Blog</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map(p => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-md">
            <div className="h-36 bg-gradient-to-br from-blue-500 to-emerald-400" />
            <div className="p-5">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{p.tag}</span>
              <h2 className="mt-3 text-lg font-semibold text-slate-900">{p.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{p.excerpt}</p>
              <p className="mt-3 text-xs text-slate-500">{p.date} · {p.read} read</p>
            </div>
          </Link>
        ))}
      </div>
    </div></section>
  );
}
