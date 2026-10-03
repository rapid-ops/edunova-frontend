import { posts } from '@/lib/blog';
const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://edunova-frontend-gkaj.vercel.app';
export default function sitemap() {
  const pages = ['', '/features', '/pricing', '/about', '/blog', '/contact', '/privacy', '/terms'];
  return [...pages.map(p => ({ url: base + p })), ...posts.map(p => ({ url: `${base}/blog/${p.slug}` }))];
}
