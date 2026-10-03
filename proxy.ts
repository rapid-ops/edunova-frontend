import { NextResponse, type NextRequest } from 'next/server';

const ROOT = (process.env.ROOT_DOMAIN || '').trim().toLowerCase();
const RESERVED = ['www', 'app', 'api', 'admin', 'mail'];

// Maps greenfield.<ROOT_DOMAIN> to /school/greenfield. Does nothing until ROOT_DOMAIN is set.
export function proxy(req: NextRequest) {
  if (!ROOT) return NextResponse.next();
  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0];
  if (!host.endsWith('.' + ROOT)) return NextResponse.next();
  const sub = host.slice(0, host.length - ROOT.length - 1);
  if (!/^[a-z0-9-]+$/.test(sub) || RESERVED.includes(sub)) return NextResponse.next();
  const p = req.nextUrl.pathname;
  const url = req.nextUrl.clone();
  if (p === '/') url.pathname = '/school/' + sub;
  else if (p.startsWith('/programmes/')) url.pathname = '/school/' + sub + p;
  else return NextResponse.next();
  return NextResponse.rewrite(url);
}

export const config = { matcher: ['/', '/programmes/:path*'] };
