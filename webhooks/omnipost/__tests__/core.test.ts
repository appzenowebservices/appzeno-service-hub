import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  computeOmnipostSignature,
  handleOmnipostWebhook,
  parseOmnipostSecrets,
  sha256Hex,
  type OmnipostConfirmation,
  type OmnipostStore,
} from "../core.ts";

const LIST_VENDORS = "190c8161-0000-4000-8000-000000000001";
const LIST_CUSTOMERS = "190c8161-0000-4000-8000-000000000002";
const LIST_DP = "190c8161-0000-4000-8000-000000000003";
const SECRET_VENDORS = "test-secret-for-vendors-list";
const SECRET_CUSTOMERS = "test-secret-for-customers-list";
const SECRET_DP = "test-secret-for-dp-list";
const SECRETS = {
  [LIST_VENDORS]: SECRET_VENDORS,
  [LIST_CUSTOMERS]: SECRET_CUSTOMERS,
  [LIST_DP]: SECRET_DP,
};
/** Matches the fixtures' confirmed_at. */
const FIXED_NOW = Math.floor(Date.parse("2026-09-29T12:00:00Z") / 1000);

function loadFixture(name: string): string {
  return readFileSync(
    fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)),
    "utf8",
  );
}

function sign(
  rawBody: string,
  timestamp = String(FIXED_NOW),
  secret = SECRET_VENDORS,
): { signature: string; timestamp: string } {
  return {
    signature: computeOmnipostSignature(secret, timestamp, rawBody),
    timestamp,
  };
}

/** In-memory store with an atomic unique-key guard, mirroring the DB PK. */
class InMemoryStore implements OmnipostStore {
  keys = new Set<string>();
  subscribers = new Map<string, { email: string; listUuids: string[] }>();
  vendors = new Map<
    string,
    { id: string; email: string; isVerified: boolean; isDeleted: boolean }
  >();
  partners = new Map<
    string,
    { id: string; email: string; isVerified: boolean; isDeleted: boolean }
  >();
  processCalls = 0;
  upsertCalls = 0;
  vendorWrites = 0;
  partnerWrites = 0;

  async processConfirmation(
    input: OmnipostConfirmation,
  ): Promise<{
    duplicate: boolean;
    vendorVerified: boolean;
    vendorMatched: number;
    deliveryPartnerVerified: boolean;
    deliveryPartnerMatched: number;
  }> {
    const dup = { duplicate: true, vendorVerified: false, vendorMatched: 0 };
    const dupDp = { deliveryPartnerVerified: false, deliveryPartnerMatched: 0 };
    this.processCalls += 1;
    if (this.keys.has(input.idempotencyKey))
      return { ...dup, ...dupDp };
    this.keys.add(input.idempotencyKey); // atomic: no await before this line
    this.upsertCalls += 1;
    const existing = this.subscribers.get(input.subscriber.uuid);
    const listUuids = Array.from(
      new Set([...(existing?.listUuids ?? []), ...input.listUuids]),
    );
    this.subscribers.set(input.subscriber.uuid, {
      email: input.subscriber.email,
      listUuids,
    });

    // Mirror of the Prisma updateMany: flip EVERY matching row.
    let vendorMatched = 0;
    let vendorVerified = false;
    if (input.vendor.verify) {
      const targets: Array<{
        id: string;
        email: string;
        isVerified: boolean;
        isDeleted: boolean;
      }> = [];
      if (input.vendor.vendorId) {
        const byId = this.vendors.get(input.vendor.vendorId);
        if (byId && !byId.isDeleted) targets.push(byId);
      } else {
        const want = input.vendor.email.toLowerCase();
        for (const v of this.vendors.values()) {
          if (v.email.toLowerCase() === want && !v.isDeleted) targets.push(v);
        }
      }
      for (const found of targets) {
        found.isVerified = true;
        this.vendorWrites += 1;
      }
      vendorMatched = targets.length;
      vendorVerified = targets.length > 0;
    }

    let deliveryPartnerMatched = 0;
    let deliveryPartnerVerified = false;
    if (input.deliveryPartner.verify) {
      const targets: Array<{
        id: string;
        email: string;
        isVerified: boolean;
        isDeleted: boolean;
      }> = [];
      if (input.deliveryPartner.partnerId) {
        const byId = this.partners.get(input.deliveryPartner.partnerId);
        if (byId && !byId.isDeleted) targets.push(byId);
      } else {
        const want = input.deliveryPartner.email.toLowerCase();
        for (const p of this.partners.values()) {
          if (p.email.toLowerCase() === want && !p.isDeleted) targets.push(p);
        }
      }
      for (const found of targets) {
        found.isVerified = true;
        this.partnerWrites += 1;
      }
      deliveryPartnerMatched = targets.length;
      deliveryPartnerVerified = targets.length > 0;
    }
    return {
      duplicate: false,
      vendorVerified,
      vendorMatched,
      deliveryPartnerVerified,
      deliveryPartnerMatched,
    };
  }
}

