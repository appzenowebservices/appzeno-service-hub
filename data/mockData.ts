import type { City, Category } from "../types";

export const MOCK_CITIES: City[] = [
  { id: "1",  slug: "lucknow",    name: "Lucknow",    state: "Uttar Pradesh", isActive: true, pincodes: ["226001","226010"] },
  { id: "2",  slug: "delhi",      name: "Delhi",      state: "Delhi",         isActive: true, pincodes: ["110001","110002"] },
  { id: "3",  slug: "mumbai",     name: "Mumbai",     state: "Maharashtra",   isActive: true, pincodes: ["400001","400002"] },
  { id: "4",  slug: "bangalore",  name: "Bangalore",  state: "Karnataka",     isActive: true, pincodes: ["560001","560002"] },
  { id: "5",  slug: "hyderabad",  name: "Hyderabad",  state: "Telangana",     isActive: true, pincodes: ["500001","500002"] },
  { id: "6",  slug: "pune",       name: "Pune",       state: "Maharashtra",   isActive: true, pincodes: ["411001","411002"] },
  { id: "7",  slug: "jaipur",     name: "Jaipur",     state: "Rajasthan",     isActive: true, pincodes: ["302001","302002"] },
  { id: "8",  slug: "ahmedabad",  name: "Ahmedabad",  state: "Gujarat",       isActive: true, pincodes: ["380001","380002"] },
  { id: "9",  slug: "kanpur",     name: "Kanpur",     state: "Uttar Pradesh", isActive: true, pincodes: ["208001","208002"] },
  { id: "10", slug: "varanasi",   name: "Varanasi",   state: "Uttar Pradesh", isActive: true, pincodes: ["221001","221002"] },
  { id: "11",  slug: "barabanki",    name: "Barabanki",    state: "Uttar Pradesh", isActive: true, pincodes: ["225001","225002","225003","225004","225005","225006"] },
];

