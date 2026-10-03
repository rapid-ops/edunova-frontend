export default function robots() {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/auth', '/school-admin'] }, sitemap: (process.env.NEXT_PUBLIC_SITE_URL || 'https://edunova-frontend-gkaj.vercel.app') + '/sitemap.xml' };
}
