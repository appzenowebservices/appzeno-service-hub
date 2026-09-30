import {
  handleOmnipostWebhook,
  parseOmnipostSecrets,
  parseVendorListUuids,
} from "../../../../../webhooks/omnipost/index";
import { prismaOmnipostStore } from "../../../../../webhooks/omnipost/store.prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Omnipost `subscriber.confirmed` receiver (agents project).
 *
 * Thin adapter only — verification + handling live in
 * `/webhooks/omnipost/core.ts` (verbatim, provider-identical).
 *
 * MAPPING NOTE: core knows `vendor` / `deliveryPartner` branches. This repo
 * has one confirming role — the city agent — so the agents list UUID is fed
 * as `vendorListUuids`: the vendor branch carries the agent-registration
 * signal and the store flips AgentProfile.isVerified. Response/log fields
 * therefore say `vendorVerified` for agent confirms (same wire shape as
 * super-admin, different table behind it).
 */
export async function POST(req: Request) {
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
    debugVerify: process.env.OMNIPOST_DEBUG === "1",
    onTrace: (step, detail) => console.info(`[omnipost] ${step}`, detail ?? {}),
  });

  // One machine-readable line per delivery (PII-free).
  const line = JSON.stringify({ event: result.log.message, ...result.log.meta });
  if (result.log.level === "error") console.error(line);
  else if (result.log.level === "warn") console.warn(line);
  else console.info(line);

  return Response.json(result.body, { status: result.status });
}
