'use client';
import { useRouter } from 'next/navigation';
import CustomRolesManager from '@/components/CustomRolesManager';

export default function CustomRolesPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-sm text-blue-600">← Back</button>
        <h1 className="text-lg font-bold text-gray-900">Custom Roles</h1>
      </div>
      <div className="px-4 py-4 max-w-lg mx-auto"><CustomRolesManager /></div>
    </div>
  );
}
