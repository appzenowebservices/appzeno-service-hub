/**
 * Patra (Omnipost) transactional e-mail client.
 *
 * Patra exposes `POST /api/tx` for fixed transactional templates. The API is
 * authenticated with the Patra admin session cookie (same door as the admin
 * UI), fetched once and cached in memory for a few hours.
 *
 * Templates live in Patra, not in this repo:
 *   #10  ADDies Service Hub — Welcome
 *   #11  ADDies Service Hub — Reset your password
 *
 * The client is intentionally fire-and-forget friendly: callers wrap it in
 * try/catch (or `void ...catch`) so mail outages never break registration,
 * login or password-reset requests.
 */

const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const TIMEOUT_MS = 12_000;

function parseId(raw: string | undefined, fallback: number): number | null {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function baseCandidates(): string[] {
  const out: string[] = [];
  const push = (raw: string | undefined) =>
    (raw ?? "")
      .split(",")
      .map((s) => s.trim().replace(/\/$/, ""))
      .filter(Boolean)
      .forEach((u) => {
        if (!out.includes(u)) out.push(u);
      });

  push(process.env.PATRA_BASE_URLS);
  push(process.env.PATRA_BASE_URL);
  for (const d of [
    "http://patra_app:9000",
    "http://localhost:9000",
    "https://omnipost.appzenowebservices.com",
  ]) {
    if (!out.includes(d)) out.push(d);
  }
  return out;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain || !user) return "***";
  return `${user.slice(0, 1)}***@${domain}`;
}

type Session = { base: string; cookie: string; at: number };

let cached: Session | null = null;

function readSessionCookie(res: Response): string | null {
  const cookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : (res.headers.get("set-cookie") ?? "").split(/,(?=[^;]+=)/);
  for (const c of cookies) {
    const first = c.split(";")[0]?.trim() ?? "";
    if (first.startsWith("session=")) return first;
  }
  return null;
}

