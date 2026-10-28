import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const { ip, reason } = (await req.json()) as { ip?: string; reason?: string };
  const clean = (ip || '').trim();
  if (!clean || clean.length > 64) return NextResponse.json({ error: 'Invalid IP' }, { status: 400 });
  await sql`INSERT INTO blocked_ips (ip, reason) VALUES (${clean}, ${reason || null}) ON CONFLICT (ip) DO NOTHING`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const ip = new URL(req.url).searchParams.get('ip') || '';
  if (!ip) return NextResponse.json({ error: 'Missing IP' }, { status: 400 });
  await sql`DELETE FROM blocked_ips WHERE ip = ${ip}`;
  return NextResponse.json({ ok: true });
}
