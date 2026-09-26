'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, School, BookOpen, Users, ClipboardList,
  CalendarDays, DollarSign, Bell, MessageCircle, User,
  GraduationCap, FlaskConical, BrainCircuit, Bot, Briefcase,
  Link2, ShieldCheck, Megaphone, BarChart2, Ticket,
  Tag, ScrollText, Building2, Layers, Cpu, Zap, Trophy,
  FileCheck, UserCheck, TrendingDown, Passport, RefreshCcw
} from 'lucide-react';

const navGroups: Record<string, { icon: any; label: string; href: string }[][]> = {
  super_admin: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
      { icon: School, label: 'Schools', href: '/dashboard/schools' },
      { icon: Users, label: 'Students', href: '/dashboard/students' },
      { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
      { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
    ],
    [
      { icon: CalendarDays, label: 'Timetable', href: '/dashboard/timetable' },
      { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance' },
      { icon: DollarSign, label: 'Fees', href: '/dashboard/fees' },
      { icon: Bell, label: 'Alerts', href: '/dashboard/notifications' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
    [
      { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: Tag, label: 'Coupons', href: '/dashboard/coupons' },
      { icon: Ticket, label: 'Tickets', href: '/dashboard/tickets' },
      { icon: ScrollText, label: 'Audit', href: '/dashboard/audit-logs' },
      { icon: ShieldCheck, label: 'Roles', href: '/dashboard/custom-roles' },
    ],
    [
      { icon: Building2, label: 'Depts', href: '/dashboard/departments' },
      { icon: Layers, label: 'Paths', href: '/dashboard/learning-paths' },
      { icon: Zap, label: 'Rules', href: '/dashboard/automations' },
      { icon: Bot, label: 'AI Studio', href: '/dashboard/ai-studio' },
      { icon: Cpu, label: 'Competency', href: '/dashboard/competencies' },
    ],
    [
      { icon: TrendingDown, label: 'Dropout', href: '/dashboard/dropout-risk' },
      { icon: RefreshCcw, label: 'Evolution', href: '/dashboard/course-evolution' },
      { icon: GraduationCap, label: 'Certs', href: '/dashboard/certificates' },
      { icon: Link2, label: 'Blockchain', href: '/dashboard/blockchain-certs' },
      { icon: Megaphone, label: 'Website', href: '/dashboard/website' },
    ],
  ],
  school_admin: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
      { icon: Users, label: 'Students', href: '/dashboard/students' },
      { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
      { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance' },
      { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
    ],
    [
      { icon: CalendarDays, label: 'Timetable', href: '/dashboard/timetable' },
      { icon: DollarSign, label: 'Fees', href: '/dashboard/fees' },
      { icon: Bell, label: 'Alerts', href: '/dashboard/notifications' },
      { icon: BarChart2, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
    [
      { icon: Building2, label: 'Depts', href: '/dashboard/departments' },
      { icon: Layers, label: 'Paths', href: '/dashboard/learning-paths' },
      { icon: Zap, label: 'Rules', href: '/dashboard/automations' },
      { icon: Ticket, label: 'Tickets', href: '/dashboard/tickets' },
      { icon: Tag, label: 'Coupons', href: '/dashboard/coupons' },
    ],
    [
      { icon: Bot, label: 'AI Studio', href: '/dashboard/ai-studio' },
      { icon: Cpu, label: 'Competency', href: '/dashboard/competencies' },
      { icon: ShieldCheck, label: 'Roles', href: '/dashboard/custom-roles' },
      { icon: TrendingDown, label: 'Dropout', href: '/dashboard/dropout-risk' },
      { icon: ScrollText, label: 'Audit', href: '/dashboard/audit-logs' },
    ],
  ],
  teacher: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
      { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
      { icon: ClipboardList, label: 'Attendance', href: '/dashboard/attendance' },
      { icon: Trophy, label: 'Gradebook', href: '/dashboard/gradebook' },
      { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
    ],
    [
      { icon: CalendarDays, label: 'Timetable', href: '/dashboard/timetable' },
      { icon: FlaskConical, label: 'Labs', href: '/dashboard/virtual-labs' },
      { icon: FileCheck, label: 'Proof', href: '/dashboard/proof-of-work' },
      { icon: Bell, label: 'Alerts', href: '/dashboard/notifications' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
  ],
  student: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/student' },
      { icon: BookOpen, label: 'Courses', href: '/dashboard/courses' },
      { icon: BrainCircuit, label: 'My Twin', href: '/dashboard/learning-twin' },
      { icon: Bot, label: 'AI Tutor', href: '/dashboard/ai-tutor' },
      { icon: MessageCircle, label: 'Messages', href: '/dashboard/messages' },
    ],
    [
      { icon: Trophy, label: 'Grades', href: '/dashboard/gradebook' },
      { icon: GraduationCap, label: 'Certs', href: '/dashboard/certificates' },
      { icon: Link2, label: 'Blockchain', href: '/dashboard/blockchain-certs' },
      { icon: Briefcase, label: 'Career', href: '/dashboard/career' },
      { icon: User, label: 'Profile', href: '/profile' },
    ],
    [
      { icon: FlaskConical, label: 'Labs', href: '/dashboard/virtual-labs' },
      { icon: FileCheck, label: 'Proof', href: '/dashboard/proof-of-work' },
      { icon: UserCheck, label: 'Peer', href: '/dashboard/peer-review' },
      { icon: ScrollText, label: 'Passport', href: '/dashboard/skill-passport' },
      { icon: Zap, label: 'Skill Gap', href: '/dashboard/skill-gap' },
    ],
  ],
  parent: [
    [
      { icon: LayoutDashboard, label: 'Home', href: '/parent' },
      { icon: Users, label: 'My Kids', href: '/dashboard/parents' },
      { icon: Trophy, label: 'Grades', href: '/dashboard/gradebook' },
      { icon: DollarSign, label: 'Fees', href: '/dashboard/fees' },
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
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {groups.length > 1 && (
        <div className="flex justify-center gap-1 bg-white border-t border-gray-100 pt-1">
          {groups.map((_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`w-6 h-1.5 rounded-full transition-all ${i === page ? 'bg-blue-600 w-8' : 'bg-gray-200'}`} />
          ))}
        </div>
      )}
      <div className="bg-white border-t border-gray-200 px-2 pb-safe">
        <div className="flex items-center justify-around">
          {current.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-0 flex-1 transition-colors ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
