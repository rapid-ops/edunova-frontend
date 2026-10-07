import { MetadataRoute } from 'next';
const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://edunova-frontend-gkaj.vercel.app';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://edunova-backend-2x7h.onrender.com/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '', '/features', '/pricing', '/about', '/blog', '/contact',
    '/privacy', '/terms', '/schools', '/courses',
  ].map((p) => ({ url: base + p, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.8 }));

  const blogSlugs = ['introducing-edunova', 'multi-tenant-lms', 'paystack-integration', 'school-admin-guide'];
  const blogPages = blogSlugs.map((s) => ({ url: `${base}/blog/${s}`, changeFrequency: 'monthly' as const, priority: 0.6 }));

  let schoolPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API}/schools/public`, { next: { revalidate: 3600 } });
    const data = await res.json();
    schoolPages = (data.schools || []).map((s: { subdomain: string }) => ({
      url: `${base}/school/${s.subdomain}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {}

  return [...staticPages, ...blogPages, ...schoolPages];
}
