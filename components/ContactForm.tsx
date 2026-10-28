'use client';

import { useState } from 'react';

export default function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState('');
  const [err, setErr] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setErr('Please write a message first.');
      return;
    }
    setErr('');
    const subject = `Message from ${name || 'website visitor'}`;
    const body = `${message}\n\n---\nName: ${name}\nEmail: ${from}`;
    // Opens the visitor's default mail app (Gmail etc.) with everything filled in.
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form onSubmit={submit} className="panel" style={{ maxWidth: 640 }} aria-label="Contact form">
      <label className="field" htmlFor="c-name">Your name</label>
      <input id="c-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="field" htmlFor="c-email">Your email</label>
      <input id="c-email" type="email" autoComplete="email" value={from} onChange={(e) => setFrom(e.target.value)} />
      <label className="field" htmlFor="c-msg">Message</label>
      <textarea id="c-msg" style={{ minHeight: 140 }} value={message} onChange={(e) => setMessage(e.target.value)} />
      {err && <p className="err" role="alert">{err}</p>}
      <div className="row">
        <button type="submit" className="btn solid">Send</button>
      </div>
      <p className="meta" style={{ marginTop: 10 }}>Send chaple tomar mail app khulbe, sob fill kora thakbe.</p>
    </form>
  );
}
