import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const ALLOWED = ['logo_text', 'hero_title', 'hero_sub', 'about', 'footer_text', 'github_url', 'linkedin_url', 'email', 'sections', 'progress_1_name', 'progress_1_pct', 'progress_2_name', 'progress_2_pct'];

export async function PUT(req: Request) {
  const data = (await req.json()) as Record<string, unknown>;
  for (const key of ALLOWED) {
    if (typeof data[key] !== 'string') continue;
    const value = String(data[key]).slice(0, 2000);
    await sql`
      INSERT INTO site_settings (key, value, updated_at) VALUES (${key}, ${value}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
  }
  return NextResponse.json({ ok: true });
}
