import { notFound } from 'next/navigation';
import Link from 'next/link';
import { posts } from '@/lib/blog';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find(x => x.slug === slug);
  return { title: p ? `${p.title} | Edunova` : 'Blog | Edunova', description: p?.excerpt };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = posts.find(x => x.slug === slug);
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/blog" className="text-sm font-semibold text-blue-600">Back to blog</Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{p.title}</h1>
      <p className="mt-2 text-sm text-slate-500">{p.date} · {p.read} read · {p.tag}</p>
      <div className="mt-8 space-y-4 text-lg leading-relaxed text-slate-700">{p.body.map((t, i) => <p key={i}>{t}</p>)}</div>
    </article>
  );
}
