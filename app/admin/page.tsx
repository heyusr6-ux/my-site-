import { getAllPosts, getSettings } from '@/lib/content';
import { sql } from '@/lib/db';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [posts, settings, failed] = await Promise.all([
    getAllPosts(),
    getSettings(),
    sql`SELECT count(*)::int AS n FROM access_log WHERE result = 'failed' AND created_at > now() - interval '24 hours'`,
  ]);
  const failed24h = ((failed as unknown as { n: number }[])[0]?.n) ?? 0;
  return <AdminClient posts={posts} settings={settings} failed24h={failed24h} />;
}
