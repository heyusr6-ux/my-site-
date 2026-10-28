const enc = new TextEncoder();

async function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

async function hex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function makeToken() {
  const exp = Date.now() + 48 * 60 * 60 * 1000;
  const payload = `admin.${exp}`;
  const sig = await hex(await crypto.subtle.sign('HMAC', await key(), enc.encode(payload)));
  return `${payload}.${sig}`;
}

export async function verifyToken(token?: string | null) {
  if (!token) return false;
  const [user, exp, sig] = token.split('.');
  if (!user || !exp || !sig || user !== 'admin') return false;
  if (Number(exp) < Date.now()) return false;
  const expected = await hex(await crypto.subtle.sign('HMAC', await key(), enc.encode(`${user}.${exp}`)));
  return expected === sig;
}
