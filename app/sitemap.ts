import { posts } from '@/lib/blog';
const base = 'https://edunova.com';
export default function sitemap() {
  const pages = ['', '/features', '/pricing', '/schools', '/about', '/blog', '/contact', '/privacy', '/terms'];
  return [...pages.map(p => ({ url: base + p })), ...posts.map(p => ({ url: `${base}/blog/${p.slug}` }))];
}