void test("valid fixture: 200, subscriber upserted, unknown fields ignored", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const store = new InMemoryStore();
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(result.log.message, "omnipost.webhook.confirmed");
  assert.equal(store.processCalls, 1);
  const sub = store.subscribers.get("96e5fc8b-1111-4111-8111-111111111111");
  assert.ok(sub);
  assert.equal(sub.email, "vendor.owner@example.com");
  assert.deepEqual(sub.listUuids, [LIST_VENDORS]);
});

void test("tampered body: signature over original no longer matches → 401", async () => {
  const original = loadFixture("confirmed.valid.json");
  const { signature, timestamp } = sign(original);
  const tampered = original.replace(
    "vendor.owner@example.com",
    "attacker@example.com",
  );
  const store = new InMemoryStore();
  const result = await handleOmnipostWebhook({
    rawBody: tampered,
    signature,
    timestamp,
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 401);
  assert.deepEqual(result.body, { ok: false, error: "signature_mismatch" });
  assert.equal(store.processCalls, 0);
});

void test("stale timestamp: correctly signed but 10 min old → 401", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const staleTs = String(FIXED_NOW - 600);
  const store = new InMemoryStore();
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody, staleTs),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 401);
  assert.deepEqual(result.body, { ok: false, error: "stale_timestamp" });
  assert.equal(store.processCalls, 0);
});

void test("duplicate delivery: second identical POST returns 200 without side effects", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const store = new InMemoryStore();
  const base = {
    ...sign(rawBody),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  };

  const first = await handleOmnipostWebhook({ rawBody, ...base });
  const second = await handleOmnipostWebhook({ rawBody, ...base });

  assert.equal(first.status, 200);
  assert.deepEqual(first.body, { ok: true });
  assert.equal(second.status, 200);
  assert.deepEqual(second.body, { ok: true, duplicate: true });
  assert.equal(second.log.message, "omnipost.webhook.duplicate");
  assert.equal(store.upsertCalls, 1, "subscriber must be written exactly once");
});

void test("concurrent duplicate deliveries: exactly one wins", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const store = new InMemoryStore();
  const base = {
    ...sign(rawBody),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  };

  const [a, b] = await Promise.all([
    handleOmnipostWebhook({ rawBody, ...base }),
    handleOmnipostWebhook({ rawBody, ...base }),
  ]);

  const bodies = [a.body, b.body];
  assert.ok(bodies.some((body) => (body as { duplicate?: boolean }).duplicate));
  assert.ok(bodies.some((body) => !(body as { duplicate?: boolean }).duplicate));
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(store.upsertCalls, 1);
});

void test("missing signature → 401, missing timestamp → 401", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const store = new InMemoryStore();

  const noSig = await handleOmnipostWebhook({
    rawBody,
    signature: null,
    timestamp: String(FIXED_NOW),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });
  assert.equal(noSig.status, 401);

  const signed = sign(rawBody);
  const noTs = await handleOmnipostWebhook({
    rawBody,
    signature: signed.signature,
    timestamp: null,
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });
  assert.equal(noTs.status, 401);
  assert.equal(store.processCalls, 0);
});

