import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Omnipost `subscriber.confirmed` webhook core.
 *
 * Dependency-free by design (only `node:crypto`): the Next.js route adapter
 * and the node:test replay suite both import this file. Keep it that way —
 * no framework, ORM, or alias imports here (Node runs the tests directly).
 */

export const OMNIPOST_EVENT = "subscriber.confirmed";

/** ±5 minutes, per contract. */
export const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

export interface OmnipostList {
  uuid: string;
  name?: string;
  [key: string]: unknown;
}

export interface OmnipostSubscriber {
  uuid: string;
  email: string;
  name?: string | null;
  [key: string]: unknown;
}

export interface OmnipostPayload {
  event: string;
  test?: boolean;
  idempotency_key: string;
  confirmed_at?: string | null;
  subscriber: OmnipostSubscriber;
  lists: OmnipostList[];
  [key: string]: unknown;
}

export interface OmnipostConfirmation {
  idempotencyKey: string;
  subscriber: { uuid: string; email: string; name: string | null };
  listUuids: string[];
  confirmedAt: Date | null;
  test: boolean;
  /**
   * Vendor-registration linkage. `verify` is true when the confirm came from
   * a vendor-registration source; the store then flips Vendor.isVerified.
   * `vendorId` (exact match) wins over `email` (fallback) — may be null.
   */
  vendor: { verify: boolean; vendorId: string | null; email: string };
  /**
   * Delivery-partner-registration linkage. Same shape as vendor: `verify`
   * flips DeliveryPartner.isVerified; `partnerId` wins over `email`.
   */
  deliveryPartner: {
    verify: boolean;
    partnerId: string | null;
    email: string;
  };
}

/**
 * Persistence boundary. The Prisma implementation lives in
 * `store.prisma.ts`; tests inject an in-memory fake.
 */
export interface OmnipostStore {
  processConfirmation(
    input: OmnipostConfirmation,
  ): Promise<{
    duplicate: boolean;
    vendorVerified: boolean;
    vendorMatched: number;
    deliveryPartnerVerified: boolean;
    deliveryPartnerMatched: number;
  }>;
}

export type OmnipostLogLevel = "info" | "warn" | "error";

export interface OmnipostLogEntry {
  level: OmnipostLogLevel;
  message: string;
  meta?: Record<string, unknown>;
}

export interface OmnipostResult {
  status: number;
  body: Record<string, unknown>;
  log: OmnipostLogEntry;
}

/**
 * Per-step trace hook for terminal debugging. The route adapter wires this
 * to `console.info` (`[omnipost] <step> {...}` lines); tests inject a
 * collector. Steps: request.received → verify.timestamp → verify.signature
 * → verify.event → handle.test_skipped | store.duplicate |
 * store.subscriber_upserted → store.vendor_verified | store.vendor_not_found.
 */
export type TraceFn = (step: string, detail?: Record<string, unknown>) => void;

const noTrace: TraceFn = () => {
  /* silent by default — the route adapter wires console, tests inject a collector */
};

/** Canonical trigger value that marks a confirm as a vendor registration. */
export const VENDOR_REGISTRATION_SOURCE = "vendor_registration";

/** Canonical trigger value that marks a confirm as a delivery-partner registration. */
export const DELIVERY_PARTNER_REGISTRATION_SOURCE =
  "delivery_partner_registration";

