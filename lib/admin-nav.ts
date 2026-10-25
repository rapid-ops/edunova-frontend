import { LayoutDashboard, Users, UserCog, School, BookOpen, ClipboardCheck, ClipboardList, FileText, Award, Wallet, MessageSquare, BarChart3, Bot, Settings, type LucideIcon } from 'lucide-react';

export interface AdminNavItem { key: string; label: string; short?: string; icon: LucideIcon; href: string; enabled: boolean }

// Each worker flips only its own entry: set href to the new /school-admin/<name> page and enabled to true.
export const adminNav: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, href: '/school-admin', enabled: true },
  { key: 'students', label: 'Students', icon: Users, href: '/school-admin/students', enabled: true },
  { key: 'teachers', label: 'Teachers', icon: UserCog, href: '/school-admin/teachers', enabled: true },
  { key: 'classes', label: 'Classes', icon: School, href: '/dashboard/classes', enabled: true },
  { key: 'courses', label: 'Courses', icon: BookOpen, href: '/dashboard/courses', enabled: true },
  { key: 'assessments', label: 'Assessments', icon: ClipboardCheck, href: '/school-admin/assessments', enabled: true },
  { key: 'attendance', label: 'Attendance', icon: ClipboardList, href: '/school-admin/attendance', enabled: true },
  { key: 'examinations', label: 'Examinations', icon: FileText, href: '/school-admin/examinations', enabled: false },
  { key: 'results', label: 'Results', icon: Award, href: '/school-admin/results', enabled: true },
  { key: 'fees', label: 'Fees & Finance', short: 'Fees', icon: Wallet, href: '/school-admin/fees', enabled: true },
  { key: 'communication', label: 'Communication', icon: MessageSquare, href: '/dashboard/messages', enabled: true },
  { key: 'reports', label: 'Reports & Analytics', short: 'Reports', icon: BarChart3, href: '/school-admin/analytics', enabled: true },
  { key: 'ai', label: 'AI Assistant', icon: Bot, href: '/school-admin/ai', enabled: true },
  { key: 'settings', label: 'Settings', icon: Settings, href: '/school-admin/branding', enabled: true },
];

export const enabledNav = () => adminNav.filter((i) => i.enabled);

export const isActive = (pathname: string, href: string) =>
  href === '/school-admin' ? pathname === href : pathname === href || pathname.startsWith(href + '/');
