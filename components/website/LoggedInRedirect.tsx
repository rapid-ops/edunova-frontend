'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoggedInRedirect() {
  const router = useRouter();
  useEffect(() => {
    try { if (localStorage.getItem('token')) router.replace('/auth/login'); } catch {}
  }, [router]);
  return null;
}
