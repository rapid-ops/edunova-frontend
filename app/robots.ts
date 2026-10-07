import { MetadataRoute } from 'next';
const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://edunova-frontend-gkaj.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/auth', '/school-admin', '/parent', '/student', '/teacher', '/subscription', '/onboarding/verify', '/payment/verify'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
