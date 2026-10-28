import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/content';
import { embedUrl } from '@/lib/embed';

export const dynamic = 'force-dynamic';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const paragraphs = (post.body || '').split(/\n\s*\n/).filter(Boolean);
  const video = embedUrl(post.video_url);

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
        {post.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_url} alt={post.title} style={{ width: '100%', borderRadius: 10, marginBottom: 32 }} />
        )}
        {video && (
          <div style={{ position: 'relative', aspectRatio: '16 / 9', marginBottom: 32 }}>
            <iframe
              src={video}
              title={post.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, borderRadius: 10 }}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
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
