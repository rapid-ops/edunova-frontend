import { LayoutDashboard, BookOpen, ClipboardList, ClipboardCheck, Award, Trophy, Bot, MessageSquare, Megaphone, Users, Wallet, BarChart3, TrendingUp, CalendarDays, type LucideIcon } from 'lucide-react';

export type PortalRole = 'student' | 'teacher' | 'parent';
export interface PortalNavItem { key: string; label: string; short?: string; icon: LucideIcon; href: string }

export const portalNav: Record<PortalRole, PortalNavItem[]> = {
  student: [
    { key: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, href: '/student' },
    { key: 'courses', label: 'My Courses', short: 'Courses', icon: BookOpen, href: '/student/courses' },
    { key: 'assignments', label: 'Assignments', icon: ClipboardList, href: '/student/assignments' },
    { key: 'assessments', label: 'Quizzes and Exams', short: 'Quizzes', icon: ClipboardCheck, href: '/student/assessments' },
    { key: 'grades', label: 'Grades', icon: Award, href: '/student/results' },
    { key: 'progress', label: 'Progress', icon: TrendingUp, href: '/student/progress' },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/student/leaderboard' },
    { key: 'timetable', label: 'Timetable', icon: CalendarDays, href: '/student/timetable' },
    { key: 'timetable', label: 'Timetable', icon: CalendarDays, href: '/student/timetable' },
    { key: 'ai', label: 'AI Tutor', icon: Bot, href: '/student/ai-tutor' },
    { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
  ],
  teacher: [
    { key: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, href: '/teacher' },
    { key: 'courses', label: 'My Courses', short: 'Courses', icon: BookOpen, href: '/teacher/courses' },
    { key: 'assessments', label: 'Assessments', short: 'Tests', icon: ClipboardCheck, href: '/teacher/assessments' },
    { key: 'attendance', label: 'Attendance', icon: ClipboardList, href: '/teacher/attendance' },
    { key: 'timetable', label: 'Timetable', icon: CalendarDays, href: '/teacher/timetable' },
    { key: 'analytics', label: 'Class Analytics', short: 'Analytics', icon: BarChart3, href: '/teacher/analytics' },
    { key: 'ai', label: 'AI Teaching Tools', short: 'AI Tools', icon: Bot, href: '/teacher/ai-tools' },
    { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
  ],
  parent: [
    { key: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, href: '/parent' },
    { key: 'children', label: 'My Children', short: 'Children', icon: Users, href: '/parent/children' },
    { key: 'fees', label: 'Fees and Payments', short: 'Fees', icon: Wallet, href: '/parent/fees' },
    { key: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { key: 'notices', label: 'School Notices', short: 'Notices', icon: Megaphone, href: '/dashboard/announcements' },
  ],
};

export const portalBottom: Record<PortalRole, string[]> = {
  student: ['dashboard', 'courses', 'assignments', 'grades'],
  teacher: ['dashboard', 'assessments', 'attendance', 'timetable'],
  parent: ['dashboard', 'children', 'fees', 'messages'],
};

export const portalLabel: Record<PortalRole, string> = { student: 'Student', teacher: 'Teacher', parent: 'Parent' };

export const portalAi: Partial<Record<PortalRole, { href: string; title: string; text: string; cta: string }>> = {
  student: { href: '/student/ai-tutor', title: 'Edunova AI Tutor', text: 'Ask questions and get help with your lessons', cta: 'Ask the Tutor' },
  teacher: { href: '/teacher/ai-tools', title: 'AI Teaching Tools', text: 'Plan lessons, quizzes and resources', cta: 'Open AI Tools' },
};

export const isActive = (pathname: string, href: string) =>
  href === '/student' || href === '/teacher' || href === '/parent' ? pathname === href : pathname === href || pathname.startsWith(href + '/');
