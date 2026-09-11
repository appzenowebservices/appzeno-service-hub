import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: "home-cleaning", name: "Home Cleaning", icon: "🧹", description: "Complete home deep-cleaning covering kitchens, bathrooms, floors & living spaces.", commissionPercent: 15 },
  { slug: "sofa-carpet-cleaning", name: "Sofa & Carpet Cleaning", icon: "🛋️", description: "Vacuum, shampoo, and sanitize sofas, carpets, rugs & upholstered furniture.", commissionPercent: 15 },
  { slug: "dry-cleaning", name: "Dry Cleaning", icon: "👔", description: "Doorstep pickup & delivery for dry-cleaned, pressed, and folded garments.", commissionPercent: 12 },
  { slug: "home-renovation", name: "Home Renovation", icon: "🏗️", description: "End-to-end interior and exterior makeovers — walls, flooring & more.", commissionPercent: 15 },
  { slug: "interior-designer", name: "Interior Designer", icon: "🪑", description: "Professional space planning, decor selection & full design execution.", commissionPercent: 15 },
  { slug: "electrical", name: "Electrician", icon: "⚡", description: "Fan, light, switchboard installation, wiring fixes & electrical safety checks.", commissionPercent: 18 },
  { slug: "ac-service", name: "AC Repair & Service", icon: "❄️", description: "AC deep-servicing, gas refill, cooling diagnostics & new unit installation.", commissionPercent: 20 },
  { slug: "appliance-repair", name: "Appliance Repair", icon: "🔌", description: "Washing machine, refrigerator, microwave & other home appliance diagnostics.", commissionPercent: 18 },
  { slug: "refrigerator-repair", name: "Refrigerator Repair", icon: "🧊", description: "Single & double-door fridge cooling issues, compressor and thermostat repairs.", commissionPercent: 18 },
  { slug: "washing-machine-repair", name: "Washing Machine Repair", icon: "🫧", description: "Top-load & front-load washing machine servicing, drum & motor repair.", commissionPercent: 18 },
  { slug: "geyser-repair", name: "Geyser Repair", icon: "🚿", description: "Water heater installation, thermostat replacement & safety valve servicing.", commissionPercent: 18 },
  { slug: "microwave-repair", name: "Microwave Repair", icon: "📡", description: "Heating coil, door sensor, circuit board & turntable repair for all brands.", commissionPercent: 18 },
  { slug: "water-purifier", name: "Water Purifier", icon: "💧", description: "RO & UV purifier installation, membrane replacement & routine servicing.", commissionPercent: 18 },
  { slug: "computer-repair", name: "Computer & Laptop Repair", icon: "💻", description: "OS formatting, virus removal, hardware fixes & software installation at home.", commissionPercent: 18 },
  { slug: "mobile-repair", name: "Mobile Repair", icon: "📱", description: "Screen replacement, battery swap, charging port & software issue fixes.", commissionPercent: 18 },
  { slug: "furniture-repair", name: "Furniture Repair", icon: "🪑", description: "Wood polishing, hinge replacement, upholstery fixing & custom carpentry.", commissionPercent: 15 },
  { slug: "plumbing", name: "Plumber", icon: "🔧", description: "Leakage fixing, pipe repairs, tap & bathroom fixture installations.", commissionPercent: 18 },
  { slug: "pest-control", name: "Pest Control", icon: "🐛", description: "Cockroach, termite, mosquito, bed bug & rodent treatment for homes & offices.", commissionPercent: 20 },
  { slug: "cctv-installation", name: "CCTV Installation", icon: "📷", description: "Home & office camera setup, DVR/NVR configuration & remote viewing access.", commissionPercent: 20 },
  { slug: "beauty-services", name: "Beauty Services at Home", icon: "💅", description: "Facials, waxing, threading, manicure & pedicure — all at your doorstep.", commissionPercent: 20 },
  { slug: "haircut-styling", name: "Haircut & Styling", icon: "✂️", description: "Men's & women's haircuts, blow-dry, keratin treatment & hair styling at home.", commissionPercent: 20 },
  { slug: "makeup-artist", name: "Makeup Artist", icon: "💄", description: "Bridal, party, engagement & casual makeup by trained artists at your venue.", commissionPercent: 20 },
  { slug: "massage-at-home", name: "Massage at Home", icon: "💆", description: "Relaxation, deep-tissue & therapy massage sessions by certified professionals.", commissionPercent: 20 },
  { slug: "yoga-trainer", name: "Yoga Trainer", icon: "🧘", description: "Personal yoga sessions at home for flexibility, stress relief & mindfulness.", commissionPercent: 15 },
  { slug: "fitness-trainer", name: "Fitness Trainer", icon: "🏋️", description: "Certified home gym trainers for weight loss, muscle building & custom workout plans.", commissionPercent: 15 },
  { slug: "nursing-services", name: "Nursing Services", icon: "🩺", description: "Qualified nurses for post-surgery care, IV, wound dressing & elder patient support.", commissionPercent: 15 },
  { slug: "doctor-on-call", name: "Doctor on Call", icon: "👨‍⚕️", description: "Verified general physicians & specialists for home consultation & prescription.", commissionPercent: 15 },
  { slug: "physiotherapy", name: "Physiotherapy", icon: "🦴", description: "Certified physios for joint pain, post-injury rehab & mobility recovery sessions.", commissionPercent: 15 },
  { slug: "lab-tests-at-home", name: "Lab Tests at Home", icon: "🧪", description: "Blood, urine, sugar, thyroid & full-body diagnostic samples collected at home.", commissionPercent: 12 },
  { slug: "home-tuition", name: "Home Tuition", icon: "📚", description: "Subject tutors for KG to 12th — Maths, Science, English, Hindi & competitive prep.", commissionPercent: 12 },
  { slug: "music-classes", name: "Music Classes", icon: "🎸", description: "Learn guitar, keyboard, tabla, harmonium, violin & singing from expert tutors.", commissionPercent: 12 },
  { slug: "dance-classes", name: "Dance Classes", icon: "💃", description: "Bollywood, classical, hip-hop & Zumba dance sessions by trained instructors.", commissionPercent: 12 },
  { slug: "painting", name: "Painter", icon: "🎨", description: "Interior & exterior wall painting, texture coating, primer & wallpaper services.", commissionPercent: 15 },
  { slug: "carpentry", name: "Carpenter", icon: "🪚", description: "Furniture assembly, door & window repairs, custom woodwork & cabinet fitting.", commissionPercent: 15 },
  { slug: "packers-movers", name: "Packers & Movers", icon: "📦", description: "Residential & office shifting — packing, loading, transport & unpacking.", commissionPercent: 12 },
  { slug: "car-bike-service", name: "Car / Bike Servicing", icon: "🚗", description: "Doorstep vehicle oil change, wash, tyre check & general service for cars & bikes.", commissionPercent: 15 },
  { slug: "event-planner", name: "Event Planner", icon: "🎉", description: "End-to-end management for birthdays, weddings, corporate & social gatherings.", commissionPercent: 15 },
  { slug: "photographer", name: "Photographer", icon: "📸", description: "Wedding, newborn, product & personal profile photoshoots by experienced lensmen.", commissionPercent: 15 },
  { slug: "caterer", name: "Caterer", icon: "🍽️", description: "Home-cooked or buffet catering for family functions, parties & corporate events.", commissionPercent: 15 },
  { slug: "birthday-decorator", name: "Birthday Decorator", icon: "🎈", description: "Balloon setups, theme decorations & party prop arrangements for all age groups.", commissionPercent: 15 },
  { slug: "purohit-pandit", name: "Purohit / Pandit", icon: "🪔", description: "Experienced pandits for Puja, Havan, Griha Pravesh, Namkaran & other rituals.", commissionPercent: 10 },
  { slug: "astrologer", name: "Astrologer", icon: "🔮", description: "Vedic astrology, kundali matching, numerology & personal consultation sessions.", commissionPercent: 15 },
  { slug: "pet-grooming", name: "Pet Grooming", icon: "🐾", description: "Professional pet bathing, coat trimming, nail clipping & overall hygiene care.", commissionPercent: 15 },
  { slug: "pet-trainer", name: "Pet Trainer", icon: "🐶", description: "Obedience training, behavioural correction & socialisation for dogs & cats.", commissionPercent: 15 },
  { slug: "cook-on-demand", name: "Cook on Demand", icon: "👨‍🍳", description: "Hire part-time or full-time home cooks for daily meals, tiffin & special diets.", commissionPercent: 12 },
  { slug: "baby-sitter", name: "Baby Sitter", icon: "👶", description: "Verified & background-checked nannies for infant and toddler care at home.", commissionPercent: 12 },
  { slug: "elder-care", name: "Elder Care", icon: "🧓", description: "Compassionate, trained caretakers for senior citizens — daily care & companionship.", commissionPercent: 12 },
  { slug: "property-lawyer", name: "Property Lawyer", icon: "⚖️", description: "Legal help for land registration, property disputes, agreements & documentation.", commissionPercent: 15 },
  { slug: "ca-tax-filing", name: "CA & Tax Filing", icon: "📊", description: "Chartered accountants for GST, income tax, ITR filing & company audit support.", commissionPercent: 15 },
  { slug: "loan-consultant", name: "Loan Consultant", icon: "🏦", description: "Expert guidance for home, personal, education & business loan applications.", commissionPercent: 12 },
  { slug: "travel-agent", name: "Travel Agent", icon: "✈️", description: "Flight & train booking, holiday packages & travel planning for families & groups.", commissionPercent: 10 },
  { slug: "passport-agent", name: "Passport Agent", icon: "🛂", description: "Assisted new passport application, renewal, Tatkal & Seva Kendra documentation.", commissionPercent: 10 },
  { slug: "real-estate-agent", name: "Real Estate Agent", icon: "🏠", description: "Trusted agents for buying, selling, renting & property valuation services.", commissionPercent: 10 },
  { slug: "courier-services", name: "Courier Services", icon: "🚚", description: "Same-day & scheduled parcel pickup, delivery & logistics within city.", commissionPercent: 10 },
];

