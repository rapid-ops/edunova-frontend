import { redirect } from 'next/navigation';

export default function StudentAssignmentsRedirect() {
  redirect('/dashboard/assignments');
}
