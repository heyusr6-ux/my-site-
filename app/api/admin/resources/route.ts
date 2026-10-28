import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

type Input = { title?: string; type?: string; url?: string; note?: string };

function clean(data: Input) {
  return {
    title: (data.title || '').trim(),
    type: data.type || 'Book',
    url: (data.url || '#').trim(),
    note: (data.note || '').trim() || null,
  };
}

export async function POST(req: Request) {
  const d = clean((await req.json()) as Input);
  if (!d.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  await sql`INSERT INTO resources (title, type, url, note, sort) VALUES (${d.title}, ${d.type}, ${d.url}, ${d.note}, (SELECT COALESCE(MAX(sort), 0) + 1 FROM resources))`;
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const id = Number(new URL(req.url).searchParams.get('id'));
  const d = clean((await req.json()) as Input);
  if (!id || !d.title) return NextResponse.json({ error: 'Bad input' }, { status: 400 });
  await sql`UPDATE resources SET title = ${d.title}, type = ${d.type}, url = ${d.url}, note = ${d.note} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  await sql`DELETE FROM resources WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
