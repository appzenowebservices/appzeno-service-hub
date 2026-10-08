import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/updates/join
 * Body: { email, name?, source? }
 *
 * Server-to-server newsletter signup: validates, routes to the right Patra
 * (Omnipost) list for the signup source, and forwards to Patra's public
 * subscription endpoint. No auth token needed, no CORS, and the Patra host is
 * never exposed to the browser.
 *
 * Source routing:
 *   agent_registration    -> OMNIPOST_AGENT_LIST_UUIDS
 *   vendor_registration   -> OMNIPOST_VENDOR_LIST_UUIDS
 *   customer_registration -> OMNIPOST_CUSTOMER_LIST_UUIDS
 *   anything else / site  -> OMNIPOST_PUBLIC_LIST_UUIDS
 *
 * The confirmation e-mail (double opt-in) is sent by Patra; the confirmed
 * subscriber arrives back through the `subscriber.confirmed` webhook, which
 * stores it in NewsletterSubscriber. Nothing is written to the local DB here.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Base-URL candidates, tried in order until one responds. Same-VPS setups
 * reach Patra via Docker DNS (patra_app) or loopback; outside clients use the
 * public domain. Refused/DNS failures fail fast, so the chain costs ~ms.
 */
function getBaseCandidates(): string[] {
  const out: string[] = [];
  const push = (raw: string | undefined) =>
    (raw || '')
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean)
      .forEach((u) => {
        if (!out.includes(u)) out.push(u);
      });

  push(process.env.OMNIPOST_BASE_URLS);
  push(process.env.OMNIPOST_BASE_URL);
  for (const d of [
    'http://patra_app:9000',
    'http://localhost:9000',
    'https://omnipost.appzenowebservices.com',
  ]) {
    if (!out.includes(d)) out.push(d);
  }
  return out;
}

function parseUuids(raw: string | undefined): string[] {
  return (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getListUuids(source: string): string[] {
  switch (source) {
    case 'agent_registration':
      return parseUuids(process.env.OMNIPOST_AGENT_LIST_UUIDS);
    case 'vendor_registration':
      return parseUuids(process.env.OMNIPOST_VENDOR_LIST_UUIDS);
    case 'customer_registration':
      return parseUuids(process.env.OMNIPOST_CUSTOMER_LIST_UUIDS);
    default:
      return parseUuids(process.env.OMNIPOST_PUBLIC_LIST_UUIDS);
  }
}

function fail(error: string, status: number, retryable = false) {
  return NextResponse.json({ ok: false, error, retryable }, { status });
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown; name?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request. Please try again.', 400);
  }

  const email = String(body?.email || '').trim().toLowerCase();
  const name = String(body?.name || '').trim().slice(0, 100) || undefined;
  const source = String(body?.source || 'site').slice(0, 40);

  if (!EMAIL_RE.test(email)) {
    return fail('Please enter a valid email address.', 400);
  }

  const listUuids = getListUuids(source);
  if (listUuids.length === 0) {
    return fail('Newsletter signup is not configured yet. Please try again later.', 503);
  }

  const forwardBody = JSON.stringify({
    email,
    ...(name ? { name } : {}),
    list_uuids: listUuids,
  });

  let resp: Response | null = null;
  let lastError: unknown = null;
  for (const base of getBaseCandidates()) {
    try {
      resp = await fetch(`${base}/api/public/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: forwardBody,
        signal: AbortSignal.timeout(8000),
      });
      break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!resp) {
    console.error('[updates/join] all omnipost bases unreachable:', lastError);
    return fail('Could not reach the subscription service. Please try again.', 502, true);
  }

  let payload: { data?: { has_optin?: boolean }; message?: string; error?: string } | null = null;
  try {
    payload = await resp.json();
  } catch {
    /* non-JSON body: fall through */
  }

  if (!resp.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      `Subscription failed (status ${resp.status}). Please try again.`;
    return fail(String(msg).slice(0, 300), resp.status >= 500 ? 502 : 400, resp.status >= 500);
  }

  return NextResponse.json({ ok: true, has_optin: !!payload?.data?.has_optin });
}
