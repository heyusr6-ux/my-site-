import Link from 'next/link';
import type { ReactNode } from 'react';
import { getPublishedPosts, getSettings, getSkills, getResources, getSectionConfig } from '@/lib/content';
import ThemeToggle from '@/components/ThemeToggle';
import ContactForm from '@/components/ContactForm';
import PostGrid from '@/components/PostGrid';

export const dynamic = 'force-dynamic';

function excerpt(text: string | null, max = 220) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + '...' : clean;
}

export default async function Home() {
  const [s, posts, skills, resources, cfg] = await Promise.all([
    getSettings(),
    getPublishedPosts(),
    getSkills(),
    getResources(),
    getSectionConfig(),
  ]);
  const featured = posts[0];
  const rest = posts.slice(1);
  const progress = [1, 2]
    .map((i) => ({ name: s[`progress_${i}_name`] || '', pct: Math.max(0, Math.min(100, Number(s[`progress_${i}_pct`]) || 0)) }))
    .filter((p) => p.name);

  const blocks: Record<string, ReactNode> = {
    posts: (
      <section className="block" id="posts" key="posts">
        <h2>Latest posts</h2>
        <PostGrid posts={rest} />
      </section>
    ),
    skills: skills.length > 0 && (
      <section className="block" id="skills" key="skills">
        <h2>Skills</h2>
        <div className="tagrow">
          {skills.map((k) => (
            <span key={k.id}>{k.name} · {k.level}</span>
          ))}
        </div>
      </section>
    ),
    progress: progress.length > 0 && (
      <section className="block" id="progress" key="progress">
        <h2>Certification progress</h2>
        {progress.map((p) => (
          <div className="prog" key={p.name}>
            <div className="prog-head"><span>{p.name}</span><span>{p.pct}%</span></div>
            <div className="bar"><i style={{ width: `${p.pct}%` }} /></div>
          </div>
        ))}
      </section>
    ),
    resources: resources.length > 0 && (
      <section className="block" id="resources" key="resources">
        <h2>Resources</h2>
        <div className="grid">
          {resources.map((r) => (
            <a key={r.id} href={r.url} className="card" target="_blank" rel="noreferrer">
              <span className="tag">{r.type}</span>
              <h3>{r.title}</h3>
              {r.note && <p>{r.note}</p>}
            </a>
          ))}
        </div>
      </section>
    ),
    about: (
      <section className="block" id="about" key="about">
        <h2>About</h2>
        <p className="lead" style={{ maxWidth: '60ch' }}>{s.about || 'I am learning cybersecurity, and this blog records my journey.'}</p>
      </section>
    ),
    contact: (
      <section className="block" id="contact" key="contact">
        <h2>Contact</h2>
        <div className="btns" style={{ marginBottom: 24 }}>
          {s.github_url && <a className="btn solid" href={s.github_url} target="_blank" rel="noreferrer">GitHub</a>}
          {s.linkedin_url && <a className="btn" href={s.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
        </div>
        <ContactForm email={s.email || 'thenoobuser04@gmail.com'} />
      </section>
    ),
  };

  return (
    <div className="wrap">
      <header className="top">
        <Link href="/"><img src="/logo.jpg" alt={s.logo_text || 'Kyoraku Hub'} className="logo" /></Link>
        <nav aria-label="Main">
          <a href="#posts">Posts</a>
          <a href="#skills">Skills</a>
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
            <span className="meta">{new Date(featured.created_at).toLocaleDateString('en-GB', { timeZone: 'UTC' })} · Read post</span>
          </Link>
        </section>
      )}

      <div className="hero" style={{ paddingTop: featured ? 40 : 88 }}>
        <p className="kicker">Learning in public</p>
        <h1>{s.hero_title || 'Notes and labs from my cybersecurity journey.'}</h1>
        <p className="lead">{s.hero_sub || 'CTF write-ups, tool notes, certification progress.'}</p>
      </div>

      {cfg.order.filter((k) => !cfg.hidden.includes(k)).map((k) => blocks[k] || null)}

      <footer>
        <span>© Kyoraku Hub</span>
        <span>{s.footer_text || 'Learning cybersecurity in public.'}</span>
      </footer>
    </div>
  );
}