async function login(base: string): Promise<string> {
  const username = process.env.PATRA_ADMIN_USER;
  const password = process.env.PATRA_ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("PATRA_ADMIN_USER / PATRA_ADMIN_PASSWORD are not configured");
  }

  const res = await fetch(`${base}/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const cookie = readSessionCookie(res);
  if (!cookie) {
    throw new Error(`Patra login failed at ${base} (HTTP ${res.status})`);
  }
  return cookie;
}

async function getSession(force = false): Promise<Session> {
  if (!force && cached && Date.now() - cached.at < SESSION_TTL_MS) return cached;

  let lastError: unknown = null;
  for (const base of baseCandidates()) {
    try {
      const cookie = await login(base);
      cached = { base, cookie, at: Date.now() };
      return cached;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Patra login failed");
}

export type PatraTxInput = {
  templateId?: number | null;
  to: string;
  data: Record<string, string>;
};

/**
 * Sends one fixed-template transactional e-mail. Throws on failure so the
 * caller can log it; never call this unguarded inside a core auth flow.
 */
export async function sendPatraTx({ templateId, to, data }: PatraTxInput): Promise<void> {
  const id = templateId ?? null;
  if (!id) {
    console.warn("[patra] tx skipped: template id not configured");
    return;
  }
  const email = to.trim();
  if (!email) {
    console.warn("[patra] tx skipped: empty recipient");
    return;
  }

  const payload = JSON.stringify({
    template_id: id,
    subscriber_mode: "external",
    subscriber_emails: [email],
    data,
  });

  const post = async (session: Session) =>
    fetch(`${session.base}/api/tx`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: session.cookie },
      body: payload,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  let session = await getSession();
  let res = await post(session);
  if (res.status === 401 || res.status === 403) {
    session = await getSession(true);
    res = await post(session);
  }

  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    throw new Error(`Patra tx failed (HTTP ${res.status}): ${body}`);
  }

  console.info(`[patra] tx.sent {"template":${id},"to":"${maskEmail(email)}"}`);
}

export const PATRA_TX_WELCOME = parseId(process.env.PATRA_TX_TEMPLATE_WELCOME, 10);
export const PATRA_TX_RESET_PASSWORD = parseId(process.env.PATRA_TX_TEMPLATE_RESET_PASSWORD, 11);

export function patraConfigured(): boolean {
  return Boolean(process.env.PATRA_ADMIN_USER && process.env.PATRA_ADMIN_PASSWORD);
}

export type PatraEmailStatus = {
  configured: boolean;
  confirmed: boolean;
  subscriptionStatus: string | null;
  subscriberStatus: string | null;
};

type PatraSubscriberRow = {
  email?: string;
  status?: string;
  lists?: { uuid?: string; subscription_status?: string }[];
};

/**
 * Read-only subscriber status lookup through Patra's admin API.
 * The webhook stays the primary source of truth; this only recovers missed
 * confirmations from the admin "Sync" action.
 */
export async function getPatraEmailStatus(
  email: string,
  listUuids: string[],
): Promise<PatraEmailStatus> {
  if (!patraConfigured()) {
    return { configured: false, confirmed: false, subscriptionStatus: null, subscriberStatus: null };
  }
  const address = email.trim().toLowerCase();
  if (!address || listUuids.length === 0) {
    return { configured: true, confirmed: false, subscriptionStatus: null, subscriberStatus: null };
  }

  const query = `email = '${address.replace(/'/g, "''")}'`;
  const path = `/api/subscribers?page=1&per_page=100&query=${encodeURIComponent(query)}`;

  const get = (session: Session) =>
    fetch(`${session.base}${path}`, {
      headers: { cookie: session.cookie },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

  let session = await getSession();
  let res = await get(session);
  if (res.status === 401 || res.status === 403) {
    session = await getSession(true);
    res = await get(session);
  }
  if (!res.ok) {
    throw new Error(`Patra subscriber lookup failed (HTTP ${res.status})`);
  }

  const payload = (await res.json()) as { data?: { results?: PatraSubscriberRow[] } };
  const rows = payload.data?.results ?? [];
  const subscriber = rows.find((r) => (r.email ?? "").trim().toLowerCase() === address);
  if (!subscriber) {
    return { configured: true, confirmed: false, subscriptionStatus: null, subscriberStatus: null };
  }

  const wanted = new Set(listUuids.map((u) => u.trim().toLowerCase()));
  const match = (subscriber.lists ?? []).find((l) => wanted.has((l.uuid ?? "").toLowerCase()));
  const subscriptionStatus = match?.subscription_status ?? null;
  const subscriberStatus = subscriber.status ?? null;

  return {
    configured: true,
    confirmed: subscriptionStatus === "confirmed" && subscriberStatus === "enabled",
    subscriptionStatus,
    subscriberStatus,
  };
}

/**
 * Subscribes/re-subscribes an e-mail to Patra public lists. Patra sends the
 * double opt-in confirmation itself; for an existing unconfirmed subscriber
 * this resends the confirmation e-mail.
 */
export async function subscribeToPatraLists(input: {
  email: string;
  name?: string;
  listUuids: string[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const email = input.email.trim().toLowerCase();
  const listUuids = input.listUuids.map((u) => u.trim()).filter(Boolean);
  if (!email || listUuids.length === 0) {
    return { ok: false, message: "No Patra list is configured for this role." };
  }

  const body = JSON.stringify({
    email,
    ...(input.name?.trim() ? { name: input.name.trim() } : {}),
    list_uuids: listUuids,
  });

  let lastError: unknown = null;
  for (const base of baseCandidates()) {
    try {
      const res = await fetch(`${base}/api/public/subscription`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.ok) return { ok: true };
      const payload = (await res.json().catch(() => null)) as
        | { message?: string; error?: string }
        | null;
      return {
        ok: false,
        message: String(payload?.message ?? payload?.error ?? `Patra returned HTTP ${res.status}`).slice(0, 300),
      };
    } catch (err) {
      lastError = err;
    }
  }

  return {
    ok: false,
    message: lastError instanceof Error ? lastError.message : "Could not reach Patra.",
  };
}

