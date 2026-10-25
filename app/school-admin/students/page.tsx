'use client';
import Link from 'next/link';
import PeopleManager from '@/components/people/PeopleManager';

const tab = 'inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold';

export default function StudentsPage() {
  return (
    <PeopleManager
      role="student"
      title="Students"
      subtitle="Add students, hand over their sign-in details and keep their accounts up to date."
      tabs={
        <div className="flex gap-2">
          <span className={`${tab} bg-blue-600 text-white`} aria-current="page">Students</span>
          <Link href="/school-admin/parents" className={`${tab} border border-blue-100 bg-white text-slate-700 hover:bg-blue-50`}>Parents</Link>
        </div>
      }
    />
  );
}
