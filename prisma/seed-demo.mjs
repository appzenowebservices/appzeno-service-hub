import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

/**
 * Demo data for the Service Hub booking flow.
 *
 * Safe to re-run: only removes/recreates accounts and bookings marked as demo.
 * All demo accounts use the password: Demo@12345
 *
 *   node prisma/seed-demo.mjs
 */

const db = new PrismaClient();
const PASSWORD = "Demo@12345";
const CITY = "Lucknow";
const STATE = "Uttar Pradesh";
const EMAILS = [
  "agent.central@demo.addies.local",
  "agent.east@demo.addies.local",
  "vendor.quickfix@demo.addies.local",
  "vendor.coolcare@demo.addies.local",
  "vendor.sparkle@demo.addies.local",
  "customer.aarav@demo.addies.local",
  "customer.meera@demo.addies.local",
];
const MOBILES = ["9876590101", "9876590102", "9876590201", "9876590202", "9876590203", "9876590301", "9876590302"];

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000);
}
function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
function ev(status, action, actorRole, note, at) {
  return { status, action, actorRole, note, createdAt: at };
}

async function cleanup() {
  const oldUsers = await db.user.findMany({
    where: { OR: [{ email: { in: EMAILS } }, { mobile: { in: MOBILES } }] },
    select: { id: true },
  });
  const ids = oldUsers.map((u) => u.id);
  const demoBookings = await db.booking.findMany({
    where: {
      OR: [
        ...(ids.length ? [{ customerId: { in: ids } }, { vendorId: { in: ids } }, { agentId: { in: ids } }] : []),
        { description: { startsWith: "Demo:" } },
      ],
    },
    select: { id: true },
  });
  const bookingIds = demoBookings.map((b) => b.id);
  if (bookingIds.length) {
    await db.bookingEvent.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await db.lead.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await db.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await db.booking.deleteMany({ where: { id: { in: bookingIds } } });
  }
  if (ids.length) {
    await db.notification.deleteMany({ where: { userId: { in: ids } } });
    await db.agentProfile.deleteMany({ where: { userId: { in: ids } } });
    await db.vendorProfile.deleteMany({ where: { userId: { in: ids } } });
    await db.customerProfile.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
}

try {
  await cleanup();

  const area = await db.servingArea.findFirst({ where: { city: CITY, isActive: true } });
  if (!area) throw new Error(`Serving area ${CITY} not found`);
  const needed = ["226001", "226002", "226003", "226010"];
  const missing = needed.filter((p) => !area.pincodes.includes(p));
  if (missing.length) throw new Error(`Lucknow area is missing pincodes: ${missing.join(", ")}`);

  const categories = await db.category.findMany({
    where: { slug: { in: ["ac-service", "home-cleaning", "plumbing", "electrical", "appliance-repair"] } },
    include: { subCategories: { where: { isActive: true } } },
  });
  const cat = (slug) => {
    const c = categories.find((x) => x.slug === slug);
    if (!c?.subCategories[0]) throw new Error(`Category/subcategory missing: ${slug}`);
    return { categoryId: c.id, subCategoryId: c.subCategories[0].id, name: c.name, subName: c.subCategories[0].name, basePrice: c.subCategories[0].basePrice };
  };
  const cats = {
    ac: cat("ac-service"),
    cleaning: cat("home-cleaning"),
    plumbing: cat("plumbing"),
    electrical: cat("electrical"),
    appliance: cat("appliance-repair"),
  };

  const passwordHash = await hash(PASSWORD, 10);

  const agentA = await db.user.create({
    data: {
      fullName: "Demo Agent — Central Lucknow",
      mobile: MOBILES[0],
      email: EMAILS[0],
      passwordHash,
      role: "AGENT",
      city: CITY,
      state: STATE,
      isVerified: true,
      isActive: true,
      agentProfile: {
        create: {
          assignedCity: CITY,
          officeAddress: "Hazratganj, Lucknow",
          serviceAreaPincodes: ["226001", "226002", "226010"],
          commissionPercent: 5,
          isVerified: true,
        },
      },
    },
  });
  const agentB = await db.user.create({
    data: {
      fullName: "Demo Agent — East Lucknow",
      mobile: MOBILES[1],
      email: EMAILS[1],
      passwordHash,
      role: "AGENT",
      city: CITY,
      state: STATE,
      isVerified: true,
      isActive: true,
      agentProfile: {
        create: {
          assignedCity: CITY,
          officeAddress: "Indira Nagar, Lucknow",
          serviceAreaPincodes: ["226003", "226004"],
          commissionPercent: 6,
          isVerified: true,
        },
      },
    },
  });

  const vendorA = await db.user.create({
    data: {
      fullName: "Rohit Verma",
      mobile: MOBILES[2],
      email: EMAILS[2],
      passwordHash,
      role: "VENDOR",
      city: CITY,
      state: STATE,
      isVerified: true,
      isActive: true,
      vendorProfile: {
        create: {
          businessName: "Demo QuickFix Home Services",
          yearsOfExperience: 8,
          serviceCategories: ["home-cleaning", "plumbing", "electrical"],
          serviceAreaPincodes: ["226001", "226002", "226003", "226010"],
          workingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
          timeSlots: [{ id: "m1", label: "9AM-12PM", start: "09:00", end: "12:00" }],
          basePricing: { basePrice: 299, emergencyCharge: 150, visitingCharge: 99 },
          kycStatus: "APPROVED",
          isApproved: true,
          rating: 4.8,
          totalReviews: 31,
          reliabilityScore: 96,
          streetAddress: "Hazratganj, Lucknow",
        },
      },
    },
  });
  const vendorB = await db.user.create({
    data: {
      fullName: "Suresh Yadav",
      mobile: MOBILES[3],
      email: EMAILS[3],
      passwordHash,
      role: "VENDOR",
      city: CITY,
      state: STATE,
      isVerified: true,
      isActive: true,
      vendorProfile: {
        create: {
          businessName: "Demo CoolCare AC Experts",
          yearsOfExperience: 12,
          serviceCategories: ["ac-service", "appliance-repair"],
          serviceAreaPincodes: ["226001", "226002", "226010"],
          workingDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          timeSlots: [{ id: "m1", label: "9AM-12PM", start: "09:00", end: "12:00" }],
          basePricing: { basePrice: 399, emergencyCharge: 200, visitingCharge: 99 },
          kycStatus: "APPROVED",
          isApproved: true,
          rating: 4.9,
          totalReviews: 24,
          reliabilityScore: 98,
          streetAddress: "Gomti Nagar, Lucknow",
        },
      },
    },
  });
  await db.user.create({
    data: {
      fullName: "Neha Singh",
      mobile: MOBILES[4],
      email: EMAILS[4],
      passwordHash,
      role: "VENDOR",
      city: CITY,
      state: STATE,
      isVerified: true,
      isActive: true,
      vendorProfile: {
        create: {
          businessName: "Demo Sparkle Cleaning Co.",
          yearsOfExperience: 5,
          serviceCategories: ["home-cleaning"],
          serviceAreaPincodes: ["226003", "226004"],
          workingDays: ["mon", "tue", "wed", "thu", "fri"],
          timeSlots: [{ id: "m1", label: "9AM-12PM", start: "09:00", end: "12:00" }],
          basePricing: { basePrice: 499, emergencyCharge: 0, visitingCharge: 0 },
          kycStatus: "APPROVED",
          isApproved: true,
          rating: 4.7,
          totalReviews: 18,
          reliabilityScore: 93,
          streetAddress: "Indira Nagar, Lucknow",
        },
      },
    },
  });

  const customerA = await db.user.create({
    data: {
      fullName: "Aarav Sharma",
      mobile: MOBILES[5],
      email: EMAILS[5],
      passwordHash,
      role: "CUSTOMER",
      city: CITY,
      state: STATE,
      isVerified: true,
      isActive: true,
      customerProfile: { create: { referralCode: "DEMOAARAV", walletBalance: 250 } },
    },
  });
  const customerB = await db.user.create({
    data: {
      fullName: "Meera Gupta",
      mobile: MOBILES[6],
      email: EMAILS[6],
      passwordHash,
      role: "CUSTOMER",
      city: CITY,
      state: STATE,
      isVerified: true,
      isActive: true,
      customerProfile: { create: { referralCode: "DEMOMEERA", walletBalance: 100 } },
    },
  });

  function createBooking(input) {
    const base = input.sub.basePrice;
    const total = input.total ?? (base + 99);
    return db.booking.create({
      data: {
        customerId: input.customer.id,
        vendorId: input.vendor?.id ?? null,
        agentId: input.agent.id,
        agentAssignedAt: daysAgo(input.daysAgo ?? 1),
        categoryId: input.sub.categoryId,
        subCategoryId: input.sub.subCategoryId,
        description: input.description,
        images: [],
        urgency: input.urgency ?? "normal",
        address: input.address,
        preferredDate: input.preferredDate,
        timeSlot: { id: "m1", label: "9AM-12PM", start: "09:00", end: "12:00" },
        status: input.status,
        paymentMethod: input.paymentMethod ?? "cod",
        paymentStatus: input.paymentStatus ?? "PENDING",
        baseAmount: base,
        surgeAmount: 0,
        visitingCharge: input.visitingCharge ?? 99,
        totalAmount: total,
        pincode: input.address.pincode,
        city: input.address.city,
        createdAt: input.createdAt,
        updatedAt: input.createdAt,
        events: { create: input.events },
        ...(input.review
          ? {
              Review: {
                create: {
                  customerId: input.customer.id,
                  vendorId: input.vendor.id,
                  rating: input.review.rating,
                  comment: input.review.comment,
                  createdAt: input.review.at,
                },
              },
            }
          : {}),
      },
    });
  }

  const b1 = await createBooking({
    customer: customerA,
    vendor: vendorB,
    agent: agentA,
    sub: cats.ac,
    description: "Demo: AC foam-jet service — 1.5 ton split",
    address: { houseNo: "B-204", area: "Gomti Nagar", pincode: "226001", city: CITY, landmark: "Near Sahara Ganj" },
    preferredDate: "2026-11-03",
    status: "COMPLETED",
    paymentMethod: "upi",
    paymentStatus: "PAID",
    createdAt: daysAgo(3),
    events: [
      ev("PENDING", "STATUS", "CUSTOMER", "Booking placed", minutesAgo(3 * 24 * 60)),
      ev("PENDING", "AGENT_ASSIGNED", "SYSTEM", "Area agent Demo Agent — Central Lucknow assigned for pincode 226001", minutesAgo(3 * 24 * 60 - 1)),
      ev("ASSIGNED", "VENDOR_ASSIGNED", "AGENT", "Demo CoolCare AC Experts assigned by agent for pincode 226001", minutesAgo(3 * 24 * 60 - 5)),
      ev("ACCEPTED", "STATUS", "VENDOR", "Accepted by pro", minutesAgo(3 * 24 * 60 - 20)),
      ev("IN_PROGRESS", "STATUS", "VENDOR", "Vendor marked IN_PROGRESS", minutesAgo(3 * 24 * 60 - 50)),
      ev("COMPLETED", "STATUS", "VENDOR", "Vendor marked COMPLETED", minutesAgo(3 * 24 * 60 - 80)),
      ev("REVIEWED", "STATUS", "CUSTOMER", "Rated 5/5.", minutesAgo(3 * 24 * 60 - 90)),
    ],
    review: { rating: 5, comment: "Quick, clean and explained everything.", at: minutesAgo(3 * 24 * 60 - 90) },
  });

  const b2 = await createBooking({
    customer: customerB,
    agent: agentA,
    sub: cats.cleaning,
    description: "Demo: 2BHK deep cleaning",
    address: { houseNo: "12A", area: "Hazratganj", pincode: "226002", city: CITY },
    preferredDate: "2026-11-06",
    status: "PENDING",
    total: 2999,
    createdAt: minutesAgo(45),
    events: [
      ev("PENDING", "STATUS", "CUSTOMER", "Booking placed", minutesAgo(45)),
      ev("PENDING", "AGENT_ASSIGNED", "SYSTEM", "Area agent Demo Agent — Central Lucknow assigned for pincode 226002", minutesAgo(44)),
    ],
  });

  const b3 = await createBooking({
    customer: customerA,
    vendor: vendorA,
    agent: agentA,
    sub: cats.plumbing,
    description: "Demo: Tap and mixer repair",
    address: { houseNo: "C-7", area: "Aliganj", pincode: "226010", city: CITY },
    preferredDate: "2026-11-05",
    status: "ACCEPTED",
    total: 398,
    createdAt: minutesAgo(180),
    events: [
      ev("PENDING", "STATUS", "CUSTOMER", "Booking placed", minutesAgo(180)),
      ev("PENDING", "AGENT_ASSIGNED", "SYSTEM", "Area agent Demo Agent — Central Lucknow assigned for pincode 226010", minutesAgo(179)),
      ev("ASSIGNED", "VENDOR_ASSIGNED", "AGENT", "Demo QuickFix Home Services assigned by agent for pincode 226010", minutesAgo(150)),
      ev("ACCEPTED", "STATUS", "VENDOR", "Accepted by pro", minutesAgo(120)),
    ],
  });

  const b4 = await createBooking({
    customer: customerB,
    vendor: vendorA,
    agent: agentB,
    sub: cats.electrical,
    description: "Demo: Switchboard and ceiling fan installation",
    address: { houseNo: "D-31", area: "Indira Nagar", pincode: "226003", city: CITY },
    preferredDate: "2026-11-05",
    status: "IN_PROGRESS",
    total: 748,
    createdAt: minutesAgo(300),
    events: [
      ev("PENDING", "STATUS", "CUSTOMER", "Booking placed", minutesAgo(300)),
      ev("PENDING", "AGENT_ASSIGNED", "SYSTEM", "Area agent Demo Agent — East Lucknow assigned for pincode 226003", minutesAgo(299)),
      ev("ASSIGNED", "VENDOR_ASSIGNED", "AGENT", "Demo QuickFix Home Services assigned by agent for pincode 226003", minutesAgo(260)),
      ev("ACCEPTED", "STATUS", "VENDOR", "Accepted by pro", minutesAgo(240)),
      ev("IN_PROGRESS", "STATUS", "VENDOR", "Vendor marked IN_PROGRESS", minutesAgo(60)),
    ],
  });

  const b5 = await createBooking({
    customer: customerA,
    agent: agentA,
    sub: cats.appliance,
    description: "Demo: Washing machine inspection and repair",
    address: { houseNo: "A-9", area: "Chowk", pincode: "226001", city: CITY },
    preferredDate: "2026-11-06",
    status: "PENDING",
    total: 598,
    createdAt: minutesAgo(600),
    events: [
      ev("PENDING", "STATUS", "CUSTOMER", "Booking placed", minutesAgo(600)),
      ev("PENDING", "AGENT_ASSIGNED", "SYSTEM", "Area agent Demo Agent — Central Lucknow assigned for pincode 226001", minutesAgo(599)),
      ev("ASSIGNED", "VENDOR_ASSIGNED", "AGENT", "Demo CoolCare AC Experts assigned by agent for pincode 226001", minutesAgo(560)),
      ev("PENDING", "VENDOR_DECLINED", "VENDOR", "Declined by pro — returned to the area queue", minutesAgo(540)),
    ],
  });

  await db.lead.createMany({
    data: [
      { bookingId: b1.id, vendorId: vendorB.id, sentAt: minutesAgo(3 * 24 * 60 - 5), expiresAt: minutesAgo(3 * 24 * 60 - 125), status: "accepted" },
      { bookingId: b3.id, vendorId: vendorA.id, sentAt: minutesAgo(150), expiresAt: minutesAgo(30), status: "accepted" },
      { bookingId: b5.id, vendorId: vendorB.id, sentAt: minutesAgo(560), expiresAt: minutesAgo(440), status: "declined" },
    ],
  });

  await db.notification.createMany({
    data: [
      { userId: customerA.id, type: "booking", title: "Booking completed", message: `Work on booking #${b1.id.slice(-6)} is done. Please rate your pro!`, actionUrl: "/customer/dashboard/bookings", isRead: false, createdAt: minutesAgo(80) },
      { userId: customerB.id, type: "booking", title: "Your booking is in progress", message: `Booking #${b4.id.slice(-6)} has a pro on the way.`, actionUrl: "/customer/dashboard/bookings", isRead: false, createdAt: minutesAgo(60) },
      { userId: agentA.id, type: "area", title: "Vendor declined — reassign needed", message: `Booking #${b5.id.slice(-6)} is back in the area queue and needs another vendor.`, actionUrl: "/agent/bookings", isRead: false, createdAt: minutesAgo(540) },
      { userId: agentA.id, type: "area", title: "New booking in your area", message: `Booking #${b2.id.slice(-6)} in Hazratganj (226002) is waiting for a pro.`, actionUrl: "/agent/bookings", isRead: false, createdAt: minutesAgo(3 * 24 * 60) },
      { userId: vendorB.id, type: "lead", title: "New lead assigned", message: `New booking ${b1.id.slice(-6)} assigned to you`, actionUrl: "/vendor/jobs", isRead: false, createdAt: minutesAgo(3 * 24 * 60 - 5) },
    ],
  });

  console.log(
    JSON.stringify(
      {
        agents: [agentA.email, agentB.email],
        vendors: [vendorA.email, vendorB.email, EMAILS[4]],
        customers: [customerA.email, customerB.email],
        bookings: [b1.id, b3.id, b5.id],
        password: PASSWORD,
        mobiles: {
          agentCentral: MOBILES[0],
          agentEast: MOBILES[1],
          vendorQuickFix: MOBILES[2],
          vendorCoolCare: MOBILES[3],
          vendorSparkle: MOBILES[4],
          customerAarav: MOBILES[5],
          customerMeera: MOBILES[6],
        },
      },
      null,
      2,
    ),
  );
} finally {
  await db.$disconnect();
}
