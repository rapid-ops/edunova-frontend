import Link from 'next/link';
import { Check, LogIn, ArrowRight, House, Lock, ShieldCheck, Zap, Users } from 'lucide-react';
import AuthShell from '@/components/auth/AuthShell';
import { Badge, OrDivider } from '@/components/auth/ui';
import { btnCls, outlineBtnCls } from '@/components/auth/styles';

const strip = [
  { icon: Lock, title: 'Your Account is Secure', text: 'Your password has been updated successfully.' },
  { icon: ShieldCheck, title: 'Data Protection', text: 'We use industry-standard security measures.' },
  { icon: Zap, title: 'Quick Access', text: 'Get back to your learning journey in seconds.' },
  { icon: Users, title: 'Support Available', text: 'Need help? Our support team is always here for you.' },
];

export default function ResetSuccessPage() {
  return (
    <AuthShell
      backHref="/auth/login" backLabel="Back to Login" caption={['Welcome', 'Back!']} badge="check" photo="/images/recovery-girl-check.png"
      below={
        <ul className="grid gap-6 rounded-2xl bg-white/80 p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {strip.map(({ icon: I, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><I className="h-5 w-5" /></span>
              <span><span className="block text-sm font-semibold text-[#0b1a4a]">{title}</span><span className="block text-xs text-slate-500">{text}</span></span>
            </li>
          ))}
        </ul>
      }
    >
      <Badge icon={Check} tone="green">Password Reset Successful</Badge>
      <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#0b1a4a]">Your Password Has Been <span className="text-blue-600">Reset!</span></h1>
      <p className="mb-6 mt-3 text-sm leading-relaxed text-slate-500">Your account is now secure with your new password. You can log in to continue using Edunova.</p>
      <Link href="/auth/login" className={btnCls}><LogIn className="h-4 w-4" />Go to Login<ArrowRight className="h-4 w-4" /></Link>
      <OrDivider />
      <Link href="/" className={outlineBtnCls}><House className="h-4 w-4 text-blue-600" />Back to Home</Link>
    </AuthShell>
  );
}