const SUBS: Record<string, { name: string; basePrice: number; unit: string }[]> = {
  plumbing: [
    { name: "Tap Repair / Replacement", basePrice: 149, unit: "per tap" },
    { name: "Pipe Leakage Fix", basePrice: 299, unit: "per job" },
    { name: "Bathroom Fitting Installation", basePrice: 499, unit: "per bathroom" },
    { name: "Drainage Cleaning", basePrice: 399, unit: "per job" },
  ],
  electrical: [
    { name: "Switchboard Repair", basePrice: 149, unit: "per board" },
    { name: "Fan Installation / Repair", basePrice: 199, unit: "per fan" },
    { name: "Full House Wiring Checkup", basePrice: 799, unit: "per BHK" },
  ],
  "ac-service": [
    { name: "Split AC Deep Service", basePrice: 499, unit: "per AC" },
    { name: "AC Gas Refill (R32/R410)", basePrice: 2499, unit: "per AC" },
    { name: "AC Installation / Uninstallation", basePrice: 1499, unit: "per AC" },
  ],
  "home-cleaning": [
    { name: "1BHK Deep Cleaning", basePrice: 1999, unit: "per home" },
    { name: "3BHK Deep Cleaning", basePrice: 3499, unit: "per home" },
    { name: "Kitchen Deep Cleaning", basePrice: 999, unit: "per kitchen" },
    { name: "Bathroom Deep Cleaning", basePrice: 449, unit: "per bathroom" },
  ],
  painting: [
    { name: "1BHK Interior Painting (Asian Paints)", basePrice: 12000, unit: "per home" },
    { name: "Single Room Painting", basePrice: 4500, unit: "per room" },
    { name: "Texture / Designer Wall", basePrice: 2500, unit: "per wall" },
  ],
  carpentry: [
    { name: "Furniture Repair", basePrice: 350, unit: "per job" },
    { name: "Door Lock / Hinge Fix", basePrice: 249, unit: "per door" },
    { name: "Modular Kitchen Repair", basePrice: 1499, unit: "per job" },
  ],
  "pest-control": [
    { name: "1BHK Cockroach Treatment", basePrice: 599, unit: "per home" },
    { name: "Termite Treatment (5yr warranty)", basePrice: 4500, unit: "per home" },
    { name: "Bed-bug Treatment", basePrice: 1200, unit: "per home" },
  ],
  "beauty-services": [
    { name: "Classic Facial (Lotus)", basePrice: 799, unit: "per session" },
    { name: "Full Body Waxing (Rica)", basePrice: 999, unit: "per session" },
    { name: "Mani-Pedi Combo", basePrice: 699, unit: "per session" },
  ],
};

