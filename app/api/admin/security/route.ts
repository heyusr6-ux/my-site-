import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const { ip, reason } = (await req.json()) as { ip?: string; reason?: string };
  if (!ip || ip === 'unknown') return NextResponse.json({ error: 'Invalid IP' }, { status: 400 });
  await sql`INSERT INTO blocked_ips (ip, reason) VALUES (${ip}, ${reason || null}) ON CONFLICT (ip) DO NOTHING`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { ip } = (await req.json()) as { ip?: string };
  if (!ip) return NextResponse.json({ error: 'Invalid IP' }, { status: 400 });
  await sql`DELETE FROM blocked_ips WHERE ip = ${ip}`;
  return NextResponse.json({ ok: true });
}
