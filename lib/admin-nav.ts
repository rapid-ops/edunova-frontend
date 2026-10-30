import { Megaphone, Bell, Building2, CalendarDays, Trophy, FileBarChart, ScrollText, Tag, Zap, TrendingDown, Upload, KeyRound, User, Globe } from 'lucide-react';
import { LayoutDashboard, Users, UserCog, School, BookOpen, ClipboardCheck, ClipboardList, FileText, Award, Wallet, MessageSquare, BarChart3, Bot, Settings, type LucideIcon } from 'lucide-react';

export interface AdminNavItem { key: string; label: string; short?: string; icon: LucideIcon; href: string; enabled: boolean }

// Each worker flips only its own entry: set href to the new /school-admin/<name> page and enabled to true.
export const adminNav: AdminNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, href: '/school-admin', enabled: true },
  { key: 'students', label: 'Students', icon: Users, href: '/school-admin/students', enabled: true },
  { key: 'teachers', label: 'Teachers', icon: UserCog, href: '/school-admin/teachers', enabled: true },
  { key: 'classes', label: 'Classes', icon: School, href: '/school-admin/classes', enabled: true },
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

// Old bottom-bar entries, now in the side panel under the main list.
export const moreGroups = ['People', 'School', 'Money', 'Automatic', 'Admin'];
export const moreNav: (AdminNavItem & { group: string })[] = [
  { key: 'announcements', label: 'Announcements', icon: Megaphone, href: '/dashboard/announcements', enabled: true, group: 'People' },
  { key: 'alerts', label: 'Send an alert', icon: Bell, href: '/dashboard/notifications', enabled: true, group: 'People' },
  { key: 'teaching', label: 'Who teaches what', icon: UserCog, href: '/dashboard/course-assignments', enabled: true, group: 'School' },
  { key: 'mysite', label: 'My website', icon: Globe, href: '/school-admin/website', enabled: true, group: 'School' },
  { key: 'departments', label: 'Departments', icon: Building2, href: '/dashboard/departments', enabled: true, group: 'School' },
  { key: 'timetable', label: 'Timetable', icon: CalendarDays, href: '/dashboard/timetable', enabled: true, group: 'School' },
  { key: 'assignments', label: 'Assignments', icon: FileText, href: '/dashboard/assignments', enabled: true, group: 'School' },
  { key: 'quizzes', label: 'Quizzes', icon: ClipboardCheck, href: '/dashboard/quizzes', enabled: true, group: 'School' },
  { key: 'gradebook', label: 'Gradebook', icon: Trophy, href: '/dashboard/gradebook', enabled: true, group: 'School' },
  { key: 'reportcards', label: 'Report cards', icon: FileBarChart, href: '/dashboard/reportcard', enabled: true, group: 'School' },
  { key: 'transcripts', label: 'Transcripts', icon: ScrollText, href: '/dashboard/transcripts', enabled: true, group: 'School' },
  { key: 'coupons', label: 'Discount codes', icon: Tag, href: '/dashboard/coupons', enabled: true, group: 'Money' },
  { key: 'automations', label: 'Automatic actions', icon: Zap, href: '/dashboard/automations', enabled: true, group: 'Automatic' },
  { key: 'dropout', label: 'Students at risk', icon: TrendingDown, href: '/dashboard/dropout-risk', enabled: true, group: 'Automatic' },
  { key: 'import', label: 'Import', icon: Upload, href: '/dashboard/import', enabled: true, group: 'Admin' },
  { key: 'reset', label: 'Reset passwords', icon: KeyRound, href: '/dashboard/reset-passwords', enabled: true, group: 'Admin' },
  { key: 'profile', label: 'Profile', icon: User, href: '/profile', enabled: true, group: 'Admin' },
];