function defaultSubs(slug: string, name: string): { name: string; basePrice: number; unit: string }[] {
  if (SUBS[slug]) return SUBS[slug];
  return [
    { name: `${name} — Standard Visit`, basePrice: 299, unit: "per visit" },
    { name: `${name} — Deep / Premium`, basePrice: 799, unit: "per job" },
    { name: `${name} — Annual Care`, basePrice: 1999, unit: "per year" },
  ];
}

const VENDORS = [
  { mobile: "9123456789", pass: "Vendor@123", fullName: "Rajesh Kumar", business: "Kumar Home Services", city: "Lucknow", state: "Uttar Pradesh", cats: ["plumbing", "electrical"], exp: 8, rating: 4.7, reviews: 214, plan: "GOLD", price: 199, area: "Indira Nagar", pin: "226016", kyc: "APPROVED" },
  { mobile: "9123456790", pass: "Vendor@123", fullName: "Ramesh Yadav", business: "AtoZ Plumbing Works", city: "Lucknow", state: "Uttar Pradesh", cats: ["plumbing"], exp: 8, rating: 4.9, reviews: 312, plan: "PLATINUM", price: 299, area: "Dindayal Puram, Indira Nagar", pin: "226016", kyc: "APPROVED" },
  { mobile: "9123456791", pass: "Vendor@123", fullName: "Priya Sharma", business: "Priya Electricals", city: "Lucknow", state: "Uttar Pradesh", cats: ["electrical"], exp: 5, rating: 4.7, reviews: 198, plan: "GOLD", price: 199, area: "Gomti Nagar", pin: "226010", kyc: "APPROVED" },
  { mobile: "9123456792", pass: "Vendor@123", fullName: "Suresh Yadav", business: "Suresh AC Services", city: "Lucknow", state: "Uttar Pradesh", cats: ["ac-service", "refrigerator-repair"], exp: 10, rating: 4.6, reviews: 267, plan: "GOLD", price: 499, area: "Aliganj", pin: "226024", kyc: "APPROVED" },
  { mobile: "9123456793", pass: "Vendor@123", fullName: "Meena Devi", business: "Clean Home Services", city: "Lucknow", state: "Uttar Pradesh", cats: ["home-cleaning", "sofa-carpet-cleaning"], exp: 3, rating: 4.4, reviews: 143, plan: "SILVER", price: 399, area: "Indira Nagar", pin: "226016", kyc: "APPROVED" },
  { mobile: "9123456794", pass: "Vendor@123", fullName: "Ahmed Khan", business: "Delhi Painters Co.", city: "Delhi", state: "Delhi", cats: ["painting", "home-renovation"], exp: 12, rating: 4.8, reviews: 421, plan: "PLATINUM", price: 4500, area: "Lajpat Nagar", pin: "110024", kyc: "APPROVED" },
  { mobile: "9123456795", pass: "Vendor@123", fullName: "Raj Singh", business: "Raj Carpentry Works", city: "Mumbai", state: "Maharashtra", cats: ["carpentry", "furniture-repair"], exp: 6, rating: 4.3, reviews: 89, plan: "SILVER", price: 350, area: "Andheri West", pin: "400058", kyc: "APPROVED" },
  { mobile: "9123456796", pass: "Vendor@123", fullName: "Vinod Gupta", business: "Quick Pest Control", city: "Lucknow", state: "Uttar Pradesh", cats: ["pest-control"], exp: 2, rating: 4.1, reviews: 56, plan: "FREE", price: 599, area: "Rajajipuram", pin: "226017", kyc: "UNDER_REVIEW" },
  { mobile: "9123456797", pass: "Vendor@123", fullName: "Anita Desai", business: "Glow Beauty at Home", city: "Delhi", state: "Delhi", cats: ["beauty-services", "makeup-artist"], exp: 7, rating: 4.9, reviews: 342, plan: "PLATINUM", price: 799, area: "Rohini", pin: "110085", kyc: "APPROVED" },
  { mobile: "9123456798", pass: "Vendor@123", fullName: "Vikram Malhotra", business: "CoolBreeze AC Experts", city: "Delhi", state: "Delhi", cats: ["ac-service"], exp: 9, rating: 4.5, reviews: 289, plan: "GOLD", price: 549, area: "Laxmi Nagar", pin: "110092", kyc: "APPROVED" },
  { mobile: "9123456799", pass: "Vendor@123", fullName: "Sunil Tiwari", business: "Tiwari Packers & Movers", city: "Kanpur", state: "Uttar Pradesh", cats: ["packers-movers"], exp: 11, rating: 4.4, reviews: 176, plan: "SILVER", price: 4500, area: "Swaroop Nagar", pin: "208002", kyc: "APPROVED" },
  { mobile: "9123456701", pass: "Vendor@123", fullName: "Kavita Joshi", business: "Shubh Events & Decor", city: "Jaipur", state: "Rajasthan", cats: ["event-planner", "birthday-decorator", "photographer"], exp: 6, rating: 4.6, reviews: 132, plan: "GOLD", price: 9999, area: "Malviya Nagar", pin: "302017", kyc: "APPROVED" },
  { mobile: "9123456702", pass: "Vendor@123", fullName: "Ravi Shankar", business: "Pandit Ravi Shankar Seva", city: "Varanasi", state: "Uttar Pradesh", cats: ["purohit-pandit", "astrologer"], exp: 15, rating: 4.9, reviews: 521, plan: "GOLD", price: 1100, area: "Godowlia", pin: "221001", kyc: "APPROVED" },
  { mobile: "9123456703", pass: "Vendor@123", fullName: "Deepak Saini", business: "FixIt Appliances", city: "Bangalore", state: "Karnataka", cats: ["washing-machine-repair", "microwave-repair", "geyser-repair"], exp: 7, rating: 4.5, reviews: 198, plan: "SILVER", price: 299, area: "BTM Layout", pin: "560029", kyc: "APPROVED" },
  { mobile: "9123456704", pass: "Vendor@123", fullName: "Neha Agarwal", business: "Pawfect Pet Grooming", city: "Pune", state: "Maharashtra", cats: ["pet-grooming"], exp: 4, rating: 4.8, reviews: 167, plan: "SILVER", price: 599, area: "Kothrud", pin: "411038", kyc: "APPROVED" },
  { mobile: "9123456705", pass: "Vendor@123", fullName: "Manoj Patel", business: "Patel Tax & Accounts", city: "Ahmedabad", state: "Gujarat", cats: ["ca-tax-filing", "loan-consultant"], exp: 12, rating: 4.7, reviews: 143, plan: "GOLD", price: 999, area: "Navrangpura", pin: "380009", kyc: "APPROVED" },
  { mobile: "9123456706", pass: "Vendor@123", fullName: "Arjun Nair", business: "FitWithArjun", city: "Hyderabad", state: "Telangana", cats: ["fitness-trainer", "yoga-trainer"], exp: 5, rating: 4.6, reviews: 98, plan: "FREE", price: 800, area: "Kondapur", pin: "500084", kyc: "PENDING" },
  { mobile: "9123456707", pass: "Vendor@123", fullName: "Sana Sheikh", business: "Sana Home Tuitions", city: "Lucknow", state: "Uttar Pradesh", cats: ["home-tuition", "music-classes"], exp: 6, rating: 4.8, reviews: 121, plan: "SILVER", price: 500, area: "Alambagh", pin: "226005", kyc: "APPROVED" },
  { mobile: "9123456708", pass: "Vendor@123", fullName: "Rohit Verma", business: "SecureEye CCTV Solutions", city: "Noida", state: "Uttar Pradesh", cats: ["cctv-installation", "computer-repair"], exp: 8, rating: 4.5, reviews: 187, plan: "GOLD", price: 1499, area: "Sector 62", pin: "201301", kyc: "APPROVED" },
  { mobile: "9123456709", pass: "Vendor@123", fullName: "Lakshmi Rao", business: "CarePlus Nursing", city: "Hyderabad", state: "Telangana", cats: ["nursing-services", "elder-care", "physiotherapy"], exp: 10, rating: 4.9, reviews: 234, plan: "PLATINUM", price: 1200, area: "Dilsukhnagar", pin: "500060", kyc: "APPROVED" },
] as const;

