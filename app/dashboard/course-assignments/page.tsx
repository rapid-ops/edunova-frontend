'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CourseAssignmentsRedirect() {
  const router = useRouter();
  useEffect(() => {
    let role = '';
    try { role = JSON.parse(localStorage.getItem('user') || '{}').role || ''; } catch { role = ''; }
    if (role === 'teacher') router.replace('/dashboard/courses');
    else if (role === 'school_admin' || role === 'super_admin') router.replace('/school-admin/course-teachers');
    else router.replace('/');
  }, [router]);
  return <p className="p-6 text-sm text-slate-600">Opening the page you asked for...</p>;
}
