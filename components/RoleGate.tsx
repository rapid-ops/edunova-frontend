'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import LoadingScreen from '@/components/LoadingScreen';

export const PORTAL: Record<string, string> = { super_admin: '/dashboard', school_admin: '/school-admin', teacher: '/teacher', student: '/student', parent: '/parent' };

// /dashboard pages that only school admins (and super admins) may open. All other /dashboard pages are shared with the other portals.
const ADMIN_ONLY = ['students', 'fees', 'coupons', 'applications', 'website', 'audit-logs', 'custom-roles', 'automations', 'dropout-risk', 'schools', 'import', 'reset-passwords', 'departments', 'b2b-support', 'tickets', 'parents'];

const OWNER_ONLY = ['billing'];

export function canOpen(role: string | undefined, pathname: string): boolean {
  if (!role) return false;
  if (role === 'super_admin') return true;
  if (pathname === '/school-admin' || pathname.startsWith('/school-admin/')) return role === 'school_admin';
  if (pathname === '/dashboard') return false;
  if (pathname.startsWith('/dashboard/')) {
    const seg = pathname.split('/')[2];
    if (OWNER_ONLY.includes(seg)) return false;
    if (ADMIN_ONLY.includes(seg)) return role === 'school_admin';
  }
  return true;
}

export default function RoleGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrate } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => { hydrate(); setReady(true); }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    let token: string | null = null;
    try { token = localStorage.getItem('token'); } catch {}
    if (!token) { router.replace('/auth/login'); return; }
    if (user && !canOpen(user.role, pathname)) router.replace(PORTAL[user.role] || '/auth/login');
  }, [ready, user, pathname, router]);

  if (!ready || !user || !canOpen(user.role, pathname)) return <LoadingScreen />;
  return <>{children}</>;
}
