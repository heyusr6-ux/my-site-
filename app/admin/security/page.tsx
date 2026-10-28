import Link from 'next/link';
import { sql } from '@/lib/db';
import BlockForm from './BlockForm';

export const dynamic = 'force-dynamic';

type LogRow = { created_at: string; ip: string; country: string; city: string; path: string; result: string; user_agent: string };

export default async function SecurityPage() {
  const logs = (await sql`
    SELECT created_at, ip, country, city, path, result, user_agent
    FROM access_log ORDER BY created_at DESC LIMIT 200`) as unknown as LogRow[];
  const blocked = (await sql`SELECT ip, reason FROM blocked_ips ORDER BY created_at DESC`) as unknown as { ip: string; reason: string | null }[];

  return (
    <div className="main" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="row" style={{ marginTop: 0, justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 24 }}>Security log</h1>
        <Link href="/admin">Back to dashboard</Link>
      </div>
      <p className="meta">Admin area-te shob chesta ar login attempt ekhane thake. Location approximate.</p>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>IP</th><th>Location</th><th>Path</th><th>Result</th><th>Device</th></tr></thead>
            <tbody>
              {logs.length === 0 && <tr><td colSpan={6}>Ekhono kono log nei.</td></tr>}
              {logs.map((l, i) => (
                <tr key={i}>
                  <td><span className="meta">{new Date(l.created_at).toLocaleString('en-GB')}</span></td>
                  <td><span className="meta">{l.ip}</span></td>
                  <td>{[l.city, l.country].filter(Boolean).join(', ') || '-'}</td>
                  <td><span className="meta">{l.path}</span></td>
                  <td><span className={`pill ${l.result === 'success' ? 'ok' : l.result === 'failed' || l.result === 'denied' ? 'draft' : ''}`}>{l.result}</span></td>
                  <td><span className="meta" style={{ maxWidth: 260, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>{l.user_agent}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginTop: 0 }}>Block an IP</h2>
        <BlockForm blocked={blocked} />
      </section>
    </div>
  );
}
