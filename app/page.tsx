import Link from 'next/link';
import { getPublishedPosts, getSettings, type Post } from '@/lib/content';
import ThemeToggle from '@/components/ThemeToggle';

export const dynamic = 'force-dynamic';

function excerpt(text: string | null, max = 220) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + '...' : clean;
}

export default async function Home() {
  const [s, posts] = await Promise.all([getSettings(), getPublishedPosts()]);
  const featured: Post | undefined = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/" className="brand" style={{ color: 'var(--fg)' }}>
          {s.logo_text || 'Breach Log'}
          <small>cybersecurity journal</small>
        </Link>
        <nav aria-label="Main">
          <a href="#posts">Posts</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <ThemeToggle />
        </nav>
      </header>

      {featured && (
        <section className="block" style={{ paddingTop: 56 }}>
          <p className="tag" style={{ marginBottom: 14 }}>Featured</p>
          <Link href={`/posts/${featured.slug}`} className="card feature">
            <span className="tag">{featured.category || 'Post'}</span>
            <h3>{featured.title}</h3>
            <p>{excerpt(featured.body)}</p>
            <span className="meta">{new Date(featured.created_at).toLocaleDateString('en-GB')} · Read post</span>
          </Link>
        </section>
      )}

      <div className="hero" style={{ paddingTop: featured ? 40 : 88 }}>
        <p className="kicker">Learning in public</p>
        <h1>{s.hero_title || 'Notes and labs from my cybersecurity journey.'}</h1>
        <p className="lead">{s.hero_sub || 'CTF write-ups, tool notes, certification progress.'}</p>
      </div>

      <section className="block" id="posts">
        <h2>Latest posts</h2>
        {rest.length === 0 ? (
          <p className="lead">No more posts yet.</p>
        ) : (
          <div className="grid">
            {rest.map((p) => (
              <Link key={p.id} href={`/posts/${p.slug}`} className="card">
                <span className="tag">{p.category || 'Post'}</span>
                <h3>{p.title}</h3>
                <p>{excerpt(p.body, 140)}</p>
                <span className="meta">{new Date(p.created_at).toLocaleDateString('en-GB')}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="block" id="about">
        <h2>About</h2>
        <p className="lead" style={{ maxWidth: '60ch' }}>{s.about || 'I am learning cybersecurity, and this blog records my journey.'}</p>
      </section>

      <section className="block" id="contact">
        <h2>Contact</h2>
        <div className="btns">
          {s.github_url && <a className="btn solid" href={s.github_url} target="_blank" rel="noreferrer">GitHub</a>}
          {s.linkedin_url && <a className="btn" href={s.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
          {s.email && <a className="btn" href={`mailto:${s.email}`}>Email</a>}
        </div>
      </section>

      <footer>
        <span>© Breach Log</span>
        <span>{s.footer_text || 'Learning cybersecurity in public.'}</span>
      </footer>
    </div>
  );
}
