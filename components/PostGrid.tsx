'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Post } from '@/lib/content';

function excerpt(text: string | null, max = 140) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max).trimEnd() + '...' : clean;
}

export default function PostGrid({ posts }: { posts: Post[] }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const cats = ['All', ...Array.from(new Set(posts.map((p) => p.category || 'Post')))];
  const list = posts.filter(
    (p) =>
      (cat === 'All' || (p.category || 'Post') === cat) &&
      (!q || (p.title + ' ' + (p.body || '')).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <div className="toolbar">
        <input type="search" aria-label="Search posts" placeholder="Search posts..." value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="chips" role="group" aria-label="Category">
          {cats.map((c) => (
            <button key={c} type="button" className={`chip${c === cat ? ' on' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <p className="lead">Kono post paoa jay nai.</p>
      ) : (
        <div className="grid">
          {list.map((p) => (
            <Link key={p.id} href={`/posts/${p.slug}`} className="card">
              <span className="tag">{p.category || 'Post'}</span>
              <h3>{p.title}</h3>
              <p>{excerpt(p.body)}</p>
              <span className="meta">{new Date(p.created_at).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
