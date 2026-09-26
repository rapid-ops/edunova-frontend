import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/layout/BottomNav';
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><div className="min-h-screen bg-gray-50 pb-20">{children}<BottomNav /></div></AuthGuard>;
}
