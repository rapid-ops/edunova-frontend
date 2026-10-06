import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const articles = [
  { slug: 'future-of-edtech-nigeria', title: 'The Future of EdTech in Nigeria', date: '2026-08-12', readTime: '5 min read', category: 'EdTech', excerpt: 'How technology is reshaping classrooms across Nigeria and what schools can do to stay ahead.', body: ['Technology has already changed how Nigerian students learn. The next shift is institutional: schools that adopt structured digital tools now will outpace those that wait.', 'LMS platforms purpose-built for Africa, offline-capable apps, and AI-powered tutors are no longer luxuries. Schools in Lagos and Abuja are already seeing higher assignment completion rates.', 'The schools that thrive in the next decade will treat technology as infrastructure, not an add-on.'] },
  { slug: 'why-whatsapp-notifications', title: 'Why WhatsApp Is the Best Channel for School Notifications', date: '2026-07-29', readTime: '4 min read', category: 'Communication', excerpt: 'Over 90% of Nigerian parents use WhatsApp daily.', body: ['Email open rates for school communications in Nigeria hover around 20%. WhatsApp messages get read within minutes — often seconds.', 'Schools using Edunova send automatic WhatsApp alerts for grade releases, fee reminders, and event notices. Parents respond faster and admin staff spend less time on follow-up calls.', 'Setting up WhatsApp notifications takes one afternoon. The payoff shows up in the first week.'] },
  { slug: 'blockchain-certificates-africa', title: 'Blockchain Certificates: Ending Certificate Fraud in Africa', date: '2026-06-15', readTime: '6 min read', category: 'Credentials', excerpt: 'Certificate fraud costs African graduates opportunities every year.', body: ['A fabricated O-level result or a forged transcript can pass visual inspection. Employers across Africa have no reliable way to verify paper credentials quickly.', 'Blockchain certificates fix this by anchoring each credential to an immutable on-chain record. A QR code resolves to a tamper-proof entry any employer can check in seconds.', 'Edunova schools issue blockchain-backed certificates for end-of-term results and co-curricular achievements. Graduates carry credentials verifiable anywhere, permanently.'] },
  { slug: 'lms-for-small-schools', title: 'You Do Not Need a Big Budget to Run a Great LMS', date: '2026-05-20', readTime: '3 min read', category: 'Tips', excerpt: 'A guide for small private schools that want to move online without breaking the bank.', body: ['Small private schools often assume digital tools are for big institutions with IT departments. That assumption is costing them students and credibility.', "A modern LMS does not need to be expensive. Edunova's Basic plan covers core features with no dollar conversion risk.", 'Pick one pain point — fee collection, grade reporting, or parent communication — and solve it first. Once staff see results, the rest follows.'] },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) return {};
  return { title: `${a.title} | Edunova Blog`, description: a.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
  return (
    <main className="bg-white text-slate-800">
      <section className="px-4 py-16 max-w-2xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline mb-10">&larr; Back to blog</Link>
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{article.category}</span>
          <span className="text-slate-400 text-xs">{formatDate(article.date)}</span>
          <span className="text-slate-400 text-xs">&middot; {article.readTime}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-snug">{article.title}</h1>
        <div className="space-y-5">
          {article.body.map((para, i) => <p key={i} className="text-slate-600 leading-relaxed">{para}</p>)}
        </div>
      </section>
    </main>
  );
}
