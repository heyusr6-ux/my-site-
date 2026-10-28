import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

type Input = { title?: string; category?: string; body?: string; status?: string; featured?: boolean; cover_url?: string; video_url?: string };

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const data = (await req.json()) as Input;
  const title = (data.title || '').trim();
  if (!id || !title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  const status = data.status === 'published' ? 'published' : 'draft';
  const featured = Boolean(data.featured);
  const cover = data.cover_url?.trim() || null;
  const video = data.video_url?.trim() || null;

  if (featured) await sql`UPDATE posts SET featured = false WHERE featured = true AND id <> ${id}`;
  await sql`
    UPDATE posts SET title = ${title}, category = ${data.category || null}, body = ${data.body || ''},
      status = ${status}, featured = ${featured}, cover_url = ${cover}, video_url = ${video}, updated_at = now()
    WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return NextResponse.json({ error: 'Bad id' }, { status: 400 });
  await sql`DELETE FROM posts WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
