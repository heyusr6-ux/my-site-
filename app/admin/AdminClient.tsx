'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from '@/lib/content';

const SETTING_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: 'logo_text', label: 'Logo text' },
  { key: 'hero_title', label: 'Hero title' },
  { key: 'hero_sub', label: 'Subtitle' },
  { key: 'about', label: 'About text', multiline: true },
  { key: 'footer_text', label: 'Footer text' },
  { key: 'github_url', label: 'GitHub URL' },
  { key: 'linkedin_url', label: 'LinkedIn URL' },
  { key: 'email', label: 'Email' },
];

const EMPTY = { id: 0, title: "", category: "CTF write-up", cover_url: "", video_url: "", body: "", status: 'draft' as 'draft' | 'published', featured: false };

export default function AdminClient({ posts, settings }: { posts: Post[]; settings: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...EMPTY });
  const [editing, setEditing] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sett, setSett] = useState<Record<string, string>>(settings);

  function edit(p: Post) {
    setEditing(true);
    setForm({ id: p.id, title: p.title, category: p.category || "", cover_url: p.cover_url || "", video_url: p.video_url || "", body: p.body || "", status: p.status, featured: p.featured });
    setMsg('');
    setErr('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditing(false);
    setForm({ ...EMPTY });
  }

  async function savePost(status: 'draft' | 'published') {
    setBusy(true);
    setErr('');
    setMsg('');
    const payload = { title: form.title, category: form.category, cover_url: form.cover_url, video_url: form.video_url, body: form.body, status, featured: form.featured };
    const res = await fetch(editing ? `/api/admin/posts/${form.id}` : '/api/admin/posts', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error || 'Could not save. Try again.');
      return;
    }
    setMsg(status === 'published' ? 'Published.' : 'Draft saved.');
    if (!editing) reset();
    router.refresh();
  }

  async function removePost(id: number) {
    setBusy(true);
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
    setBusy(false);
    setConfirmId(null);
    if (editing && form.id === id) reset();
    router.refresh();
  }

  async function saveSettings() {
    setBusy(true);
    setErr('');
    setMsg('');
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sett),
    });
    setBusy(false);
    if (res.ok) {
      setMsg('Site settings saved.');
      router.refresh();
    } else {
      setErr('Could not save settings.');
    }
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const confirmPost = posts.find((p) => p.id === confirmId);

  return (
    <div className="admin">
      <aside className="side" aria-label="Admin navigation">
        <a href="#posts" style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700, fontSize: 20, color: 'var(--fg)', padding: '0 10px 20px' }}>Breach Log</a>
        <a href="#posts">Posts</a>
        <a href="#settings">Site settings</a>
        <span style={{ flex: 1 }} />
        <a href="/">View site</a>
        <button type="button" className="btn" onClick={logout} style={{ marginTop: 12 }}>Log out</button>
      </aside>

      <main className="main">
        <div className="row" style={{ marginTop: 0, justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 26 }}>Dashboard</h1>
          <span className="pill ok">Admin only</span>
        </div>

        {msg && <p className="ok-msg" role="status">{msg}</p>}
        {err && <p className="err" role="alert">{err}</p>}

        <section id="posts" aria-labelledby="posts-title">
          <h2 id="posts-title" style={{ fontSize: 22 }}>Posts</h2>
          <div className="panel">
            {confirmPost && (
              <div className="row" role="alert" style={{ justifyContent: 'space-between', border: '1px solid var(--warn)', borderRadius: 8, padding: 12, marginTop: 0, marginBottom: 16 }}>
                <span>Delete "{confirmPost.title}"? This cannot be undone.</span>
                <span className="actions">
                  <button type="button" className="btn" onClick={() => setConfirmId(null)}>Cancel</button>
                  <button type="button" className="btn danger" disabled={busy} onClick={() => removePost(confirmPost.id)}>Delete permanently</button>
                </span>
              </div>
            )}
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Status</th><th>Date</th><th /></tr></thead>
                <tbody>
                  {posts.length === 0 && <tr><td colSpan={4}>No posts yet.</td></tr>}
                  {posts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.title}{p.featured && <span className="pill" style={{ marginLeft: 8 }}>Featured</span>}<br /><span className="meta">{p.category}</span></td>
                      <td><span className={`pill ${p.status === 'published' ? 'ok' : 'draft'}`}>{p.status === 'published' ? 'Published' : 'Draft'}</span></td>
                      <td><span className="meta">{new Date(p.created_at).toLocaleDateString('en-GB')}</span></td>
                      <td className="actions">
                        <button type="button" className="btn" onClick={() => edit(p)}>Edit</button>
                        <button type="button" className="btn danger" onClick={() => setConfirmId(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section aria-labelledby="editor-title">
          <h2 id="editor-title" style={{ fontSize: 22 }}>{editing ? 'Edit post' : 'New post'}</h2>
          <div className="panel">
            <div className="two">
              <div>
                <label className="field" htmlFor="p-title">Title</label>
                <input id="p-title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <label className="field" htmlFor="p-cat">Category</label>
                <select id="p-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>CTF write-up</option>
                  <option>Tool notes</option>
                  <option>Learning log</option>
                  <option>Character</option>
                </select>
                <label className="field" htmlFor="p-cover">Cover image URL (photo link)</label>
                <input id="p-cover" type="url" placeholder="https://..." value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
                <label className="field" htmlFor="p-video">Video link (YouTube or Vimeo)</label>
                <input id="p-video" type="url" placeholder="https://www.youtube.com/watch?v=..." value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
                <label className="field" htmlFor="p-body">Content (blank line = new paragraph)</label>
                <textarea id="p-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
              </div>
              <div>
                <label className="field" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  Featured on home page (top)
                </label>
                <p className="meta" style={{ marginTop: 16 }}>Photo ar video-r jonno link dao. Upload ekhono nei.</p>
              </div>
            </div>
            <div className="row">
              {editing && <button type="button" className="btn" onClick={reset}>Cancel edit</button>}
              <button type="button" className="btn" disabled={busy} onClick={() => savePost('draft')}>Save draft</button>
              <button type="button" className="btn solid" disabled={busy} onClick={() => savePost('published')}>Publish</button>
            </div>
          </div>
        </section>

        <section id="settings" aria-labelledby="settings-title">
          <h2 id="settings-title" style={{ fontSize: 22 }}>Site settings</h2>
          <div className="panel">
            <div className="two">
              <div>
                {SETTING_FIELDS.slice(0, 3).map((f) => (
                  <div key={f.key}>
                    <label className="field" htmlFor={f.key}>{f.label}</label>
                    <input id={f.key} type="text" value={sett[f.key] || ''} onChange={(e) => setSett({ ...sett, [f.key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div>
                {SETTING_FIELDS.slice(3).map((f) => (
                  <div key={f.key}>
                    <label className="field" htmlFor={f.key}>{f.label}</label>
                    {f.multiline ? (
                      <textarea id={f.key} style={{ minHeight: 100 }} value={sett[f.key] || ''} onChange={(e) => setSett({ ...sett, [f.key]: e.target.value })} />
                    ) : (
                      <input id={f.key} type="text" value={sett[f.key] || ''} onChange={(e) => setSett({ ...sett, [f.key]: e.target.value })} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="row">
              <button type="button" className="btn solid" disabled={busy} onClick={saveSettings}>Save site settings</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