function readString(...candidates: unknown[]): string | null {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Parse comma-separated vendor list UUIDs (`OMNIPOST_VENDOR_LIST_UUIDS`). */
export function parseVendorListUuids(
  raw: string | null | undefined,
): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Registration linkage for one confirm (shared by vendor / delivery-partner).
 *
 * Trigger (either is enough):
 * - explicit `source` matching `triggerSource` at payload / subscriber /
 *   metadata level (case-insensitive), OR
 * - any confirmed list UUID in `configuredLists` (env-configured).
 *
 * Key (exact ID wins): first non-empty `idKeys` hit across subscriber
 * metadata / subscriber / top-level metadata / top level, else the
 * subscriber email as fallback.
 */
function linkRegistration(
  payload: OmnipostPayload,
  listUuids: string[],
  configuredLists: string[],
  triggerSource: string,
  idKeys: string[],
): { verify: boolean; id: string | null; email: string } {
  const subMeta = asRecord(payload.subscriber.metadata);
  const topMeta = asRecord(payload.metadata);
  const subscriber = asRecord(payload.subscriber);
  const top = asRecord(payload);
  const source = readString(
    payload.source,
    payload.subscriber.source,
    subMeta.source,
    topMeta.source,
  );
  const idCandidates: unknown[] = [];
  for (const key of idKeys) {
    idCandidates.push(subMeta[key], subscriber[key], topMeta[key], top[key]);
  }
  const id = readString(...idCandidates);
  const verify =
    (!!source && source.toLowerCase() === triggerSource) ||
    listUuids.some((uuid) => configuredLists.includes(uuid));
  return { verify, id, email: payload.subscriber.email };
}

/**
 * Vendor-registration linkage for one confirm. See `linkRegistration`.
 */
export function linkVendor(
  payload: OmnipostPayload,
  listUuids: string[],
  vendorListUuids: string[],
): OmnipostConfirmation["vendor"] {
  const link = linkRegistration(
    payload,
    listUuids,
    vendorListUuids,
    VENDOR_REGISTRATION_SOURCE,
    ["vendorId", "vendor_id"],
  );
  return { verify: link.verify, vendorId: link.id, email: link.email };
}

/**
 * Delivery-partner-registration linkage for one confirm. See `linkRegistration`.
 */
export function linkDeliveryPartner(
  payload: OmnipostPayload,
  listUuids: string[],
  deliveryPartnerListUuids: string[],
): OmnipostConfirmation["deliveryPartner"] {
  const link = linkRegistration(
    payload,
    listUuids,
    deliveryPartnerListUuids,
    DELIVERY_PARTNER_REGISTRATION_SOURCE,
    [
      "deliveryPartnerId",
      "delivery_partner_id",
      "partnerId",
      "partner_id",
      "dpId",
      "dp_id",
    ],
  );
  return { verify: link.verify, partnerId: link.id, email: link.email };
}
/** One-way fingerprint of the exact raw bytes hashed (never the body itself). */
export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}
/** lowercase hex HMAC-SHA256 over the exact ASCII string `<ts>.<rawBody>`. */
export function computeOmnipostSignature(
  secret: string,
  timestamp: string,
  rawBody: string,
): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex");
}

function constantTimeHexEqual(a: string, b: string): boolean {
  if (a.length === 0 || a.length !== b.length) return false;
  if (!/^[0-9a-fA-F]+$/.test(a) || !/^[0-9a-fA-F]+$/.test(b)) return false;
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Parse the `OMNIPOST_LIST_SECRETS` JSON map (`{ "<listUuid>": "<secret>" }`). */
export function parseOmnipostSecrets(
  raw: string | null | undefined,
): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const secrets: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      parsed as Record<string, unknown>,
    )) {
      if (typeof value === "string" && value.length > 0) secrets[key] = value;
    }
    return secrets;
  } catch {
    return {};
  }
}

interface VerifyParams {
  rawBody: string;
  signature: string | null;
  timestamp: string | null;
  secrets: Record<string, string>;
  nowSeconds?: number;
  toleranceSeconds?: number;
  /**
   * Temporary triangulation for signature_mismatch debugging
   * (`OMNIPOST_DEBUG=1`). Emits ONE `verify.debug` trace with: secretsLoaded
   * count, event list UUIDs, which lists had a configured secret, first 8
   * chars of the looked-up secret, SHA256 of the exact raw bytes hashed, and
   * the timestamp string. Never the full secret or body. REVERT AFTER USE.
   */
  debugVerify?: boolean;
  onTrace?: TraceFn;
}

export type VerifyOutcome =
  | { ok: true; payload: OmnipostPayload; listUuid: string | null }
  | { ok: false; status: 400 | 401; reason: string };

/**
 * Verification order (per contract):
 * (1) timestamp present and within ±tolerance → else 401
 * (2) HMAC with the calling list's secret, constant-time compare → else 401
 * (3) event === "subscriber.confirmed" → else 400
 *
 * The body must already be the RAW request text — signature is computed
 * over the raw bytes, never over re-serialized JSON.
 */
