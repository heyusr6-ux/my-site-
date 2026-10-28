import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/content';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const paragraphs = (post.body || '').split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="wrap narrow">
      <header className="top">
        <Link href="/" className="brand" style={{ color: 'var(--fg)' }}>Breach Log</Link>
        <Link href="/">Back to posts</Link>
      </header>
      <article className="article" style={{ paddingTop: 48 }}>
        <span className="tag">{post.category || 'Post'}</span>
        <h1 style={{ fontSize: 'clamp(32px,5vw,48px)', marginTop: 12 }}>{post.title}</h1>
        <p className="meta" style={{ marginBottom: 32 }}>{new Date(post.created_at).toLocaleDateString('en-GB')}</p>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
      <footer>
        <Link href="/">← All posts</Link>
        <span>© Breach Log</span>
      </footer>
    </div>
  );
}
