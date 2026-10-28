import { getAllPosts, getSettings } from '@/lib/content';
import { getSecurityData } from '@/lib/security';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [posts, settings, security] = await Promise.all([getAllPosts(), getSettings(), getSecurityData()]);
  return <AdminClient posts={posts} settings={settings} security={security} />;
}
