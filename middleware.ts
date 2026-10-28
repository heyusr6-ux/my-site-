import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from './lib/session';
import { clientInfo, isBlocked, logAccess } from './lib/security';

export async function middleware(req: NextRequest) {
  const info = clientInfo(req);

  // Manually blocked IPs get nothing on admin pages or admin APIs.
  if (await isBlocked(info.ip).catch(() => false)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const ok = await verifyToken(req.cookies.get('bl_session')?.value);
  if (ok) return NextResponse.next();

  // Record every unauthenticated attempt to reach the admin area.
  await logAccess(info, req.nextUrl.pathname, 'denied').catch(() => {});

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
