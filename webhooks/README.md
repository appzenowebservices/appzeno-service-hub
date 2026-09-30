# webhooks/

Inbound third-party webhooks for this repo — one folder per provider.
Kept at the **repo root** on purpose, next to `src/` (frontend + server):
if this folder exists, the repo receives webhooks. Framework/runtime
adapters (Next.js routes, edge functions, …) stay thin and live with the
app — all verification + handling logic lives here.

```
webhooks/
  README.md                ← you are here
  omnipost/
    core.ts                ← dependency-free: verify + handle (imported by route AND tests)
    store.prisma.ts        ← Prisma persistence (unique-key idempotency, list-merge upsert)
    index.ts               ← public exports
    fixtures/*.json        ← replayable Omnipost payloads
    __tests__/core.test.ts ← node:test suite (no extra deps: `npm test`)
```

## Endpoints (this repo: service-hub / agents)

| Provider | Event | Production URL |
|---|---|---|
| Omnipost | `subscriber.confirmed` | `https://<prod-domain>/api/webhooks/omnipost` |

> Register the **public HTTPS URL** above (this app's prod domain) — HMAC
> covers body+timestamp only, so verification is byte-identical with or
> without TLS as long as Omnipost can reach the endpoint within its timeout.

Paste the URL into the `service.apnidesidukaan-agents` list's **Confirm
webhook URL** field with that list's secret, then hit **Test webhook** — expect exactly one verified-receipt
log line per click (`omnipost.webhook.test` for test clicks,
`omnipost.webhook.confirmed` for real ones, `omnipost.webhook.duplicate` on
retries).

## Secrets (server-side only)

One secret **per Omnipost list**, stored as a JSON map in a single env var:

```bash
OMNIPOST_LIST_SECRETS='{"<listUuid>":"<secret>","<listUuid2>":"<secret2>"}'
```

Declared in `src/env.js` (`OMNIPOST_LIST_SECRETS`, server-only — never
`NEXT_PUBLIC_`). The receiver looks up the secret by the calling list's UUID
from the payload; a multi-list event verifies against any one of its lists'
secrets.

## Contract (implemented exactly)

- `POST` JSON, headers `X-Patra-Signature` (lowercase hex) +
  `X-Patra-Timestamp` (unix seconds).
- Signature = HMAC-SHA256(secret, `"<ts>.<raw body>"`), constant-time compare.
- Verification order: timestamp ±5 min → 401 → HMAC → 401 → event check → 400.
- Handling: upsert `NewsletterSubscriber` by `subscriber.uuid` (never email
  alone), status `confirmed`, list UUIDs **merged**, `confirmed_at` stored;
  `OmnipostProcessedKey` unique PK swallows duplicate deliveries (incl. races
  via P2002). Success → `200 {"ok":true}`; unknown fields ignored.
- `"test": true` deliveries are verified and logged, then answered `200`
  **without** DB writes, so Test-webhook clicks never pollute prod data.
- 500 only on genuine transient failure (e.g. DB down) → Omnipost retries,
  idempotency makes the retry safe. Handler does two indexed writes — well
  under the 5s budget.

## Agent registration → AgentProfile.isVerified (this repo's mapping)

`core.ts` only knows two registration branches — `vendor` and
`deliveryPartner` — and is copied verbatim. This project has one confirming
role (the city agent), so the route feeds the agents list UUID as
`vendorListUuids`: **the vendor branch carries the agent-registration
signal**, and `store.prisma.ts` maps it onto `AgentProfile.isVerified`.
Response/log fields therefore say `vendorVerified` / `vendorMatched` for
agent confirms (same wire shape as super-admin, different table behind it).

A confirm flips `AgentProfile.isVerified=true`. Trigger — either is enough:

1. explicit `"source": "vendor_registration"` in the payload — checked at
   top level, `subscriber`, and `metadata` (either level), case-insensitive; or
2. any confirmed list UUID in `OMNIPOST_AGENT_LIST_UUIDS` (comma-separated
   env — set to the `service.apnidesidukaan-agents` list UUID).

Agent key — exact ID wins: `vendorId` from `subscriber.metadata` /
`subscriber` / top-level `vendor_id` — tell the Omnipost agent to send
`subscriber.metadata.vendorId` = the **AgentProfile id** (User id with
role=AGENT also accepted), else the subscriber **email** as fallback
(case-insensitive, role=AGENT users only, all matching profiles flip via
`updateMany`). A supplied-but-unknown ID verifies nothing (never falls back
to email — wrong-person risk).

## Vendor registration → User.isVerified (role=VENDOR)

Same treatment through core's **delivery-partner branch**: trigger is any
list UUID in `OMNIPOST_VENDOR_LIST_UUIDS` (`service.apnidesidukaan-vendors`).
Key — exact ID wins: `partnerId` / `partner_id` / `dpId` / `dp_id` from
subscriber metadata / subscriber / top level — tell the Omnipost agent to
send `subscriber.metadata.partnerId` = the vendor's **User id**, else the
subscriber **email** as fallback (case-insensitive, role=VENDOR users only,
all matches flip). This flips **only** `User.isVerified` — approval/KYC
(`isApproved`, `kycStatus`) is never touched by email confirmation.
Response/log fields say `deliveryPartnerVerified` / `deliveryPartnerMatched`
for vendor confirms (documented mapping, same wire shape).

## Customer confirmations → upsert only

`service.apnidesidukaan-customers` has no verify branch (customers are
`isVerified` at signup): confirms are signature-verified and upserted, no
flag flips, still 200.

## DB (this project's own tables)

`NewsletterSubscriber` + `OmnipostProcessedKey` live in **this repo's**
`prisma/schema.prisma` (separate database from super-admin — same table
names on purpose, so a future merge is trivial), plus `isVerified` on
`AgentProfile`. This project uses `prisma db push` (MongoDB — no migration
files). After pulling schema changes: `npx prisma generate`.

## Watching it live (terminal)

Every delivery prints a per-step trace plus one result line — all prefixed
`[omnipost]` / `omnipost.webhook.*` for easy tailing:

```bash
npm run dev  # then watch the server terminal, or: docker logs -f <web-container> | grep omnipost
```

A healthy confirm looks like this (times vary):

```text
[omnipost] request.received {"bytes":412,"hasSignature":true,"hasTimestamp":true}
[omnipost] verify.accepted {"listUuid":"f325d481-…","durationMs":1}
[omnipost] store.subscriber_upserted {"subscriberUuid":"96e5fc8b-…","email":"owner@shop.com","listCount":1,"vendorVerifyAttempted":true,"durationMs":38}
[omnipost] store.vendor_verified {"subscriberUuid":"96e5fc8b-…","email":"owner@shop.com","keyedBy":"email","durationMs":41}
{"event":"omnipost.webhook.confirmed","subscriberUuid":"96e5fc8b-…",...}
```

Step cheat-sheet: stops after `verify.rejected` → signature/timestamp problem
(check secret, clock skew, raw-body bytes); `store.vendor_not_found` (warn)
→ trigger fired but no agent row matched (wrong email or unknown ID —
`keyedBy` says which key was tried; in this repo the vendor branch means the
agent); `duplicate` → harmless Omnipost retry, zero side effects. Trace lines
carry the subscriber email for debugging (server-side logs only); the
machine-readable result lines stay PII-free.

### Temporary mismatch triangulation (`OMNIPOST_DEBUG=1`)

For a stubborn `signature_mismatch`: set `OMNIPOST_DEBUG=1`, restart, trigger
one delivery. Each rejection then also prints ONE `verify.debug` line with:
`secretsLoaded` count (0 = env JSON malformed — the usual suspect),
`eventLists`, `listsWithSecret`, first 8 chars of the looked-up secret
(compare against the sender's prefix), `bodySha256` of the exact bytes hashed
(compare against the sender's body hash), and the timestamp string. Full
secrets and bodies are never printed. **Remove the flag right after use.**

## Tests

```bash
npm test   # node:test replays fixtures: valid / tampered / stale / duplicate /
           # concurrent-duplicate / missing-sig / wrong-event / test-click / multi-list
```

`core.ts` stays dependency-free (only `node:crypto`) so the suite runs with
zero test dependencies. The Prisma store is covered by interface contract +
the unique PK; run a live replay against staging to see
`omnipost.webhook.confirmed` end-to-end.

## Replicating to the other apps

Each app repo gets the same layout: copy `webhooks/omnipost/` (core is
provider-identical), add its own `src/app/api/webhooks/omnipost/route.ts`
thin adapter, set that app's `OMNIPOST_LIST_SECRETS`, and register its URL in
its Omnipost list. The MCP server is deliberately NOT involved — webhooks are
the public data plane, MCP is the private agent plane (it may get a
read-only `getSubscriberStatus` tool later).
