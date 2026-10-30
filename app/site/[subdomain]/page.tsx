'use client';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function PublishedSite() {
  const { subdomain } = useParams<{ subdomain: string }>();
  const base = String(api.defaults.baseURL || '').replace(/\/+$/, '');
  const src = `${base}/schoolsites/public/${encodeURIComponent(String(subdomain))}/page`;
  return (
    <iframe
      src={src}
      title="School website"
      className="fixed inset-0 h-full w-full border-0 bg-white"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
    />
  );
}
