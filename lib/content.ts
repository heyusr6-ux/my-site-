import { sql } from './db';

export type Post = {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  body: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  cover_url: string | null;
  video_url: string | null;
  created_at: string;
};

export async function getSettings(): Promise<Record<string, string>> {
  const rows = (await sql`SELECT key, value FROM site_settings`) as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getPublishedPosts(): Promise<Post[]> {
  return (await sql`
    SELECT id, title, slug, category, body, status, featured, cover_url, video_url, created_at
    FROM posts WHERE status = 'published'
    ORDER BY featured DESC, created_at DESC`) as unknown as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = (await sql`
    SELECT id, title, slug, category, body, status, featured, cover_url, video_url, created_at
    FROM posts WHERE slug = ${slug} AND status = 'published' LIMIT 1`) as unknown as Post[];
  return rows[0] ?? null;
}

export async function getAllPosts(): Promise<Post[]> {
  return (await sql`
    SELECT id, title, slug, category, body, status, featured, cover_url, video_url, created_at
    FROM posts ORDER BY created_at DESC`) as unknown as Post[];
}

export type Skill = { id: number; name: string; level: string; pct: number };
export type Resource = { id: number; title: string; type: string; url: string; note: string | null };

export const DEFAULT_ORDER = ['posts', 'skills', 'progress', 'resources', 'about', 'contact'];

export async function getSkills(): Promise<Skill[]> {
  return (await sql`SELECT id, name, level, pct FROM skills ORDER BY sort, id`) as unknown as Skill[];
}

export async function getResources(): Promise<Resource[]> {
  return (await sql`SELECT id, title, type, url, note FROM resources ORDER BY sort, id`) as unknown as Resource[];
}

export async function getSectionConfig(): Promise<{ order: string[]; hidden: string[] }> {
  const s = await getSettings();
  try {
    const parsed = JSON.parse(s.sections || '{}');
    const order = Array.isArray(parsed.order) ? parsed.order : DEFAULT_ORDER;
    const hidden = Array.isArray(parsed.hidden) ? parsed.hidden : [];
    return { order, hidden };
  } catch {
    return { order: DEFAULT_ORDER, hidden: [] };
  }
}
