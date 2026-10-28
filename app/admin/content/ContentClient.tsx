'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Skill, Resource } from '@/lib/content';

const LABELS: Record<string, string> = {
  posts: 'Latest posts',
  skills: 'Skills',
  progress: 'Certification progress',
  resources: 'Resources',
  about: 'About',
  contact: 'Contact',
};

export default function ContentClient(props: {
  skills: Skill[];
  resources: Resource[];
  progress: { name: string; pct: number }[];
  order: string[];
  hidden: string[];
}) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Skills
  const [sName, setSName] = useState('');
  const [sLevel, setSLevel] = useState('Intermediate');
  const [sPct, setSPct] = useState(60);

  // Resources
  const [rEdit, setREdit] = useState<number | null>(null);
  const [rTitle, setRTitle] = useState('');
  const [rType, setRType] = useState('Book');
  const [rUrl, setRUrl] = useState('');
  const [rNote, setRNote] = useState('');

  // Progress + sections
  const [prog, setProg] = useState(props.progress);
  const [order, setOrder] = useState(props.order);
  const [hidden, setHidden] = useState<string[]>(props.hidden);

  async function call(url: string, init: RequestInit, done: string) {
    setBusy(true);
    setMsg('');
    const res = await fetch(url, init);
    setBusy(false);
    if (res.ok) {
      setMsg(done);
      router.refresh();
      return true;
    }
    setMsg('Could not save. Try again.');
    return false;
  }

  async function addSkill() {
    if (!sName.trim()) return;
    const ok = await call('/api/admin/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: sName, level: sLevel, pct: sPct }) }, 'Skill added.');
    if (ok) setSName('');
  }

  async function removeSkill(id: number) {
    await call(`/api/admin/skills?id=${id}`, { method: 'DELETE' }, 'Skill removed.');
  }

  function editResource(r: Resource) {
    setREdit(r.id);
    setRTitle(r.title);
    setRType(r.type);
    setRUrl(r.url);
    setRNote(r.note || '');
  }

  function resetResource() {
    setREdit(null);
    setRTitle('');
    setRType('Book');
    setRUrl('');
    setRNote('');
  }

  async function saveResource() {
    if (!rTitle.trim()) return;
    const body = JSON.stringify({ title: rTitle, type: rType, url: rUrl, note: rNote });
    const ok = rEdit
      ? await call(`/api/admin/resources?id=${rEdit}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body }, 'Resource updated.')
      : await call('/api/admin/resources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }, 'Resource added.');
    if (ok) resetResource();
  }

  async function removeResource(id: number) {
    await call(`/api/admin/resources?id=${id}`, { method: 'DELETE' }, 'Resource removed.');
    if (rEdit === id) resetResource();
  }

  async function saveProgress() {
    const payload: Record<string, string> = {};
    prog.forEach((p, i) => {
      payload[`progress_${i + 1}_name`] = p.name;
      payload[`progress_${i + 1}_pct`] = String(p.pct);
    });
    await call('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, 'Progress saved.');
  }

  async function saveSections(nextOrder = order, nextHidden = hidden) {
    await call('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sections: JSON.stringify({ order: nextOrder, hidden: nextHidden }) }) }, 'Page sections saved.');
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...order];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    saveSections(next, hidden);
  }

  function toggle(key: string) {
    const next = hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key];
    setHidden(next);
    saveSections(order, next);
  }

  return (
    <div className="main" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="row" style={{ marginTop: 0, justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24 }}>Skills, progress and resources</h1>
        <a href="/admin">Back to dashboard</a>
      </div>
      {msg && <p className="ok-msg" role="status">{msg}</p>}

      <section className="panel">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Skills</h2>
        <div className="tagrow" style={{ marginBottom: 16 }}>
          {props.skills.map((k) => (
            <span key={k.id} className="meta" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              {k.name} · {k.level} · {k.pct}%
              <button type="button" className="btn danger" disabled={busy} onClick={() => removeSkill(k.id)} aria-label={`Remove ${k.name}`} style={{ padding: '2px 8px' }}>Remove</button>
            </span>
          ))}
        </div>
        <div className="two">
          <div>
            <label className="field" htmlFor="sk-name">Skill name</label>
            <input id="sk-name" type="text" value={sName} onChange={(e) => setSName(e.target.value)} placeholder="e.g. Metasploit" />
            <label className="field" htmlFor="sk-level">Level</label>
            <select id="sk-level" value={sLevel} onChange={(e) => setSLevel(e.target.value)}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </div>
          <div>
            <label className="field" htmlFor="sk-pct">Proficiency: {sPct}%</label>
            <input id="sk-pct" type="range" min={0} max={100} value={sPct} onChange={(e) => setSPct(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
          </div>
        </div>
        <div className="row"><button type="button" className="btn solid" disabled={busy} onClick={addSkill}>Add skill</button></div>
      </section>

      <section className="panel">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Certification progress</h2>
        <div className="two">
          {prog.map((p, i) => (
            <div key={i}>
              <label className="field" htmlFor={`pg-${i}`}>Name</label>
              <input id={`pg-${i}`} type="text" value={p.name} onChange={(e) => setProg(prog.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              <label className="field" htmlFor={`pgp-${i}`}>Progress: {p.pct}%</label>
              <input id={`pgp-${i}`} type="range" min={0} max={100} value={p.pct} onChange={(e) => setProg(prog.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x)))} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            </div>
          ))}
        </div>
        <div className="row"><button type="button" className="btn solid" disabled={busy} onClick={saveProgress}>Save progress</button></div>
      </section>

      <section className="panel">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Resources</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th /></tr></thead>
            <tbody>
              {props.resources.length === 0 && <tr><td colSpan={3}>Ekhono resource nei.</td></tr>}
              {props.resources.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}<br /><span className="meta">{r.url}</span></td>
                  <td><span className="pill">{r.type}</span></td>
                  <td className="actions">
                    <button type="button" className="btn" onClick={() => editResource(r)}>Edit</button>
                    <button type="button" className="btn danger" disabled={busy} onClick={() => removeResource(r.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="two" style={{ marginTop: 20 }}>
          <div>
            <label className="field" htmlFor="r-title">Title</label>
            <input id="r-title" type="text" value={rTitle} onChange={(e) => setRTitle(e.target.value)} />
            <label className="field" htmlFor="r-type">Type</label>
            <select id="r-type" value={rType} onChange={(e) => setRType(e.target.value)}>
              <option>Book</option><option>Course</option><option>Lab</option><option>Website</option>
            </select>
          </div>
          <div>
            <label className="field" htmlFor="r-url">Link</label>
            <input id="r-url" type="url" placeholder="https://" value={rUrl} onChange={(e) => setRUrl(e.target.value)} />
            <label className="field" htmlFor="r-note">Short note</label>
            <input id="r-note" type="text" value={rNote} onChange={(e) => setRNote(e.target.value)} />
          </div>
        </div>
        <div className="row">
          {rEdit && <button type="button" className="btn" onClick={resetResource}>Cancel edit</button>}
          <button type="button" className="btn solid" disabled={busy} onClick={saveResource}>{rEdit ? 'Save resource' : 'Add resource'}</button>
        </div>
      </section>

      <section className="panel">
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Page sections</h2>
        <p className="meta" style={{ marginTop: 0 }}>Upor-niche move korle home page-e oi order-e dekhabe. Off korle section lukabe.</p>
        {order.map((key, i) => (
          <div key={key} className="list-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ opacity: hidden.includes(key) ? 0.45 : 1 }}>{LABELS[key] || key}</span>
            <span className="actions">
              <button type="button" className="btn" disabled={busy || i === 0} onClick={() => move(i, -1)}>Up</button>
              <button type="button" className="btn" disabled={busy || i === order.length - 1} onClick={() => move(i, 1)}>Down</button>
              <button type="button" className="btn" disabled={busy} onClick={() => toggle(key)}>{hidden.includes(key) ? 'Off' : 'On'}</button>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