const CUSTOMERS = [
  { mobile: "9876543210", pass: "Customer@123", fullName: "Priya Sharma", city: "Lucknow", state: "Uttar Pradesh", area: "Hazratganj", pin: "226001", email: "priya.sharma@gmail.com" },
  { mobile: "9876543211", pass: "Customer@123", fullName: "Amit Sharma", city: "Ghaziabad", state: "Uttar Pradesh", area: "Vaishali", pin: "201010", email: "amit.sharma@gmail.com" },
  { mobile: "9876543212", pass: "Customer@123", fullName: "Pooja Mehta", city: "Delhi", state: "Delhi", area: "Dwarka Sec 6", pin: "110075", email: "pooja.mehta@gmail.com" },
  { mobile: "9876543213", pass: "Customer@123", fullName: "Rahul Sinha", city: "Noida", state: "Uttar Pradesh", area: "Sector 137", pin: "201305", email: "rahul.sinha@gmail.com" },
  { mobile: "9876543214", pass: "Customer@123", fullName: "Sunita Rao", city: "Ghaziabad", state: "Uttar Pradesh", area: "Indirapuram", pin: "201014", email: "sunita.rao@gmail.com" },
  { mobile: "9876543215", pass: "Customer@123", fullName: "Kavita Joshi", city: "Lucknow", state: "Uttar Pradesh", area: "Gomti Nagar", pin: "226010", email: "kavita.joshi@gmail.com" },
  { mobile: "9876543216", pass: "Customer@123", fullName: "Deepak Malhotra", city: "Delhi", state: "Delhi", area: "Pitampura", pin: "110034", email: "deepak.m@gmail.com" },
  { mobile: "9876543217", pass: "Customer@123", fullName: "Ritu Agarwal", city: "Noida", state: "Uttar Pradesh", area: "Sector 50", pin: "201301", email: "ritu.ag@gmail.com" },
  { mobile: "9876543218", pass: "Customer@123", fullName: "Anjali Singh", city: "Mumbai", state: "Maharashtra", area: "Andheri East", pin: "400069", email: "anjali.s@gmail.com" },
  { mobile: "9876543219", pass: "Customer@123", fullName: "Mohit Gupta", city: "Bangalore", state: "Karnataka", area: "Whitefield", pin: "560066", email: "mohit.g@gmail.com" },
  { mobile: "9876543220", pass: "Customer@123", fullName: "Neha Agarwal", city: "Jaipur", state: "Rajasthan", area: "C-Scheme", pin: "302001", email: "neha.a@gmail.com" },
  { mobile: "9876543221", pass: "Customer@123", fullName: "Sanjay Patel", city: "Ahmedabad", state: "Gujarat", area: "Satellite", pin: "380015", email: "sanjay.p@gmail.com" },
  { mobile: "9876543222", pass: "Customer@123", fullName: "Geeta Yadav", city: "Kanpur", state: "Uttar Pradesh", area: "Tilak Nagar", pin: "208002", email: "geeta.y@gmail.com" },
  { mobile: "9876543223", pass: "Customer@123", fullName: "Arun Mishra", city: "Varanasi", state: "Uttar Pradesh", area: "Sigra", pin: "221010", email: "arun.m@gmail.com" },
  { mobile: "9876543224", pass: "Customer@123", fullName: "Divya Reddy", city: "Hyderabad", state: "Telangana", area: "Madhapur", pin: "500081", email: "divya.r@gmail.com" },
] as const;

