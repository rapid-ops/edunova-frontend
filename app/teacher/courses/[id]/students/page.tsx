'use client';
import { useParams } from 'next/navigation';
import EnrollPanel from '@/components/admin/EnrollPanel';

export default function TeacherCourseStudentsPage() {
  const params = useParams();
  const raw = params?.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) return null;
  return <EnrollPanel courseId={id} requireManage backHref={`/dashboard/courses/${id}`} />;
}
