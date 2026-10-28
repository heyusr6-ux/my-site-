import { getAllPosts, getSettings } from '@/lib/content';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [posts, settings] = await Promise.all([getAllPosts(), getSettings()]);
  return <AdminClient posts={posts} settings={settings} />;
}