export function verifyOmnipostRequest(params: VerifyParams): VerifyOutcome {
  const { rawBody, signature, timestamp, secrets } = params;
  const now = params.nowSeconds ?? Math.floor(Date.now() / 1000);
  const tolerance = params.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;

  // (1) timestamp
  if (!timestamp || !/^\d+$/.test(timestamp)) {
    return { ok: false, status: 401, reason: "missing_or_invalid_timestamp" };
  }
  const sentAt = Number(timestamp);
  if (!Number.isFinite(sentAt) || Math.abs(now - sentAt) > tolerance) {
    return { ok: false, status: 401, reason: "stale_timestamp" };
  }

  // Raw body must be valid JSON with the list/subscriber shape.
  // (Parsed here only to discover which list secret applies.)
  let payload: OmnipostPayload;
  try {
    payload = JSON.parse(rawBody) as OmnipostPayload;
  } catch {
    return { ok: false, status: 400, reason: "invalid_json" };
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    !Array.isArray(payload.lists) ||
    !payload.subscriber
  ) {
    return { ok: false, status: 400, reason: "invalid_payload" };
  }

  // (2) HMAC against the calling list's secret
  if (!signature) {
    return { ok: false, status: 401, reason: "missing_signature" };
  }
  let listUuid: string | null = null;
  for (const list of payload.lists) {
    const uuid = typeof list?.uuid === "string" ? list.uuid : "";
    const secret = secrets[uuid];
    if (!secret) continue;
    if (
      constantTimeHexEqual(
        computeOmnipostSignature(secret, timestamp, rawBody),
        signature,
      )
    ) {
      listUuid = uuid;
      break;
    }
  }
  if (!listUuid) {
    if (params.debugVerify) {
      const eventLists = payload.lists.map((list) =>
        typeof list?.uuid === "string" ? list.uuid : "",
      );
      const firstWithSecret = eventLists.find((uuid) => secrets[uuid]);
      (params.onTrace ?? noTrace)("verify.debug", {
        secretsLoaded: Object.keys(secrets).length,
        eventLists,
        listsWithSecret: eventLists.filter((uuid) => !!secrets[uuid]),
        secretList: firstWithSecret ?? null,
        secretPrefix: firstWithSecret ? secrets[firstWithSecret]!.slice(0, 8) : null,
        bodySha256: sha256Hex(rawBody),
        bodyBytes: rawBody.length,
        timestamp,
      });
    }
    return { ok: false, status: 401, reason: "signature_mismatch" };
  }

  // (3) event
  if (payload.event !== OMNIPOST_EVENT) {
    return { ok: false, status: 400, reason: "unexpected_event" };
  }

  return { ok: true, payload, listUuid };
}

export interface HandleParams extends VerifyParams {
  store: OmnipostStore;
  /** Persist `"test": true` deliveries. Default false (test clicks stay out of prod data). */
  persistTestEvents?: boolean;
  /**
   * List UUIDs that mean "vendor registration" (from OMNIPOST_VENDOR_LIST_UUIDS).
   * A confirm on any of these flips Vendor.isVerified — same as an explicit
   * `source: "vendor_registration"` in the payload.
   */
  vendorListUuids?: string[];
  /**
   * List UUIDs that mean "delivery-partner registration" (from
   * OMNIPOST_DELIVERY_PARTNER_LIST_UUIDS). A confirm on any of these flips
   * DeliveryPartner.isVerified — same as an explicit
   * `source: "delivery_partner_registration"` in the payload.
   */
  deliveryPartnerListUuids?: string[];
  /** Per-step terminal trace. Defaults to silent (tests inject a collector). */
  onTrace?: TraceFn;
}

