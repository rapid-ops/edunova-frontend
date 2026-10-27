'use client';
import RoleGate from '@/components/RoleGate';
import AdminShell from '@/components/admin/AdminShell';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/auth.store';

// School admins get the admin shell on the shared /dashboard pages; everyone else keeps the existing layout.
export default function DashboardFrame({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  return (
    <RoleGate>
      {user?.role === 'school_admin'
        ? <AdminShell><div className="[&>div]:min-h-[calc(100dvh-124px)] lg:[&>div]:min-h-[calc(100dvh-68px)]">{children}</div></AdminShell>
        : <div className="min-h-screen bg-gray-50 pb-20">{children}<BottomNav /></div>}
    </RoleGate>
  );
}
