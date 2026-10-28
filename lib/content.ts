import { sql } from './db';

export type Post = {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  body: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  created_at: string;
};

export async function getSettings(): Promise<Record<string, string>> {
  const rows = (await sql`SELECT key, value FROM site_settings`) as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getPublishedPosts(): Promise<Post[]> {
  return (await sql`
    SELECT id, title, slug, category, body, status, featured, created_at
    FROM posts WHERE status = 'published'
    ORDER BY featured DESC, created_at DESC`) as unknown as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = (await sql`
    SELECT id, title, slug, category, body, status, featured, created_at
    FROM posts WHERE slug = ${slug} AND status = 'published' LIMIT 1`) as unknown as Post[];
  return rows[0] ?? null;
}

export async function getAllPosts(): Promise<Post[]> {
  return (await sql`
    SELECT id, title, slug, category, body, status, featured, created_at
    FROM posts ORDER BY created_at DESC`) as unknown as Post[];
}