void test("wrong event with valid signature → 400", async () => {
  const rawBody = loadFixture("confirmed.valid.json").replace(
    '"subscriber.confirmed"',
    '"subscriber.updated"',
  );
  const store = new InMemoryStore();
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 400);
  assert.deepEqual(result.body, { ok: false, error: "unexpected_event" });
  assert.equal(store.processCalls, 0);
});

void test("test:true event: verified receipt, no DB side effects", async () => {
  const rawBody = loadFixture("test.connectivity.json");
  const store = new InMemoryStore();
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, test: true });
  assert.equal(result.log.message, "omnipost.webhook.test");
  assert.equal(store.processCalls, 0);
});

void test("multi-list event: secret of any calling list verifies, lists merged", async () => {
  const rawBody = loadFixture("confirmed.multi-list.json");
  const store = new InMemoryStore();
  // Sign with the SECOND list's secret — must still verify.
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody, String(FIXED_NOW), SECRET_CUSTOMERS),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  const sub = store.subscribers.get("96e5fc8b-2222-4222-8222-222222222222");
  assert.ok(sub);
  assert.deepEqual(new Set(sub.listUuids), new Set([LIST_VENDORS, LIST_CUSTOMERS]));
});

void test("parseOmnipostSecrets: valid map, garbage → {}", () => {
  assert.deepEqual(
    parseOmnipostSecrets(JSON.stringify({ a: "s1", b: 42, c: "" })),
    { a: "s1" },
  );
  assert.deepEqual(parseOmnipostSecrets(undefined), {});
  assert.deepEqual(parseOmnipostSecrets("not-json"), {});
  assert.deepEqual(parseOmnipostSecrets("[1,2]"), {});
});

const VENDOR_ID = "507f1f77bcf86cd799439011";

function seedVendor(
  store: InMemoryStore,
  overrides: Partial<{
    id: string;
    email: string;
    isVerified: boolean;
    isDeleted: boolean;
  }> = {},
) {
  const id = overrides.id ?? VENDOR_ID;
  store.vendors.set(id, {
    id,
    email: "different@example.com",
    isVerified: false,
    isDeleted: false,
    ...overrides,
  });
}

void test("vendor list confirm: flips isVerified via email fallback", async () => {
  const rawBody = loadFixture("confirmed.valid.json"); // no source, no vendorId
  const store = new InMemoryStore();
  store.vendors.set("v-email", {
    id: "v-email",
    email: "vendor.owner@example.com",
    isVerified: false,
    isDeleted: false,
  });
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [LIST_VENDORS],
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, vendorVerified: true });
  assert.equal(store.vendors.get("v-email")?.isVerified, true);
  assert.equal(store.vendorWrites, 1);
});

void test("explicit source triggers verify even off the vendor list, by exact ID", async () => {
  const rawBody = loadFixture("confirmed.vendor-registration.json");
  const store = new InMemoryStore();
  seedVendor(store); // email differs from subscriber — ID must match
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [], // list mapping alone would NOT trigger
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, vendorVerified: true });
  assert.equal(store.vendors.get(VENDOR_ID)?.isVerified, true);
});

void test("supplied-but-unknown vendorId verifies NOTHING (no email fallback)", async () => {
  const parsed = JSON.parse(
    loadFixture("confirmed.vendor-registration.json"),
  ) as { subscriber: { metadata: { vendorId: string } } };
  parsed.subscriber.metadata.vendorId = "507f1f77bcf86cd799439099";
  const rawBody = JSON.stringify(parsed);
  const store = new InMemoryStore();
  seedVendor(store, { email: "new.vendor@example.com" }); // email WOULD match
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [],
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, vendorVerified: false });
  assert.equal(store.vendorWrites, 0);
});

