import AuthGuard from '@/components/AuthGuard';
import PortalShell from '@/components/portal/PortalShell';
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><PortalShell role="teacher">{children}</PortalShell></AuthGuard>;
}
