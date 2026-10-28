import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  const { name, level, pct } = (await req.json()) as { name?: string; level?: string; pct?: number };
  const clean = (name || '').trim();
  if (!clean) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  await sql`INSERT INTO skills (name, level, pct, sort) VALUES (${clean}, ${level || 'Intermediate'}, ${p}, (SELECT COALESCE(MAX(sort), 0) + 1 FROM skills))`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  await sql`DELETE FROM skills WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