void test("non-vendor confirm: no vendorVerified key, vendor untouched", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const store = new InMemoryStore();
  seedVendor(store, { email: "vendor.owner@example.com" });
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [],
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(store.vendorWrites, 0);
});

void test("duplicate vendor confirm: vendor written exactly once", async () => {  const rawBody = loadFixture("confirmed.vendor-registration.json");
  const store = new InMemoryStore();
  seedVendor(store);
  const base = {
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [] as string[],
    store,
    nowSeconds: FIXED_NOW,
  };

  const first = await handleOmnipostWebhook({ rawBody, ...base });
  const second = await handleOmnipostWebhook({ rawBody, ...base });

  assert.deepEqual(first.body, { ok: true, vendorVerified: true });
  assert.deepEqual(second.body, { ok: true, duplicate: true });
  assert.equal(store.vendorWrites, 1);
});

void test("email case differs between signup and vendor row: still verifies", async () => {
  const rawBody = loadFixture("confirmed.valid.json"); // vendor.owner@example.com
  const store = new InMemoryStore();
  store.vendors.set("v-case", {
    id: "v-case",
    email: "Vendor.Owner@Example.COM",
    isVerified: false,
    isDeleted: false,
  });
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [LIST_VENDORS],
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, vendorVerified: true });
  assert.equal(store.vendors.get("v-case")?.isVerified, true);
});

void test("verify attempted but no vendor row: 200 + vendor_not_found warn, no PII", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const store = new InMemoryStore(); // no vendors seeded
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [LIST_VENDORS],
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, vendorVerified: false });
  assert.equal(result.log.level, "warn");
  assert.equal(result.log.message, "omnipost.webhook.vendor_not_found");
  const meta = result.log.meta!;
  assert.equal(meta.subscriberUuid, "96e5fc8b-1111-4111-8111-111111111111");
  assert.equal(meta.listUuid, LIST_VENDORS);
  assert.equal(meta.keyedBy, "email");
  assert.equal(typeof meta.durationMs, "number");
});

void test("trace: valid delivery emits the full step chain", async () => {
  const rawBody = loadFixture("confirmed.vendor-registration.json");
  const store = new InMemoryStore();
  seedVendor(store);
  const steps: string[] = [];
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [],
    store,
    nowSeconds: FIXED_NOW,
    onTrace: (step) => {
      steps.push(step);
    },
  });

  assert.equal(result.status, 200);
  assert.deepEqual(steps, [
    "request.received",
    "verify.accepted",
    "store.subscriber_upserted",
    "store.vendor_verified",
  ]);
});

void test("trace: rejected delivery emits received + rejected only", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const store = new InMemoryStore();
  const steps: string[] = [];
  const staleTs = String(FIXED_NOW - 600);
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody, staleTs),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
    onTrace: (step) => {
      steps.push(step);
    },
  });

  assert.equal(result.status, 401);
  assert.deepEqual(steps, ["request.received", "verify.rejected"]);
  assert.equal(store.processCalls, 0);
});

void test("debugVerify: mismatch emits verify.debug with prefix + body hash", async () => {
  const original = loadFixture("confirmed.valid.json");
  const { signature, timestamp } = sign(original);
  const tampered = original.replace(
    "vendor.owner@example.com",
    "attacker@example.com",
  );
  const store = new InMemoryStore();
  const details: Array<Record<string, unknown>> = [];
  const result = await handleOmnipostWebhook({
    rawBody: tampered,
    signature,
    timestamp,
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
    debugVerify: true,
    onTrace: (step, detail) => {
      if (step === "verify.debug" && detail) details.push(detail);
    },
  });

  assert.equal(result.status, 401);
  assert.equal(details.length, 1);
  const debug = details[0]!;
  assert.equal(debug.secretsLoaded, 3);
  assert.deepEqual(debug.eventLists, [LIST_VENDORS]);
  assert.deepEqual(debug.listsWithSecret, [LIST_VENDORS]);
  assert.equal(debug.secretPrefix, SECRET_VENDORS.slice(0, 8));
  assert.equal(debug.bodySha256, sha256Hex(tampered));
  assert.equal(debug.bodyBytes, tampered.length);
  assert.equal(debug.timestamp, timestamp);
});

