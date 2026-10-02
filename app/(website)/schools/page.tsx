import Link from 'next/link';
import SchoolsClient from '@/components/website/SchoolsClient';

export const metadata = { title: 'Schools | Edunova', description: 'Browse schools learning on Edunova.' };

export default function Schools() {
  return (
    <section className="px-4 py-16"><div className="mx-auto max-w-6xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Schools on Edunova</h1>
        <Link href="/register" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-6 font-semibold text-white">Register your school</Link>
      </div>
      <SchoolsClient />
    </div></section>
  );
}
