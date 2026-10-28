import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { makeToken } from '@/lib/session';
import { clientInfo, isBlocked, logAccess, recentFailures } from '@/lib/security';

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(req: Request) {
  const info = clientInfo(req);

  if (await isBlocked(info.ip)) {
    await logAccess(info, '/api/login', 'blocked').catch(() => {});
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
  }
  if ((await recentFailures(info.ip)) >= 5) {
    await logAccess(info, '/api/login', 'locked').catch(() => {});
    return NextResponse.json({ error: 'Too many failed attempts. Try again after 15 minutes.' }, { status: 429 });
  }

  const { username, password } = (await req.json().catch(() => ({}))) as { username?: string; password?: string };
  const input = `${username || ''} ${password || ''}`;
  if (/(['";]|--|\/\*|\b(or|and)\b\s+[\w'"]+\s*=|\bunion\b|\bselect\b|\bdrop\b)/i.test(input)) {
    await logAccess(info, "/api/login", "attack").catch(() => {});
    return NextResponse.json({ error: "You are trying to bypass the login page security. Kyoraku says: nice try." }, { status: 400 });
  }
  const expectedUser = process.env.ADMIN_USERNAME || '';
  const expectedPass = process.env.ADMIN_PASSWORD || '';
  const valid =
    !!expectedUser && !!expectedPass &&
    same(username || '', expectedUser) &&
    same(password || '', expectedPass);

  if (!valid) {
    await logAccess(info, '/api/login', 'failed').catch(() => {});
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await logAccess(info, '/api/login', 'success').catch(() => {});
  const res = NextResponse.json({ ok: true });
  res.cookies.set('bl_session', await makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return res;
}
