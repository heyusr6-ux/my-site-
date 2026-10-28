'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BlockedRow, LogRow } from '@/lib/security';

export default function SecurityPanel({
  stats,
  blocked,
  logs,
}: {
  stats: { visits: number; failed: number };
  blocked: BlockedRow[];
  logs: LogRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const blockedSet = new Set(blocked.map((b) => b.ip));

  async function block(ip: string) {
    setBusy(true);
    await fetch('/api/admin/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, reason: 'blocked from dashboard' }),
    });
    setBusy(false);
    router.refresh();
  }

  async function unblock(ip: string) {
    setBusy(true);
    await fetch('/api/admin/security', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <section id="security" aria-labelledby="sec-title">
      <h2 id="sec-title" style={{ fontSize: 22 }}>Security</h2>
      <p className="meta" style={{ marginBottom: 16 }}>Visit, login ar block-er log. Location approximate (Vercel-er IP data theke).</p>

      <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 20 }}>
        <div className="panel"><b style={{ fontSize: 24 }}>{stats.visits}</b><br /><span className="meta">Visits (24h)</span></div>
        <div className="panel"><b style={{ fontSize: 24 }}>{stats.failed}</b><br /><span className="meta">Failed logins (24h)</span></div>
        <div className="panel"><b style={{ fontSize: 24 }}>{blocked.length}</b><br /><span className="meta">Blocked IPs</span></div>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, margin: '0 0 12px' }}>Blocked IPs</h3>
        {blocked.length === 0 && <p className="meta">Kono IP block kora nai.</p>}
        {blocked.map((b) => (
          <div key={b.ip} className="row" style={{ justifyContent: 'space-between', marginTop: 0, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="meta">{b.ip}</span>
            <button type="button" className="btn" disabled={busy} onClick={() => unblock(b.ip)}>Unblock</button>
          </div>
        ))}
      </div>

      <div className="panel">
        <h3 style={{ fontSize: 16, margin: '0 0 12px' }}>Recent activity</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>IP</th><th>Location</th><th>Page</th><th>Event</th><th /></tr></thead>
            <tbody>
              {logs.length === 0 && <tr><td colSpan={6}>Ekhono kono log nei.</td></tr>}
              {logs.map((l, i) => (
                <tr key={i}>
                  <td><span className="meta">{new Date(l.created_at).toLocaleString('en-GB')}</span></td>
                  <td><span className="meta">{l.ip}</span></td>
                  <td>{[l.city, l.country].filter(Boolean).join(', ') || '-'}</td>
                  <td><span className="meta">{l.path}</span></td>
                  <td><span className={`pill ${l.event === 'login_ok' ? 'ok' : l.event.startsWith('login') ? 'draft' : ''}`}>{l.event}</span></td>
                  <td>
                    {l.ip !== 'unknown' && !blockedSet.has(l.ip) && (
                      <button type="button" className="btn danger" disabled={busy} onClick={() => block(l.ip)}>Block</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
