import AuthGuard from '@/components/AuthGuard';
import PortalShell from '@/components/portal/PortalShell';
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><PortalShell role="parent">{children}</PortalShell></AuthGuard>;
}
