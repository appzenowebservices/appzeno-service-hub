import {
  handleOmnipostWebhook,
  parseOmnipostSecrets,
  parseVendorListUuids,
} from "../../../../../webhooks/omnipost/index";
import { prismaOmnipostStore } from "../../../../../webhooks/omnipost/store.prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function configuredLists(): string[] {
  return parseVendorListUuids(
    [
      process.env.OMNIPOST_AGENT_LIST_UUIDS,
      process.env.OMNIPOST_VENDOR_LIST_UUIDS,
      process.env.OMNIPOST_CUSTOMER_LIST_UUIDS,
    ]
      .filter((v): v is string => typeof v === "string" && v.trim() !== "")
      .join(","),
  );
}

function secretsLoaded(): number {
  return Object.keys(parseOmnipostSecrets(process.env.OMNIPOST_LIST_SECRETS)).length;
}

// Boot diagnostic — visible once per server start in docker/next logs.
// Counts only; secrets and full UUIDs are never printed here.
console.info(
  `[omnipost] receiver.armed {"listsConfigured":${configuredLists().length},"secretsLoaded":${secretsLoaded()}}`,
);

/**
 * Health probe (no secrets needed): GET /api/webhooks/omnipost
 * Use on the VPS to confirm the route is deployed and which lists it knows.
 * List UUIDs are public identifiers (they ship inside subscribe forms).
 */
export async function GET() {
  return Response.json({
    ok: true,
    service: "omnipost-webhook",
    listsConfigured: configuredLists(),
    secretsLoaded: secretsLoaded(),
    time: new Date().toISOString(),
  });
}

/**
 * Omnipost `subscriber.confirmed` receiver (agents project).
 *
 * Thin adapter only — verification + handling live in
 * `/webhooks/omnipost/core.ts` (verbatim, provider-identical).
 *
 * MAPPING NOTE: core knows `vendor` / `deliveryPartner` branches. This repo
 * maps them as:
 * - vendor branch          ← agents list      → flips AgentProfile.isVerified
 *   (+ the agent User.isVerified)
 * - deliveryPartner branch ← vendors + customers lists → flips User.isVerified
 *   on role=VENDOR rows (vendors list) and role=CUSTOMER rows + their
 *   CustomerProfile.isApproved (customers list). The store tells the two
 *   apart by list membership, so a customer confirm can never verify a
 *   vendor row and vice versa. KYC approval is never touched.
 * Response/log fields therefore say `vendorVerified` for agent confirms and
 * `deliveryPartnerVerified` for vendor/customer confirms (same wire shape as
 * super-admin, different tables behind it).
 */
export async function POST(req: Request) {
  const startedAt = Date.now();
  // RAW body — the signature is computed over these exact bytes.
  const rawBody = await req.text();
  const signature = req.headers.get("x-patra-signature");
  const timestamp = req.headers.get("x-patra-timestamp");

  const result = await handleOmnipostWebhook({
    rawBody,
    signature,
    timestamp,
    secrets: parseOmnipostSecrets(process.env.OMNIPOST_LIST_SECRETS),
    store: prismaOmnipostStore,
    vendorListUuids: parseVendorListUuids(process.env.OMNIPOST_AGENT_LIST_UUIDS),
    deliveryPartnerListUuids: parseVendorListUuids(
      [process.env.OMNIPOST_VENDOR_LIST_UUIDS, process.env.OMNIPOST_CUSTOMER_LIST_UUIDS]
        .filter((v): v is string => typeof v === "string" && v.trim() !== "")
        .join(","),
    ),
    debugVerify: process.env.OMNIPOST_DEBUG === "1",
    onTrace: (step, detail) => console.info(`[omnipost] ${step}`, detail ?? {}),
  });

  // One machine-readable line per delivery (PII-free) + a tail-friendly echo.
  const line = JSON.stringify({ event: result.log.message, ...result.log.meta });
  if (result.log.level === "error") console.error(line);
  else if (result.log.level === "warn") console.warn(line);
  else console.info(line);
  console.info(
    `[omnipost] delivery.done {"status":${result.status},"event":"${result.log.message}","durationMs":${Date.now() - startedAt}}`,
  );

  return Response.json(result.body, { status: result.status });
}
