import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { slugify } from '@/lib/slug';

type Input = { title?: string; category?: string; body?: string; status?: string; featured?: boolean };

export async function POST(req: Request) {
  const data = (await req.json()) as Input;
  const title = (data.title || '').trim();
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  const status = data.status === 'published' ? 'published' : 'draft';
  const featured = Boolean(data.featured);

  if (featured) await sql`UPDATE posts SET featured = false WHERE featured = true`;
  const rows = (await sql`
    INSERT INTO posts (title, slug, category, body, status, featured)
    VALUES (${title}, ${slugify(title)}, ${data.category || null}, ${data.body || ''}, ${status}, ${featured})
    RETURNING id`) as { id: number }[];
  return NextResponse.json({ id: rows[0].id });
}
