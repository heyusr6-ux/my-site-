import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './lib/session';

export async function middleware(req: NextRequest) {
  const ok = await verifyToken(req.cookies.get('bl_session')?.value);
  if (ok) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
