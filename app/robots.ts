export default function robots() {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/auth', '/school-admin'] }, sitemap: 'https://edunova.com/sitemap.xml' };
}