export const MOCK_CATEGORIES: Category[] = [

  // ── HOME CLEANING & MAINTENANCE ───────────────────────────────────────────
  { id: "1",  slug: "home-cleaning",        name: "Home Cleaning",          icon: "🧹", group: "Home & Cleaning",     description: "Complete home deep-cleaning covering kitchens, bathrooms, floors & living spaces.",     commissionPercent: 15, subCategories: [], isActive: true },
  { id: "10", slug: "sofa-carpet-cleaning", name: "Sofa & Carpet Cleaning", icon: "🛋️", group: "Home & Cleaning",     description: "Vacuum, shampoo, and sanitize sofas, carpets, rugs & upholstered furniture.",            commissionPercent: 15, subCategories: [], isActive: true },
  { id: "30", slug: "dry-cleaning",         name: "Dry Cleaning",           icon: "👔", group: "Home & Cleaning",     description: "Doorstep pickup & delivery for dry-cleaned, pressed, and folded garments.",              commissionPercent: 12, subCategories: [], isActive: true },
  { id: "31", slug: "home-renovation",      name: "Home Renovation",        icon: "🏗️", group: "Home & Cleaning",     description: "End-to-end interior and exterior makeovers — walls, flooring & more.",                  commissionPercent: 15, subCategories: [], isActive: true },
  { id: "32", slug: "interior-designer",    name: "Interior Designer",      icon: "🪑", group: "Home & Cleaning",     description: "Professional space planning, decor selection & full design execution.",                  commissionPercent: 15, subCategories: [], isActive: true },

  // ── APPLIANCE & ELECTRICAL REPAIR ─────────────────────────────────────────
  { id: "3",  slug: "electrical",           name: "Electrician",            icon: "⚡", group: "Repairs & Appliances", description: "Fan, light, switchboard installation, wiring fixes & electrical safety checks.",         commissionPercent: 18, subCategories: [], isActive: true },
  { id: "4",  slug: "ac-service",           name: "AC Repair & Service",    icon: "❄️", group: "Repairs & Appliances", description: "AC deep-servicing, gas refill, cooling diagnostics & new unit installation.",           commissionPercent: 20, subCategories: [], isActive: true },
  { id: "8",  slug: "appliance-repair",     name: "Appliance Repair",       icon: "🔌", group: "Repairs & Appliances", description: "Washing machine, refrigerator, microwave & other home appliance diagnostics.",          commissionPercent: 18, subCategories: [], isActive: true },
  { id: "13", slug: "refrigerator-repair",  name: "Refrigerator Repair",    icon: "🧊", group: "Repairs & Appliances", description: "Single & double-door fridge cooling issues, compressor and thermostat repairs.",        commissionPercent: 18, subCategories: [], isActive: true },
  { id: "14", slug: "washing-machine-repair", name: "Washing Machine Repair", icon: "🫧", group: "Repairs & Appliances", description: "Top-load & front-load washing machine servicing, drum & motor repair.",               commissionPercent: 18, subCategories: [], isActive: true },
  { id: "15", slug: "geyser-repair",        name: "Geyser Repair",          icon: "🚿", group: "Repairs & Appliances", description: "Water heater installation, thermostat replacement & safety valve servicing.",           commissionPercent: 18, subCategories: [], isActive: true },
  { id: "16", slug: "microwave-repair",     name: "Microwave Repair",       icon: "📡", group: "Repairs & Appliances", description: "Heating coil, door sensor, circuit board & turntable repair for all brands.",           commissionPercent: 18, subCategories: [], isActive: true },
  { id: "9",  slug: "water-purifier",       name: "Water Purifier",         icon: "💧", group: "Repairs & Appliances", description: "RO & UV purifier installation, membrane replacement & routine servicing.",             commissionPercent: 18, subCategories: [], isActive: true },
  { id: "52", slug: "computer-repair",      name: "Computer & Laptop Repair", icon: "💻", group: "Repairs & Appliances", description: "OS formatting, virus removal, hardware fixes & software installation at home.",       commissionPercent: 18, subCategories: [], isActive: true },
  { id: "53", slug: "mobile-repair",        name: "Mobile Repair",          icon: "📱", group: "Repairs & Appliances", description: "Screen replacement, battery swap, charging port & software issue fixes.",               commissionPercent: 18, subCategories: [], isActive: true },
  { id: "54", slug: "furniture-repair",     name: "Furniture Repair",       icon: "🪑", group: "Repairs & Appliances", description: "Wood polishing, hinge replacement, upholstery fixing & custom carpentry.",             commissionPercent: 15, subCategories: [], isActive: true },

  // ── PLUMBING & CIVIL ──────────────────────────────────────────────────────
  { id: "2",  slug: "plumbing",             name: "Plumber",                icon: "🔧", group: "Plumbing & Civil",    description: "Leakage fixing, pipe repairs, tap & bathroom fixture installations.",                  commissionPercent: 18, subCategories: [], isActive: true },
  { id: "7",  slug: "pest-control",         name: "Pest Control",           icon: "🐛", group: "Plumbing & Civil",    description: "Cockroach, termite, mosquito, bed bug & rodent treatment for homes & offices.",        commissionPercent: 20, subCategories: [], isActive: true },
  { id: "24", slug: "cctv-installation",    name: "CCTV Installation",      icon: "📷", group: "Plumbing & Civil",    description: "Home & office camera setup, DVR/NVR configuration & remote viewing access.",          commissionPercent: 20, subCategories: [], isActive: true },

  // ── BEAUTY & WELLNESS ─────────────────────────────────────────────────────
  { id: "17", slug: "beauty-services",      name: "Beauty Services at Home", icon: "💅", group: "Beauty & Wellness",  description: "Facials, waxing, threading, manicure & pedicure — all at your doorstep.",              commissionPercent: 20, subCategories: [], isActive: true },
  { id: "18", slug: "haircut-styling",      name: "Haircut & Styling",      icon: "✂️", group: "Beauty & Wellness",  description: "Men's & women's haircuts, blow-dry, keratin treatment & hair styling at home.",         commissionPercent: 20, subCategories: [], isActive: true },
  { id: "19", slug: "makeup-artist",        name: "Makeup Artist",          icon: "💄", group: "Beauty & Wellness",  description: "Bridal, party, engagement & casual makeup by trained artists at your venue.",           commissionPercent: 20, subCategories: [], isActive: true },
  { id: "20", slug: "massage-at-home",      name: "Massage at Home",        icon: "💆", group: "Beauty & Wellness",  description: "Relaxation, deep-tissue & therapy massage sessions by certified professionals.",        commissionPercent: 20, subCategories: [], isActive: true },
  { id: "21", slug: "yoga-trainer",         name: "Yoga Trainer",           icon: "🧘", group: "Beauty & Wellness",  description: "Personal yoga sessions at home for flexibility, stress relief & mindfulness.",          commissionPercent: 15, subCategories: [], isActive: true },
  { id: "22", slug: "fitness-trainer",      name: "Fitness Trainer",        icon: "🏋️", group: "Beauty & Wellness",  description: "Certified home gym trainers for weight loss, muscle building & custom workout plans.",  commissionPercent: 15, subCategories: [], isActive: true },

  // ── HEALTHCARE AT HOME ────────────────────────────────────────────────────
  { id: "23", slug: "nursing-services",     name: "Nursing Services",       icon: "🩺", group: "Healthcare",          description: "Qualified nurses for post-surgery care, IV, wound dressing & elder patient support.",   commissionPercent: 15, subCategories: [], isActive: true },
  { id: "25", slug: "doctor-on-call",       name: "Doctor on Call",         icon: "👨‍⚕️", group: "Healthcare",          description: "Verified general physicians & specialists for home consultation & prescription.",      commissionPercent: 15, subCategories: [], isActive: true },
  { id: "26", slug: "physiotherapy",        name: "Physiotherapy",          icon: "🦴", group: "Healthcare",          description: "Certified physios for joint pain, post-injury rehab & mobility recovery sessions.",     commissionPercent: 15, subCategories: [], isActive: true },
  { id: "27", slug: "lab-tests-at-home",   name: "Lab Tests at Home",      icon: "🧪", group: "Healthcare",          description: "Blood, urine, sugar, thyroid & full-body diagnostic samples collected at home.",       commissionPercent: 12, subCategories: [], isActive: true },

  // ── EDUCATION & LEARNING ─────────────────────────────────────────────────
  { id: "28", slug: "home-tuition",         name: "Home Tuition",           icon: "📚", group: "Education",           description: "Subject tutors for KG to 12th — Maths, Science, English, Hindi & competitive prep.",  commissionPercent: 12, subCategories: [], isActive: true },
  { id: "29", slug: "music-classes",        name: "Music Classes",          icon: "🎸", group: "Education",           description: "Learn guitar, keyboard, tabla, harmonium, violin & singing from expert tutors.",       commissionPercent: 12, subCategories: [], isActive: true },
  { id: "33", slug: "dance-classes",        name: "Dance Classes",          icon: "💃", group: "Education",           description: "Bollywood, classical, hip-hop & Zumba dance sessions by trained instructors.",         commissionPercent: 12, subCategories: [], isActive: true },

  // ── SKILLED TRADES ────────────────────────────────────────────────────────
  { id: "5",  slug: "painting",             name: "Painter",                icon: "🎨", group: "Skilled Trades",      description: "Interior & exterior wall painting, texture coating, primer & wallpaper services.",     commissionPercent: 15, subCategories: [], isActive: true },
  { id: "6",  slug: "carpentry",            name: "Carpenter",              icon: "🪚", group: "Skilled Trades",      description: "Furniture assembly, door & window repairs, custom woodwork & cabinet fitting.",         commissionPercent: 15, subCategories: [], isActive: true },
  { id: "11", slug: "packers-movers",       name: "Packers & Movers",       icon: "📦", group: "Skilled Trades",      description: "Residential & office shifting — packing, loading, transport & unpacking.",             commissionPercent: 12, subCategories: [], isActive: true },
  { id: "34", slug: "car-bike-service",     name: "Car / Bike Servicing",   icon: "🚗", group: "Skilled Trades",      description: "Doorstep vehicle oil change, wash, tyre check & general service for cars & bikes.",    commissionPercent: 15, subCategories: [], isActive: true },

  // ── EVENTS & LIFESTYLE ────────────────────────────────────────────────────
  { id: "35", slug: "event-planner",        name: "Event Planner",          icon: "🎉", group: "Events & Lifestyle",  description: "End-to-end management for birthdays, weddings, corporate & social gatherings.",         commissionPercent: 15, subCategories: [], isActive: true },
  { id: "36", slug: "photographer",         name: "Photographer",           icon: "📸", group: "Events & Lifestyle",  description: "Wedding, newborn, product & personal profile photoshoots by experienced lensmen.",     commissionPercent: 15, subCategories: [], isActive: true },
  { id: "37", slug: "caterer",              name: "Caterer",                icon: "🍽️", group: "Events & Lifestyle",  description: "Home-cooked or buffet catering for family functions, parties & corporate events.",     commissionPercent: 15, subCategories: [], isActive: true },
  { id: "38", slug: "birthday-decorator",   name: "Birthday Decorator",     icon: "🎈", group: "Events & Lifestyle",  description: "Balloon setups, theme decorations & party prop arrangements for all age groups.",       commissionPercent: 15, subCategories: [], isActive: true },
  { id: "39", slug: "purohit-pandit",       name: "Purohit / Pandit",       icon: "🪔", group: "Events & Lifestyle",  description: "Experienced pandits for Puja, Havan, Griha Pravesh, Namkaran & other rituals.",        commissionPercent: 10, subCategories: [], isActive: true },
  { id: "40", slug: "astrologer",           name: "Astrologer",             icon: "🔮", group: "Events & Lifestyle",  description: "Vedic astrology, kundali matching, numerology & personal consultation sessions.",       commissionPercent: 15, subCategories: [], isActive: true },

  // ── PET CARE ──────────────────────────────────────────────────────────────
  { id: "41", slug: "pet-grooming",         name: "Pet Grooming",           icon: "🐾", group: "Pet Care",            description: "Professional pet bathing, coat trimming, nail clipping & overall hygiene care.",       commissionPercent: 15, subCategories: [], isActive: true },
  { id: "42", slug: "pet-trainer",          name: "Pet Trainer",            icon: "🐶", group: "Pet Care",            description: "Obedience training, behavioural correction & socialisation for dogs & cats.",          commissionPercent: 15, subCategories: [], isActive: true },

  // ── HOME STAFF ────────────────────────────────────────────────────────────
  { id: "43", slug: "cook-on-demand",       name: "Cook on Demand",         icon: "👨‍🍳", group: "Home Staff",          description: "Hire part-time or full-time home cooks for daily meals, tiffin & special diets.",      commissionPercent: 12, subCategories: [], isActive: true },
  { id: "44", slug: "baby-sitter",          name: "Baby Sitter",            icon: "👶", group: "Home Staff",          description: "Verified & background-checked nannies for infant and toddler care at home.",            commissionPercent: 12, subCategories: [], isActive: true },
  { id: "45", slug: "elder-care",           name: "Elder Care",             icon: "🧓", group: "Home Staff",          description: "Compassionate, trained caretakers for senior citizens — daily care & companionship.",  commissionPercent: 12, subCategories: [], isActive: true },

  // ── PROFESSIONAL SERVICES ─────────────────────────────────────────────────
  { id: "46", slug: "property-lawyer",      name: "Property Lawyer",        icon: "⚖️", group: "Professional",        description: "Legal help for land registration, property disputes, agreements & documentation.",     commissionPercent: 15, subCategories: [], isActive: true },
  { id: "47", slug: "ca-tax-filing",        name: "CA & Tax Filing",        icon: "📊", group: "Professional",        description: "Chartered accountants for GST, income tax, ITR filing & company audit support.",      commissionPercent: 15, subCategories: [], isActive: true },
  { id: "48", slug: "loan-consultant",      name: "Loan Consultant",        icon: "🏦", group: "Professional",        description: "Expert guidance for home, personal, education & business loan applications.",          commissionPercent: 12, subCategories: [], isActive: true },
  { id: "49", slug: "travel-agent",         name: "Travel Agent",           icon: "✈️", group: "Professional",        description: "Flight & train booking, holiday packages & travel planning for families & groups.",   commissionPercent: 10, subCategories: [], isActive: true },
  { id: "50", slug: "passport-agent",       name: "Passport Agent",         icon: "🛂", group: "Professional",        description: "Assisted new passport application, renewal, Tatkal & Seva Kendra documentation.",     commissionPercent: 10, subCategories: [], isActive: true },
  { id: "51", slug: "real-estate-agent",    name: "Real Estate Agent",      icon: "🏠", group: "Professional",        description: "Trusted agents for buying, selling, renting & property valuation services.",          commissionPercent: 10, subCategories: [], isActive: true },
  { id: "55", slug: "courier-services",     name: "Courier Services",       icon: "🚚", group: "Professional",        description: "Same-day & scheduled parcel pickup, delivery & logistics within city.",               commissionPercent: 10, subCategories: [], isActive: true },
];

