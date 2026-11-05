import { PrismaClient } from "@prisma/client";

// Clears transactional TEST data (bookings, their timeline/leads/reviews and
// all notifications) while keeping user accounts, categories and areas.
// Usage: node prisma/clear-test-data.mjs

const db = new PrismaClient();

const before = {
  bookings: await db.booking.count(),
  events: await db.bookingEvent.count(),
  leads: await db.lead.count(),
  reviews: await db.review.count(),
  notifications: await db.notification.count(),
};

const events = await db.bookingEvent.deleteMany({});
const reviews = await db.review.deleteMany({});
const leads = await db.lead.deleteMany({});
const bookings = await db.booking.deleteMany({});
const notifications = await db.notification.deleteMany({});

console.log("cleared test data:");
console.log(`  bookings      ${before.bookings} → ${await db.booking.count()} (deleted ${bookings.count})`);
console.log(`  booking events ${before.events} → ${await db.bookingEvent.count()} (deleted ${events.count})`);
console.log(`  leads         ${before.leads} → ${await db.lead.count()} (deleted ${leads.count})`);
console.log(`  reviews       ${before.reviews} → ${await db.review.count()} (deleted ${reviews.count})`);
console.log(`  notifications ${before.notifications} → ${await db.notification.count()} (deleted ${notifications.count})`);
console.log("kept: user accounts, profiles, categories, serving areas, addresses, wallet history");

await db.$disconnect();
