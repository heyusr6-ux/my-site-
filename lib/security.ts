import { sql } from './db';

export type ClientInfo = { ip: string; country: string; city: string; ua: string };

function decode(v: string | null) {
  if (!v) return '';
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

// Reads the visitor's IP and approximate location from Vercel's request headers.
export function clientInfo(req: Request): ClientInfo {
  const h = req.headers;
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
  return {
    ip,
    country: h.get('x-vercel-ip-country') || '',
    city: decode(h.get('x-vercel-ip-city')),
    ua: (h.get('user-agent') || '').slice(0, 300),
  };
}

export async function logAccess(info: ClientInfo, path: string, result: 'success' | 'failed' | 'denied' | 'blocked' | 'locked') {
  await sql`
    INSERT INTO access_log (ip, country, city, path, user_agent, result)
    VALUES (${info.ip}, ${info.country}, ${info.city}, ${path}, ${info.ua}, ${result})`;
}

export async function isBlocked(ip: string): Promise<boolean> {
  const rows = (await sql`SELECT 1 FROM blocked_ips WHERE ip = ${ip} LIMIT 1`) as unknown[];
  return rows.length > 0;
}

// Failed login attempts from this IP in the last 15 minutes.
export async function recentFailures(ip: string): Promise<number> {
  const rows = (await sql`
    SELECT count(*)::int AS n FROM access_log
    WHERE ip = ${ip} AND result = 'failed' AND created_at > now() - interval '15 minutes'`) as { n: number }[];
  return rows[0]?.n ?? 0;
}