// ─── Slug helpers ─────────────────────────────────────────────────────────────
export function cityToSlug(cityName: string): string {
  return cityName.toLowerCase().replace(/\s+/g, "-");
}

export function getCityBySlug(slug: string) {
  return MOCK_CITIES.find((c) => c.slug === slug) ?? null;
}

export function getCategoryBySlug(slug: string) {
  return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/** /:citySlug/book/:categorySlug */
export function buildBookingUrl(citySlug: string, categorySlug: string): string {
  return `/${citySlug}/book/${categorySlug}`;
}

export const TESTIMONIALS = [
  { id: "1", name: "Priya Sharma",  city: "Lucknow",   rating: 5, text: "Bahut acha service mila! Plumber 30 minute mein aa gaya. ADDies ka system kaafi fast hai.", avatar: "PS" },
  { id: "2", name: "Rahul Verma",   city: "Delhi",     rating: 5, text: "AC service ke liye book kiya, technician on time aaya aur kaam bhi sahi kiya. Highly recommended!", avatar: "RV" },
  { id: "3", name: "Anjali Singh",  city: "Mumbai",    rating: 4, text: "Ghar ki cleaning ke liye best platform. Price bhi reasonable hai aur staff professional.", avatar: "AS" },
  { id: "4", name: "Mohit Gupta",   city: "Bangalore", rating: 5, text: "Electrical work kaafi quickly complete hua. Vendor ka rating system bahut helpful hai.", avatar: "MG" },
  { id: "5", name: "Neha Agarwal",  city: "Jaipur",    rating: 5, text: "Pest control booking ki, same day service mili. ADDies se ab regularly book karte hain.", avatar: "NA" },
];
