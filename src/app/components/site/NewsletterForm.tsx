'use client';

import { useState } from 'react';

/**
 * Public newsletter signup (site footer). Posts to our own /api/updates/join,
 * which subscribes the address to the public Patra list and triggers the
 * double opt-in confirmation e-mail.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const res = await fetch('/api/updates/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'site' }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setErr(data?.error || 'Could not sign you up. Please try again.');
        return;
      }

      setMsg(
        data.has_optin
          ? 'Almost there — check your inbox to confirm.'
          : 'You are subscribed. Thanks!',
      );
      setEmail('');
    } catch {
      setErr('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-muted">Get updates</p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-primary-600"
        />
        <button type="submit" disabled={busy} className="btn-primary !px-4 !py-2 disabled:opacity-50">
          {busy ? '…' : 'Join'}
        </button>
      </div>
      {msg ? <p className="mt-2 text-xs font-semibold text-green-700">{msg}</p> : null}
      {err ? <p className="mt-2 text-xs font-semibold text-red-600">{err}</p> : null}
    </form>
  );
}
