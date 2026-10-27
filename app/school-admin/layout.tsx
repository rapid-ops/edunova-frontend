import RoleGate from '@/components/RoleGate';
import AdminShell from '@/components/admin/AdminShell';
export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate><AdminShell>{children}</AdminShell></RoleGate>;
}
