import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const PASSWORD = "Test@123";
const PIN = "226001";
const CUSTOMER = "9111111111";
const VENDOR = "9222222222";
const AGENT = "9333333333";

const db = new PrismaClient();

function readEnv(name) {
  const m = readFileSync(".env", "utf8").match(new RegExp(`^${name}=(.*)$`, "m"));
  return m ? m[1].trim().replace(/^"|"$/g, "") : undefined;
}

async function login(mobile, password) {
  const jar = new Map();
  const cookies = () => [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  const absorb = (res) => {
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      jar.set(pair.slice(0, i), pair.slice(i + 1));
    }
  };
  let res = await fetch(`${BASE}/api/auth/csrf`, { redirect: "manual" });
  absorb(res);
  const { csrfToken } = await res.json();
  res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", cookie: cookies() },
    body: new URLSearchParams({ csrfToken, mobile, password, callbackUrl: `${BASE}/` }),
    redirect: "manual",
  });
  absorb(res);
  res = await fetch(`${BASE}/api/auth/session`, { headers: { cookie: cookies() } });
  const session = await res.json();
  if (!session?.user?.id) throw new Error(`login failed for ${mobile}`);
  return { cookie: cookies(), id: session.user.id, role: session.user.role };
}

async function trpc(session, proc, input) {
  const res = await fetch(`${BASE}/api/trpc/${proc}?batch=1`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: session.cookie },
    body: JSON.stringify({ 0: { json: input } }),
  });
  const body = await res.json();
  if (body?.[0]?.result) return body[0].result.data.json;
  throw new Error(`${proc} failed: ${body?.[0]?.error?.json?.message ?? JSON.stringify(body)}`);
}

async function cleanupTestData() {
  const users = await db.user.findMany({ where: { mobile: { in: [CUSTOMER, VENDOR, AGENT] } }, select: { id: true } });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.notification.deleteMany({ where: { userId: { in: ids } } });
    await db.walletTransaction.deleteMany({ where: { userId: { in: ids } } });
    await db.review.deleteMany({ where: { OR: [{ customerId: { in: ids } }, { vendorId: { in: ids } }] } });
    await db.lead.deleteMany({ where: { vendorId: { in: ids } } });
    await db.booking.deleteMany({ where: { OR: [{ customerId: { in: ids } }, { vendorId: { in: ids } }] } });
    await db.customerProfile.deleteMany({ where: { userId: { in: ids } } });
    await db.vendorProfile.deleteMany({ where: { userId: { in: ids } } });
    await db.agentProfile.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
}

console.log("── setup ─────────────────────────────────");
await cleanupTestData();

// Borrow the real customer's device token so every role's push lands on your phone/browser.
const realCustomer = await db.user.findUnique({ where: { mobile: "9999999999" }, select: { fcmTokens: true } });
const deviceTokens = realCustomer?.fcmTokens ?? [];
console.log(`device tokens borrowed from 9999999999: ${deviceTokens.length}`);

const passwordHash = await hash(PASSWORD, 10);
const customer = await db.user.create({
  data: { fullName: "Flow Test Customer", mobile: CUSTOMER, role: "CUSTOMER", city: "Lucknow", state: "UP", isVerified: true, passwordHash, fcmTokens: deviceTokens, customerProfile: { create: { referralCode: "FLOWTEST", walletBalance: 100 } } },
});
const vendor = await db.user.create({
  data: { fullName: "Flow Test Vendor", mobile: VENDOR, role: "VENDOR", city: "Lucknow", state: "UP", isVerified: true, passwordHash, fcmTokens: deviceTokens, vendorProfile: { create: { businessName: "FlowTest Pros", yearsOfExperience: 3, serviceCategories: [], serviceAreaPincodes: [PIN], workingDays: ["mon"], timeSlots: [], basePricing: { basePrice: 299 }, isApproved: true, kycStatus: "APPROVED" } } },
});
const agent = await db.user.create({
  data: { fullName: "Flow Test Agent", mobile: AGENT, role: "AGENT", city: "Lucknow", state: "UP", isVerified: true, passwordHash, fcmTokens: deviceTokens, agentProfile: { create: { assignedCity: "Lucknow", serviceAreaPincodes: [PIN], commissionPercent: 5, officeAddress: "FlowTest Office, Lucknow" } } },
});
console.log(`test users: customer=${customer.id} vendor=${vendor.id} agent=${agent.id}`);