const AGENTS = [
  { mobile: "9988776655", pass: "Agent@123", fullName: "Sunita Verma", city: "Jaipur", state: "Rajasthan", assigned: "Jaipur" },
  { mobile: "9988776656", pass: "Agent@123", fullName: "Priya Sharma", city: "Ghaziabad", state: "Uttar Pradesh", assigned: "Lucknow" },
  { mobile: "9988776657", pass: "Agent@123", fullName: "Rohit Verma", city: "Delhi", state: "Delhi", assigned: "Delhi" },
  { mobile: "9988776658", pass: "Agent@123", fullName: "Amit Tiwari", city: "Lucknow", state: "Uttar Pradesh", assigned: "Kanpur" },
  { mobile: "9988776659", pass: "Agent@123", fullName: "Deepak Mishra", city: "Kanpur", state: "Uttar Pradesh", assigned: "Varanasi" },
  { mobile: "9988776660", pass: "Agent@123", fullName: "Karan Singh", city: "Noida", state: "Uttar Pradesh", assigned: "Noida" },
] as const;

const REVIEW_TEXTS = [
  "Bahut badhiya kaam kiya, time pe aaye aur rate bhi genuine tha.",
  "Very professional work. Clean finish, highly recommended.",
  "On-time service, polite behaviour. Price thoda high but worth it.",
  "Excellent experience! 30 minute mein problem solve ho gayi.",
  "Kaam accha tha, thodi delay hui but overall satisfied hoon.",
  "Superb! Ghar bilkul chamak gaya. Team bahut trained hai.",
  "Genuine pricing, no hidden charges. Will book again.",
  "Technician knowledgeable tha, sab clearly explain kiya.",
];

