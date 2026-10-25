import AuthGuard from '@/components/AuthGuard';
import PortalShell from '@/components/portal/PortalShell';
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><PortalShell role="student">{children}</PortalShell></AuthGuard>;
}