const cat = await db.category.findFirst({ where: { isActive: true }, select: { id: true, name: true, subCategories: { where: { isActive: true }, select: { id: true, name: true, basePrice: true }, take: 1 } } });
if (!cat?.subCategories[0]) throw new Error("no active category/subcategory found");
const sub = cat.subCategories[0];
console.log(`service: ${cat.name} → ${sub.name} (₹${sub.basePrice})`);

const admin = await login("9000000001", "369");
const customerSession = await login(CUSTOMER, PASSWORD);
const vendorSession = await login(VENDOR, PASSWORD);
const agentSession = await login(AGENT, PASSWORD);
console.log(`sessions: admin=${admin.role} customer=${customerSession.role} vendor=${vendorSession.role} agent=${agentSession.role}`);

const steps = [];
function ok(label, extra = "") { steps.push(label); console.log(`✓ ${label}${extra ? ` — ${extra}` : ""}`); }
async function notifTitles(userId) {
  const ns = await db.notification.findMany({ where: { userId }, orderBy: { createdAt: "asc" }, select: { title: true } });
  return ns.map((n) => n.title);
}

console.log("\n── flow ──────────────────────────────────");
const booking = await trpc(customerSession, "bookings.create", {
  categoryId: cat.id, subCategoryId: sub.id, description: "Flow test: kitchen tap leaking badly",
  images: [], urgency: "normal",
  address: { houseNo: "12A", area: "Gomti Nagar", pincode: PIN, city: "Lucknow" },
  preferredDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  timeSlot: { id: "m1", label: "9:00 AM – 12:00 PM", start: "09:00", end: "12:00" },
  paymentMethod: "cod", baseAmount: sub.basePrice, surgeAmount: 0, visitingCharge: 0, totalAmount: sub.basePrice,
});
ok("1. customer books", `booking #${booking.id.slice(-6)}`);
await new Promise((r) => setTimeout(r, 800));

await trpc(admin, "bookings.assignVendor", { id: booking.id, vendorId: vendor.id });
ok("2. admin assigns vendor (lead created)");
await new Promise((r) => setTimeout(r, 800));

const lead = await db.lead.findFirst({ where: { bookingId: booking.id }, select: { id: true } });
await trpc(vendorSession, "vendors.respondLead", { leadId: lead.id, accept: true });
ok("3. vendor accepts lead", "booking → ACCEPTED");
await new Promise((r) => setTimeout(r, 800));

await trpc(vendorSession, "bookings.updateStatus", { id: booking.id, status: "IN_PROGRESS" });
ok("4. vendor starts work", "booking → IN_PROGRESS");
await new Promise((r) => setTimeout(r, 800));

await trpc(vendorSession, "bookings.updateStatus", { id: booking.id, status: "COMPLETED" });
ok("5. vendor completes job", "booking → COMPLETED");
await new Promise((r) => setTimeout(r, 800));

await trpc(customerSession, "bookings.addReview", { bookingId: booking.id, vendorId: vendor.id, rating: 5, comment: "Superb service, very polite!" });
ok("6. customer rates 5★", "review saved");

await new Promise((r) => setTimeout(r, 1500));

console.log("\n── per-role notifications (in-app rows) ──");
const finalBooking = await db.booking.findUnique({ where: { id: booking.id }, select: { status: true, paymentStatus: true } });
console.log(`booking final: ${finalBooking.status} / payment ${finalBooking.paymentStatus}`);
for (const [label, id] of [["CUSTOMER", customerSession.id], ["VENDOR", vendorSession.id], ["AGENT", agentSession.id]]) {
  const titles = await notifTitles(id);
  console.log(`${label}: ${titles.length ? titles.join(" | ") : "(none)"}`);
}

console.log("\n── cleanup ───────────────────────────────");
await cleanupTestData();
const left = await db.user.count({ where: { mobile: { in: [CUSTOMER, VENDOR, AGENT] } } });
console.log(`test users removed (remaining: ${left}) — real accounts untouched`);
await db.$disconnect();
