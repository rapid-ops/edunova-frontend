import AuthGuard from '@/components/AuthGuard';
import AdminShell from '@/components/admin/AdminShell';

export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><AdminShell>{children}</AdminShell></AuthGuard>;
}