void test("debugVerify off: mismatch emits no verify.debug", async () => {
  const original = loadFixture("confirmed.valid.json");
  const { signature, timestamp } = sign(original);
  const tampered = original.replace(
    "vendor.owner@example.com",
    "attacker@example.com",
  );
  const store = new InMemoryStore();
  const steps: string[] = [];
  const result = await handleOmnipostWebhook({
    rawBody: tampered,
    signature,
    timestamp,
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
    onTrace: (step) => {
      steps.push(step);
    },
  });

  assert.equal(result.status, 401);
  assert.ok(!steps.includes("verify.debug"));
});

void test("duplicate email rows: one confirm flips ALL of them", async () => {
  const rawBody = loadFixture("confirmed.valid.json"); // vendor.owner@example.com
  const store = new InMemoryStore();
  for (const id of ["dup-oldest", "dup-mid", "dup-newest"]) {
    store.vendors.set(id, {
      id,
      email: "vendor.owner@example.com",
      isVerified: false,
      isDeleted: false,
    });
  }
  const traces: Array<Record<string, unknown>> = [];
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [LIST_VENDORS],
    store,
    nowSeconds: FIXED_NOW,
    onTrace: (step, detail) => {
      if (step === "store.vendor_verified" && detail) traces.push(detail);
    },
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, vendorVerified: true });
  for (const id of ["dup-oldest", "dup-mid", "dup-newest"]) {
    assert.equal(store.vendors.get(id)?.isVerified, true);
  }
  assert.equal(traces.length, 1);
  assert.equal(traces[0]!.vendorMatched, 3);
});

const PARTNER_ID = "507f1f77bcf86cd799439012";

function seedPartner(
  store: InMemoryStore,
  overrides: Partial<{
    id: string;
    email: string;
    isVerified: boolean;
    isDeleted: boolean;
  }> = {},
) {
  const id = overrides.id ?? PARTNER_ID;
  store.partners.set(id, {
    id,
    email: "different@example.com",
    isVerified: false,
    isDeleted: false,
    ...overrides,
  });
}

void test("dp list confirm: flips isVerified via email fallback", async () => {
  // Strip the metadata ID so the email fallback engages (fixture carries one).
  const parsed = JSON.parse(
    loadFixture("confirmed.delivery-partner-registration.json"),
  ) as { subscriber: { metadata: Record<string, unknown> } };
  delete parsed.subscriber.metadata.deliveryPartnerId;
  const rawBody = JSON.stringify(parsed);
  const store = new InMemoryStore();
  store.partners.set("p-email", {
    id: "p-email",
    email: "new.rider@example.com",
    isVerified: false,
    isDeleted: false,
  });
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody, String(FIXED_NOW), SECRET_DP),
    secrets: SECRETS,
    deliveryPartnerListUuids: [LIST_DP],
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, deliveryPartnerVerified: true });
  assert.equal(store.partners.get("p-email")?.isVerified, true);
  assert.equal(store.partnerWrites, 1);
  // Vendor path untouched by a DP confirm.
  assert.equal(store.vendorWrites, 0);
});

void test("explicit dp source triggers verify off-list, by exact ID", async () => {
  const rawBody = loadFixture("confirmed.delivery-partner-registration.json");
  const store = new InMemoryStore();
  seedPartner(store); // email differs from subscriber — ID must match
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody, String(FIXED_NOW), SECRET_DP),
    secrets: SECRETS,
    deliveryPartnerListUuids: [], // list mapping alone would NOT trigger
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, deliveryPartnerVerified: true });
  assert.equal(store.partners.get(PARTNER_ID)?.isVerified, true);
});

