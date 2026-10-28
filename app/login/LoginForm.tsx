'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    setBusy(false);
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Incorrect username or password. Please try again.');
    }
  }

  return (
    <form className="panel" onSubmit={submit} style={{ width: '100%', maxWidth: 400, padding: '36px 32px' }} aria-labelledby="login-title">
      <h1 id="login-title" style={{ fontSize: 26 }}>Breach Log</h1>
      <p className="tag" style={{ marginBottom: 20 }}>Admin login</p>
      <label className="field" htmlFor="l-user">Username</label>
      <input id="l-user" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      <label className="field" htmlFor="l-pass">Password</label>
      <div style={{ position: 'relative' }}>
        <input id="l-pass" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: 80 }} />
        <button type="button" onClick={() => setShow(!show)} aria-label="Show or hide password" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, color: 'var(--accent)', cursor: 'pointer' }}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn solid" type="submit" disabled={busy} style={{ width: '100%', marginTop: 22 }}>
        {busy ? 'Checking...' : 'Login'}
      </button>
    </form>
  );
}
