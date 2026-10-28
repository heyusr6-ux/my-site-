'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BlockForm({ blocked }: { blocked: { ip: string; reason: string | null }[] }) {
  const router = useRouter();
  const [ip, setIp] = useState('');
  const [busy, setBusy] = useState(false);

  async function block(value: string) {
    if (!value.trim()) return;
    setBusy(true);
    await fetch('/api/admin/block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ip: value, reason: 'manual' }) });
    setBusy(false);
    setIp('');
    router.refresh();
  }

  async function unblock(value: string) {
    setBusy(true);
    await fetch(`/api/admin/block?ip=${encodeURIComponent(value)}`, { method: 'DELETE' });
    setBusy(false);
    router.refresh();
  }

  return (
    <div>
      <div className="row" style={{ marginTop: 0, justifyContent: 'flex-start' }}>
        <input type="text" aria-label="IP address to block" placeholder="IP address" value={ip} onChange={(e) => setIp(e.target.value)} style={{ maxWidth: 280 }} />
        <button type="button" className="btn danger" disabled={busy} onClick={() => block(ip)}>Block IP</button>
      </div>
      <h3 style={{ fontSize: 16, marginTop: 24 }}>Blocked IPs</h3>
      {blocked.length === 0 && <p className="meta">Kono IP block kora nei.</p>}
      {blocked.map((b) => (
        <div key={b.ip} className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
          <span className="meta">{b.ip}</span>
          <button type="button" className="btn" disabled={busy} onClick={() => unblock(b.ip)}>Unblock</button>
        </div>
      ))}
    </div>
  );
}