void test("supplied-but-unknown partnerId verifies NOTHING", async () => {
  const parsed = JSON.parse(
    loadFixture("confirmed.delivery-partner-registration.json"),
  ) as { subscriber: { metadata: { deliveryPartnerId: string } } };
  parsed.subscriber.metadata.deliveryPartnerId = "507f1f77bcf86cd799439099";
  const rawBody = JSON.stringify(parsed);
  const store = new InMemoryStore();
  seedPartner(store, { email: "new.rider@example.com" }); // email WOULD match
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody, String(FIXED_NOW), SECRET_DP),
    secrets: SECRETS,
    deliveryPartnerListUuids: [LIST_DP],
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, deliveryPartnerVerified: false });
  assert.equal(store.partnerWrites, 0);
  assert.equal(result.log.message, "omnipost.webhook.delivery_partner_not_found");
});

void test("non-dp confirm: no deliveryPartner keys in body", async () => {
  const rawBody = loadFixture("confirmed.valid.json");
  const store = new InMemoryStore();
  seedPartner(store, { email: "vendor.owner@example.com" });
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(store.partnerWrites, 0);
});

void test("duplicate dp email rows: one confirm flips ALL of them", async () => {
  // Strip the metadata ID so the email fallback engages (fixture carries one).
  const parsed = JSON.parse(
    loadFixture("confirmed.delivery-partner-registration.json"),
  ) as { subscriber: { metadata: Record<string, unknown> } };
  delete parsed.subscriber.metadata.deliveryPartnerId;
  const rawBody = JSON.stringify(parsed);
  const store = new InMemoryStore();
  for (const id of ["rdp-1", "rdp-2"]) {
    store.partners.set(id, {
      id,
      email: "new.rider@example.com",
      isVerified: false,
      isDeleted: false,
    });
  }
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody, String(FIXED_NOW), SECRET_DP),
    secrets: SECRETS,
    deliveryPartnerListUuids: [LIST_DP],
    store,
    nowSeconds: FIXED_NOW,
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, deliveryPartnerVerified: true });
  assert.equal(store.partners.get("rdp-1")?.isVerified, true);
  assert.equal(store.partners.get("rdp-2")?.isVerified, true);
});

void test("combined vendor + dp confirm flips both, reports both", async () => {
  const rawBody = JSON.stringify({
    event: "subscriber.confirmed",
    idempotency_key: "combo-sub:190c8161-0000-4000-8000-000000000001,190c8161-0000-4000-8000-000000000003",
    confirmed_at: "2026-09-29T12:00:00Z",
    subscriber: {
      uuid: "combo-sub",
      email: "both@example.com",
      name: "Both",
    },
    lists: [
      { uuid: LIST_VENDORS, name: "apnidesidukaan-vendors" },
      { uuid: LIST_DP, name: "apnidesidukaan-delivery-partners" },
    ],
  });
  const store = new InMemoryStore();
  store.vendors.set("v-combo", {
    id: "v-combo",
    email: "both@example.com",
    isVerified: false,
    isDeleted: false,
  });
  store.partners.set("p-combo", {
    id: "p-combo",
    email: "both@example.com",
    isVerified: false,
    isDeleted: false,
  });
  const traces: string[] = [];
  const result = await handleOmnipostWebhook({
    rawBody,
    ...sign(rawBody),
    secrets: SECRETS,
    vendorListUuids: [LIST_VENDORS],
    deliveryPartnerListUuids: [LIST_DP],
    store,
    nowSeconds: FIXED_NOW,
    onTrace: (step) => {
      traces.push(step);
    },
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    ok: true,
    vendorVerified: true,
    deliveryPartnerVerified: true,
  });
  assert.equal(store.vendors.get("v-combo")?.isVerified, true);
  assert.equal(store.partners.get("p-combo")?.isVerified, true);
  assert.ok(traces.includes("store.vendor_verified"));
  assert.ok(traces.includes("store.delivery_partner_verified"));
});
