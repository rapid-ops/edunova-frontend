import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/website/Reveal';

export const metadata: Metadata = {
  title: 'Blog | Edunova',
  description: 'EdTech insights for Nigerian and African schools.',
};

const articles = [
  { slug: 'future-of-edtech-nigeria', title: 'The Future of EdTech in Nigeria', date: '2026-08-12', readTime: '5 min read', category: 'EdTech', excerpt: 'How technology is reshaping classrooms across Nigeria and what schools can do to stay ahead.' },
  { slug: 'why-whatsapp-notifications', title: 'Why WhatsApp Is the Best Channel for School Notifications', date: '2026-07-29', readTime: '4 min read', category: 'Communication', excerpt: 'Over 90% of Nigerian parents use WhatsApp daily. Here is how schools are using it to close the communication gap.' },
  { slug: 'blockchain-certificates-africa', title: 'Blockchain Certificates: Ending Certificate Fraud in Africa', date: '2026-06-15', readTime: '6 min read', category: 'Credentials', excerpt: 'Certificate fraud costs African graduates opportunities every year. Blockchain verification changes that.' },
  { slug: 'lms-for-small-schools', title: 'You Do Not Need a Big Budget to Run a Great LMS', date: '2026-05-20', readTime: '3 min read', category: 'Tips', excerpt: 'A guide for small private schools that want to move online without breaking the bank.' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function BlogPage() {
  return (
    <main className="bg-white text-slate-800">
      <section className="bg-slate-900 text-white px-4 py-20 text-center">
        <Reveal>
          <h1 className="text-4xl md:text-5xl font-bold">EdTech Insights</h1>
          <p className="mt-4 text-slate-300 text-lg max-w-xl mx-auto">Ideas, guides, and research for Nigerian and African school leaders.</p>
        </Reveal>
      </section>
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <Reveal key={article.slug}>
              <article className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{article.category}</span>
                  <span className="text-slate-400 text-xs">{formatDate(article.date)}</span>
                  <span className="text-slate-400 text-xs">&middot; {article.readTime}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{article.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed flex-1 mb-4">{article.excerpt}</p>
                <Link href={`/blog/${article.slug}`} className="text-blue-600 font-medium text-sm hover:underline self-start">Read more &rarr;</Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