async function main() {
  console.log("Cleaning old data...");
  await prisma.review.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.agentProfile.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding categories...");
  const catIdBySlug = new Map<string, string>();
  const subByCat = new Map<string, { id: string; name: string; basePrice: number }[]>();
  for (const c of CATEGORIES) {
    const cat = await prisma.category.create({
      data: { slug: c.slug, name: c.name, icon: c.icon, description: c.description, commissionPercent: c.commissionPercent, isActive: true },
    });
    catIdBySlug.set(c.slug, cat.id);
    const subs = defaultSubs(c.slug, c.name);
    const createdSubs: { id: string; name: string; basePrice: number }[] = [];
    for (const s of subs) {
      const sc = await prisma.subCategory.create({
        data: { categoryId: cat.id, name: s.name, basePrice: s.basePrice, unit: s.unit, isActive: true },
      });
      createdSubs.push({ id: sc.id, name: sc.name, basePrice: sc.basePrice });
    }
    subByCat.set(c.slug, createdSubs);
  }
  console.log(`Categories: ${catIdBySlug.size}`);

  console.log("Seeding admin...");
  const adminHash = await hash("Admin@123#", 10);
  const admin = await prisma.user.create({
    data: { fullName: "Super Administrator", mobile: "9000000001", email: "admin@addies.in", role: "ADMIN", city: "Lucknow", state: "Uttar Pradesh", passwordHash: adminHash, isVerified: true, isActive: true },
  });

  console.log("Seeding agents...");
  const agentUsers: { id: string; city: string; fullName: string }[] = [];
  for (const a of AGENTS) {
    const h = await hash(a.pass, 10);
    const u = await prisma.user.create({
      data: { fullName: a.fullName, mobile: a.mobile, email: `${a.mobile}@addies-agent.in`, role: "AGENT", city: a.city, state: a.state, passwordHash: h, isVerified: true, isActive: true },
    });
    await prisma.agentProfile.create({
      data: { userId: u.id, assignedCity: a.assigned, officeAddress: `ADDies Office, ${a.assigned}`, commissionPercent: 5, gst: "09ABCDE1234F1Z5" },
    });
    agentUsers.push({ id: u.id, city: a.assigned, fullName: a.fullName });
  }

  console.log("Seeding vendors...");
  const vendorUsers: { id: string; fullName: string; city: string; cats: string[]; price: number }[] = [];
  for (const v of VENDORS) {
    const h = await hash(v.pass, 10);
    const u = await prisma.user.create({
      data: { fullName: v.fullName, mobile: v.mobile, email: `${v.mobile}@vendor.addies.in`, role: "VENDOR", city: v.city, state: v.state, passwordHash: h, isVerified: true, isActive: true },
    });
    const kyc = v.kyc as "APPROVED" | "PENDING" | "UNDER_REVIEW";
    await prisma.vendorProfile.create({
      data: {
        userId: u.id,
        businessName: v.business,
        yearsOfExperience: v.exp,
        serviceCategories: [...v.cats],
        serviceAreaPincodes: [v.pin, v.pin.slice(0, 3) + "001"],
        workingDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
        timeSlots: [
          { id: "m1", label: "9AM-12PM", start: "09:00", end: "12:00" },
          { id: "a1", label: "2PM-5PM", start: "14:00", end: "17:00" },
        ],
        kycStatus: kyc,
        subscriptionPlan: v.plan as "FREE" | "SILVER" | "GOLD" | "PLATINUM",
        reliabilityScore: 85 + ((v.reviews % 14) as number),
        rating: v.rating,
        totalReviews: v.reviews,
        basePricing: { basePrice: v.price, emergencyCharge: 150, visitingCharge: 99 },
        isApproved: kyc === "APPROVED",
      },
    });
    vendorUsers.push({ id: u.id, fullName: v.fullName, city: v.city, cats: [...v.cats], price: v.price });
  }

  console.log("Seeding customers...");
  const customerUsers: { id: string; fullName: string; city: string; area: string; pin: string }[] = [];
  for (const c of CUSTOMERS) {
    const h = await hash(c.pass, 10);
    const u = await prisma.user.create({
      data: { fullName: c.fullName, mobile: c.mobile, email: c.email, role: "CUSTOMER", city: c.city, state: c.state, passwordHash: h, isVerified: true, isActive: true },
    });
    const wallet = 150 + (Number(c.mobile.slice(-2)) % 400);
    await prisma.customerProfile.create({ data: { userId: u.id, referralCode: `ADD${u.id.slice(-6).toUpperCase()}`, walletBalance: wallet } });
    await prisma.address.create({
      data: { label: "Home", houseNo: `${10 + (Number(c.mobile.slice(-2)) % 80)}, ${c.area}`, area: c.area, pincode: c.pin, city: c.city, isDefault: true, userId: u.id },
    });
    await prisma.walletTransaction.create({ data: { userId: u.id, type: "credit", amount: wallet, description: "Wallet top-up + welcome bonus", balanceAfter: wallet } });
    customerUsers.push({ id: u.id, fullName: c.fullName, city: c.city, area: c.area, pin: c.pin });
  }

  console.log("Seeding bookings + reviews + leads...");
  const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "IN_PROGRESS", "ACCEPTED", "ASSIGNED", "PENDING", "CANCELLED", "DISPUTED"] as const;
  const payMethods = ["upi", "cod", "card", "wallet"] as const;
  let bookingCount = 0;
  const now = Date.now();

  const pickVendor = (city: string, catSlug: string) => {
    const sameCity = vendorUsers.filter((v) => v.city === city && v.cats.includes(catSlug));
    if (sameCity.length) return sameCity[bookingCount % sameCity.length]!;
    const anyCat = vendorUsers.filter((v) => v.cats.includes(catSlug));
    if (anyCat.length) return anyCat[bookingCount % anyCat.length]!;
    return vendorUsers[bookingCount % vendorUsers.length]!;
  };

  const bookingSeeds: { cat: string; desc: string }[] = [
    { cat: "plumbing", desc: "Kitchen sink pipe leakage hai, paani continuously drip ho raha hai. Urgent fix chahiye." },
    { cat: "electrical", desc: "2 ceiling fan slow chal rahe hain aur 1 switchboard spark kar raha hai. Safety check bhi karna hai." },
    { cat: "ac-service", desc: "Split AC cooling kam kar raha hai, last service 8 mahine pehle hui thi. Deep service + gas check." },
    { cat: "home-cleaning", desc: "3BHK deep cleaning chahiye Diwali se pehle — kitchen, both bathrooms aur balcony included." },
    { cat: "pest-control", desc: "Kitchen mein cockroach problem badh gayi hai. Herbal gel treatment prefer karenge." },
    { cat: "painting", desc: "2 rooms repaint karane hain — Asian Paints Apex, light colours. Free estimate chahiye." },
    { cat: "carpentry", desc: "Bedroom ka wardrobe door loose ho gaya hai, hinges replace karne hain." },
    { cat: "beauty-services", desc: "Bridal trial + facial at home, Saturday morning slot preferred." },
    { cat: "appliance-repair", desc: "Front-load washing machine spin cycle mein awaaz kar rahi hai." },
    { cat: "water-purifier", desc: "RO ka TDS 180+ aa raha hai, membrane + filters replace karne hain." },
    { cat: "cctv-installation", desc: "Shop ke liye 4-channel CCTV setup chahiye with mobile viewing." },
    { cat: "packers-movers", desc: "1BHK shifting Indira Nagar se Gomti Nagar — packing + transport weekend mein." },
  ];

  for (let i = 0; i < 42; i++) {
    const cust = customerUsers[i % customerUsers.length]!;
    const seed = bookingSeeds[i % bookingSeeds.length]!;
    const catId = catIdBySlug.get(seed.cat)!;
    const subs = subByCat.get(seed.cat)!;
    const sub = subs[i % subs.length]!;
    const status = statuses[i % statuses.length]!;
    const vendor = pickVendor(cust.city, seed.cat);
    const base = sub.basePrice;
    const surge = i % 5 === 0 ? 100 : 0;
    const visiting = 99;
    const total = base + surge + visiting;
    const createdAt = new Date(now - (i * 36 * 60 * 60 * 1000) - (i % 7) * 24 * 60 * 60 * 1000);
    const data: Parameters<typeof prisma.booking.create>[0]["data"] = {
      customerId: cust.id,
      categoryId: catId,
      subCategoryId: sub.id,
      description: seed.desc,
      images: [],
      urgency: i % 6 === 0 ? "emergency" : "normal",
      address: { houseNo: `${20 + i}, ${cust.area}`, area: cust.area, pincode: cust.pin, city: cust.city },
      preferredDate: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      timeSlot: { id: "m1", label: "9AM-12PM", start: "09:00", end: "12:00" },
      status: status as "COMPLETED",
      paymentMethod: payMethods[i % payMethods.length]!,
      paymentStatus: status === "COMPLETED" ? "PAID" : status === "CANCELLED" ? "REFUNDED" : "PENDING",
      baseAmount: base,
      surgeAmount: surge,
      visitingCharge: visiting,
      totalAmount: total,
      createdAt,
    };
    if (["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "DISPUTED"].includes(status)) {
      data.vendorId = vendor.id;
    }
    const booking = await prisma.booking.create({ data });

    if (["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "PENDING"].includes(status)) {
      const targetVendor = data.vendorId ?? vendor.id;
      await prisma.lead.create({
        data: { bookingId: booking.id, vendorId: targetVendor, expiresAt: new Date(now + 2 * 60 * 60 * 1000), status: status === "PENDING" ? "pending" : "accepted" },
      });
    }

    if (status === "COMPLETED") {
      const rating = 4 + ((i + bookingCount) % 2 === 0 ? 1 : 0) - (i % 7 === 0 ? 1 : 0);
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          customerId: cust.id,
          vendorId: vendor.id,
          rating: Math.max(3, Math.min(5, rating)),
          comment: REVIEW_TEXTS[(i + bookingCount) % REVIEW_TEXTS.length],
          reply: i % 3 === 0 ? "Dhanyavaad! Service mein koi dikkat ho to batayein." : undefined,
        },
      });
    }
    bookingCount++;

    await prisma.notification.create({
      data: {
        userId: cust.id,
        type: "booking",
        title: `Booking ${status.toLowerCase()}`,
        message: `${sub.name} — ₹${total} (${status.toLowerCase()})`,
        isRead: status === "COMPLETED",
        actionUrl: `/customer/bookings/${booking.id}`,
      },
    });
  }

  console.log("Seeding admin notifications...");
  await prisma.notification.createMany({
    data: [
      { userId: admin.id, type: "system", title: "12 KYC approvals pending", message: "2 vendors waiting under review — please verify documents", actionUrl: "/admin/vendors" },
      { userId: admin.id, type: "payment", title: "Weekly payout due", message: "Vendor payouts worth ~₹2.4L due this Friday", actionUrl: "/admin/payouts" },
      { userId: admin.id, type: "booking", title: "4 disputes open", message: "Disputed bookings need resolution within 48 hrs", actionUrl: "/admin/disputes" },
    ],
  });

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.subCategory.count(),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.lead.count(),
  ]);
  console.log(`DONE users=${counts[0]} categories=${counts[1]} subs=${counts[2]} bookings=${counts[3]} reviews=${counts[4]} leads=${counts[5]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