export async function handleOmnipostWebhook(
  params: HandleParams,
): Promise<OmnipostResult> {
  const startedAt = Date.now();
  const trace = params.onTrace ?? noTrace;
  trace("request.received", {
    bytes: params.rawBody.length,
    hasSignature: !!params.signature,
    hasTimestamp: !!params.timestamp,
  });

  const verification = verifyOmnipostRequest(params);
  if (!verification.ok) {
    trace("verify.rejected", {
      reason: verification.reason,
      status: verification.status,
      durationMs: Date.now() - startedAt,
    });
    return {
      status: verification.status,
      body: { ok: false, error: verification.reason },
      log: {
        level: "warn",
        message: "omnipost.webhook.rejected",
        meta: { reason: verification.reason, status: verification.status },
      },
    };
  }
  trace("verify.accepted", {
    listUuid: verification.listUuid,
    durationMs: Date.now() - startedAt,
  });

  const { payload, listUuid } = verification;
  const isTest = payload.test === true;

  // Omnipost "Test webhook" button: verified receipt, no DB side effects.
  if (isTest && !(params.persistTestEvents ?? false)) {
    const durationMs = Date.now() - startedAt;
    trace("handle.test_skipped", { listUuid, durationMs });
    return {
      status: 200,
      body: { ok: true, test: true },
      log: {
        level: "info",
        message: "omnipost.webhook.test",
        meta: { listUuid, subscriberUuid: payload.subscriber.uuid, durationMs },
      },
    };
  }

  const listUuids = payload.lists
    .map((list) => (typeof list?.uuid === "string" ? list.uuid : ""))
    .filter((uuid): uuid is string => uuid.length > 0);

  let confirmedAt: Date | null = null;
  if (payload.confirmed_at) {
    const parsed = new Date(payload.confirmed_at);
    if (!Number.isNaN(parsed.getTime())) confirmedAt = parsed;
  }

  const confirmation: OmnipostConfirmation = {
    idempotencyKey:
      typeof payload.idempotency_key === "string"
        ? payload.idempotency_key
        : "",
    subscriber: {
      uuid: payload.subscriber.uuid,
      email: payload.subscriber.email,
      name: payload.subscriber.name ?? null,
    },
    listUuids,
    confirmedAt,
    test: isTest,
    vendor: linkVendor(payload, listUuids, params.vendorListUuids ?? []),
    deliveryPartner: linkDeliveryPartner(
      payload,
      listUuids,
      params.deliveryPartnerListUuids ?? [],
    ),
  };

  if (
    !confirmation.idempotencyKey ||
    !confirmation.subscriber.uuid ||
    !confirmation.subscriber.email
  ) {
    return {
      status: 400,
      body: { ok: false, error: "invalid_payload" },
      log: {
        level: "warn",
        message: "omnipost.webhook.rejected",
        meta: { reason: "invalid_payload" },
      },
    };
  }

  try {
    const {
      duplicate,
      vendorVerified,
      vendorMatched,
      deliveryPartnerVerified,
      deliveryPartnerMatched,
    } = await params.store.processConfirmation(confirmation);
    const durationMs = Date.now() - startedAt;
    if (duplicate) {
      trace("store.duplicate", {
        idempotencyKey: confirmation.idempotencyKey,
        listUuid,
        durationMs,
      });
      return {
        status: 200,
        body: { ok: true, duplicate: true },
        log: {
          level: "info",
          message: "omnipost.webhook.duplicate",
          meta: {
            idempotencyKey: confirmation.idempotencyKey,
            listUuid,
            durationMs,
          },
        },
      };
    }
    trace("store.subscriber_upserted", {
      subscriberUuid: confirmation.subscriber.uuid,
      email: confirmation.subscriber.email,
      listCount: confirmation.listUuids.length,
      vendorVerifyAttempted: confirmation.vendor.verify,
      deliveryPartnerVerifyAttempted: confirmation.deliveryPartner.verify,
      durationMs,
    });
    if (confirmation.vendor.verify) {
      trace(
        vendorVerified ? "store.vendor_verified" : "store.vendor_not_found",
        {
          subscriberUuid: confirmation.subscriber.uuid,
          email: confirmation.subscriber.email,
          keyedBy: confirmation.vendor.vendorId ? "id" : "email",
          vendorMatched,
          durationMs,
        },
      );
    }
    if (confirmation.deliveryPartner.verify) {
      trace(
        deliveryPartnerVerified
          ? "store.delivery_partner_verified"
          : "store.delivery_partner_not_found",
        {
          subscriberUuid: confirmation.subscriber.uuid,
          email: confirmation.subscriber.email,
          keyedBy: confirmation.deliveryPartner.partnerId ? "id" : "email",
          deliveryPartnerMatched,
          durationMs,
        },
      );
    }
    // A verify was attempted but no row matched (wrong email, unknown ID, or
    // deleted record). Still 200 — retrying wouldn't help — but WARN so the
    // miss is visible in logs instead of silent. Vendor checked first to keep
    // the established shape; DP second.
    if (confirmation.vendor.verify && !vendorVerified) {
      return {
        status: 200,
        body: { ok: true, vendorVerified: false },
        log: {
          level: "warn",
          message: "omnipost.webhook.vendor_not_found",
          meta: {
            subscriberUuid: confirmation.subscriber.uuid,
            listUuid,
            keyedBy: confirmation.vendor.vendorId ? "id" : "email",
            durationMs,
          },
        },
      };
    }
    if (confirmation.deliveryPartner.verify && !deliveryPartnerVerified) {
      return {
        status: 200,
        body: { ok: true, deliveryPartnerVerified: false },
        log: {
          level: "warn",
          message: "omnipost.webhook.delivery_partner_not_found",
          meta: {
            subscriberUuid: confirmation.subscriber.uuid,
            listUuid,
            keyedBy: confirmation.deliveryPartner.partnerId ? "id" : "email",
            durationMs,
          },
        },
      };
    }
    return {
      status: 200,
      body: {
        ok: true,
        ...(confirmation.vendor.verify ? { vendorVerified } : {}),
        ...(confirmation.deliveryPartner.verify
          ? { deliveryPartnerVerified }
          : {}),
      },
      log: {
        level: "info",
        message: "omnipost.webhook.confirmed",
        meta: {
          subscriberUuid: confirmation.subscriber.uuid,
          listUuid,
          listCount: confirmation.listUuids.length,
          durationMs,
          ...(confirmation.vendor.verify
            ? { vendorVerified, vendorMatched }
            : {}),
          ...(confirmation.deliveryPartner.verify
            ? { deliveryPartnerVerified, deliveryPartnerMatched }
            : {}),
        },
      },
    };
  } catch (error) {
    // Genuine transient failure (e.g. DB down) — NOT a processed event,
    // so 500 is correct: Omnipost retries and idempotency makes it safe.
    trace("request.failed", {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    });
    return {
      status: 500,
      body: { ok: false, error: "processing_failed" },
      log: {
        level: "error",
        message: "omnipost.webhook.error",
        meta: {
          error: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - startedAt,
        },
      },
    };
  }
}
