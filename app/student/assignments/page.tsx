import Assignments from '@/app/dashboard/assignments/page';

// Students see the full assignment pages inside the student layout.
export default function StudentAssignments() {
  return <div className="[&>div]:min-h-[calc(100dvh-124px)] lg:[&>div]:min-h-[calc(100dvh-68px)]"><Assignments /></div>;
}
