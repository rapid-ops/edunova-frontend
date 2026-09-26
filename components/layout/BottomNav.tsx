'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, School, BookOpen, Users, ClipboardList,
  CalendarDays, DollarSign, Bell, MessageCircle, User,
  GraduationCap, FlaskConical, BrainCircuit, Bot, Briefcase,
  Link2, ShieldCheck, Megaphone, BarChart2, Ticket,
  Tag, ScrollText, Building2, Layers, Cpu, Zap, Trophy,
  FileCheck, UserCheck, TrendingDown, RefreshCcw, Headphones,
  Lightbulb, QrCode, BookMarked, UserCog, Presentation
} from 'lucide-react';

const navGroups: Record<string, { icon: any; label: string; href: string }[][]> = {
  super_admin: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
      { icon: School, label: 'Schools', href: '/dashboard/schools' },
      { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: Headphones, label: 'Support', href: '/dashboard/b2b-support' },
      { icon: ScrollText, label: 'Audit', href: '/dashboard/audit-logs' },
    ],
    [
      { icon: Tag, label: 'Coupons', href: '/dashboard/coupons' },
      { icon: Ticket, label: 'Tickets', href: '/dashboard/tickets' },
      { icon: ShieldCheck, label: 'Roles', href: '/dashboard/custom-roles' },
      { icon: Cpu, label: 'Competency', href: '/dashboard/competencies' },
      { icon: TrendingDown, label: 'Dropout', href: '/dashboard/dropout-risk' },
    ],
    [
      { icon: Bot, label: 'AI Studio', href: '/dashboard/ai-studio' },
      { icon: Zap, label: 'Automations', href: '/dashboard/automations' },
      { icon: Megaphone, label: 'Announce', href: '/dashboard/announcements' },
      { icon: Bell, label: 'Alerts', href: '/dashboard/notifications' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
  ],
  school_admin: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
      { icon: Users, label: 'Students', href: '/dashboard/students' },
      { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
      { icon: Megaphone, label: 'Announce', href: '/dashboard/announcements' },
      { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
    ],
    [
      { icon: UserCog, label: 'Assign', href: '/dashboard/course-assignments' },
      { icon: Building2, label: 'Depts', href: '/dashboard/departments' },
      { icon: CalendarDays, label: 'Timetable', href: '/dashboard/timetable' },
      { icon: DollarSign, label: 'Fees', href: '/dashboard/fees' },
      { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance' },
    ],
    [
      { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: Lightbulb, label: 'Suggestions', href: '/dashboard/suggestions' },
      { icon: Headphones, label: 'Support', href: '/dashboard/b2b-support' },
      { icon: Trophy, label: 'Gradebook', href: '/dashboard/gradebook' },
      { icon: ScrollText, label: 'Transcripts', href: '/dashboard/transcripts' },
    ],
    [
      { icon: Zap, label: 'Automations', href: '/dashboard/automations' },
      { icon: TrendingDown, label: 'Dropout', href: '/dashboard/dropout-risk' },
      { icon: Tag, label: 'Coupons', href: '/dashboard/coupons' },
      { icon: Bell, label: 'Alerts', href: '/dashboard/notifications' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
  ],
  teacher: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/teacher' },
      { icon: BookOpen, label: 'My Courses', href: '/dashboard/course-assignments' },
      { icon: Users, label: 'Students', href: '/dashboard/students' },
      { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance' },
      { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
    ],
    [
      { icon: Presentation, label: 'Sessions', href: '/dashboard/class-sessions' },
      { icon: Trophy, label: 'Gradebook', href: '/dashboard/gradebook' },
      { icon: CalendarDays, label: 'Timetable', href: '/dashboard/timetable' },
      { icon: FlaskConical, label: 'Labs', href: '/dashboard/virtual-labs' },
      { icon: Megaphone, label: 'Announce', href: '/dashboard/announcements' },
    ],
    [
      { icon: FileCheck, label: 'Proof', href: '/dashboard/proof-of-work' },
      { icon: Lightbulb, label: 'Suggest', href: '/dashboard/suggestions' },
      { icon: Bell, label: 'Alerts', href: '/dashboard/notifications' },
      { icon: RefreshCcw, label: 'Evolution', href: '/dashboard/course-evolution' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
  ],
  student: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/student' },
      { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
      { icon: Megaphone, label: 'Notices', href: '/dashboard/announcements' },
      { icon: Presentation, label: 'Join Q&A', href: '/dashboard/class-sessions' },
      { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
    ],
    [
      { icon: Trophy, label: 'Grades', href: '/dashboard/gradebook' },
      { icon: GraduationCap, label: 'Certs', href: '/dashboard/certificates' },
      { icon: Link2, label: 'Blockchain', href: '/dashboard/blockchain-certs' },
      { icon: ScrollText, label: 'Transcript', href: '/dashboard/transcripts' },
      { icon: CalendarDays, label: 'Timetable', href: '/dashboard/timetable' },
    ],
    [
      { icon: BrainCircuit, label: 'My Twin', href: '/dashboard/learning-twin' },
      { icon: Bot, label: 'AI Tutor', href: '/dashboard/ai-tutor' },
      { icon: Briefcase, label: 'Career', href: '/dashboard/career' },
      { icon: Zap, label: 'Skill Gap', href: '/dashboard/skill-gap' },
      { icon: BookMarked, label: 'Passport', href: '/dashboard/skill-passport' },
    ],
    [
      { icon: FlaskConical, label: 'Labs', href: '/dashboard/virtual-labs' },
      { icon: FileCheck, label: 'Proof', href: '/dashboard/proof-of-work' },
      { icon: UserCheck, label: 'Peer', href: '/dashboard/peer-review' },
      { icon: Lightbulb, label: 'Suggest', href: '/dashboard/suggestions' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
  ],
  parent: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/parent' },
      { icon: Users, label: 'My Kids', href: '/dashboard/parents' },
      { icon: Trophy, label: 'Grades', href: '/dashboard/gradebook' },
      { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance' },
      { icon: Megaphone, label: 'Notices', href: '/dashboard/announcements' },
    ],
    [
      { icon: DollarSign, label: 'Fees', href: '/dashboard/fees' },
      { icon: CalendarDays, label: 'Timetable', href: '/dashboard/timetable' },
      { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
      { icon: Bell, label: 'Alerts', href: '/dashboard/notifications' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
  ],
};

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
  const role = user.role || 'student';
  const groups = navGroups[role] || navGroups.student;
  const [page, setPage] = useState(0);
  const current = groups[page] || groups[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      {groups.length > 1 && (
        <div className="flex justify-center gap-1.5 pt-1.5">
          {groups.map((_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`h-1 rounded-full transition-all ${i === page ? 'bg-blue-600 w-6' : 'bg-gray-200 w-3'}`} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-around px-1 pb-1">
        {current.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 py-2 px-2 flex-1 transition-colors ${active ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <Icon size={21} strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[9px] font-medium truncate w-full text-center leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
