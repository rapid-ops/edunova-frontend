'use client';
import { useRouter } from 'next/navigation';
import { KeyRound, ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-gray-200">
        <button onClick={() => router.push('/auth/login')} className="flex items-center gap-1 text-gray-500 text-sm mb-6">
          <ChevronLeft size={16} /> Back to login
        </button>
        <KeyRound size={28} className="text-blue-600 mb-3" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
        <p className="text-sm text-gray-600 mb-3">
          Ask your school administrator to reset it for you. They will give you a temporary password.
        </p>
        <p className="text-sm text-gray-600 mb-6">
          After you sign in with it, change your password from your profile.
        </p>
        <button onClick={() => router.push('/auth/login')} className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-medium">
          Back to login
        </button>
      </div>
    </div>
  );
}
