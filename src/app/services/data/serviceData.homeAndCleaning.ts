// src/pages/services/data/serviceData.homeAndCleaning.ts
// Group: Home & Cleaning
// Slugs: home-cleaning, sofa-carpet-cleaning, dry-cleaning, home-renovation, interior-designer

export type ServiceContent = {
  tagline:   string;
  heroColor: string;
  packages:  {
    name: string; tag?: string; price: number;
    duration: string; rooms: string;
    color: string; bg: string; border: string; colorText: string;
    features: string[];
  }[];
  whyUs:    { icon: string; label: string; sub: string }[];
  whatWeDo: { icon: string; label: string; sub: string }[];
  faqs:     { q: string; a: string }[];
};

const homeAndCleaning: Record<string, ServiceContent> = {

  "home-cleaning": {
    tagline:   "Trained professionals, eco-friendly products, spotless home — guaranteed.",
    heroColor: "from-cyan-600 via-teal-600 to-emerald-700",
    packages: [
      { name:"Basic Clean",    price:499,  duration:"2–3 hrs", rooms:"1–2 BHK", tag:undefined,
        color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200",   colorText:"text-blue-600",
        features:["Dusting all surfaces","Floor sweeping & mopping","Bathroom cleaning","Kitchen countertop wipe","Trash removal"] },
      { name:"Standard Clean", price:899,  duration:"3–5 hrs", rooms:"2–3 BHK", tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Everything in Basic","Inside cabinet wipe","Appliance exterior clean","Window sill cleaning","Sofa vacuuming","Balcony sweep"] },
      { name:"Deep Clean",     price:1599, duration:"6–8 hrs", rooms:"3–4 BHK", tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Everything in Standard","Inside fridge & microwave","Scrubbing tiles & grout","Behind furniture cleaning","Full kitchen degreasing","Mattress vacuuming"] },
    ],
    whyUs:[
      { icon:"🎓", label:"Trained Staff",        sub:"15-day training & background verified" },
      { icon:"🧴", label:"Eco-Friendly Products", sub:"ISO-certified, safe for kids & pets" },
      { icon:"🔄", label:"Re-clean Guarantee",   sub:"Free re-clean within 48 hrs if unsatisfied" },
    ],
    whatWeDo:[
      { icon:"🛋️", label:"Living Room", sub:"Dusting, vacuuming, mopping" },
      { icon:"🍳", label:"Kitchen",     sub:"Counters, sink, appliances" },
      { icon:"🚿", label:"Bathrooms",   sub:"Tiles, toilet, mirrors" },
      { icon:"🛏️", label:"Bedrooms",   sub:"Floors, surfaces, fans" },
      { icon:"🪴", label:"Balcony",     sub:"Sweep & mop" },
      { icon:"✨", label:"Entire Home", sub:"Top-to-bottom clean" },
    ],
    faqs:[
      { q:"Kya cleaning products aap log laate ho?",         a:"Haan, eco-friendly products aur equipment saath laate hain." },
      { q:"Kitne professionals aayenge?",                    a:"Package ke hisaab se 1–3 professionals aate hain." },
      { q:"Agar satisfied nahi hue to?",                     a:"100% guarantee — 24 ghante mein complain karo, free re-clean milegi." },
      { q:"Kya ghar par rehna zaroori hai?",                 a:"Nahi, key de ke ja sakte ho. Photos & report share kiya jayega." },
    ],
  },

  "sofa-carpet-cleaning": {
    tagline:   "Deep-clean your sofa, carpet & mattress. Stains out, freshness in — same day.",
    heroColor: "from-purple-600 via-violet-700 to-purple-800",
    packages: [
      { name:"Spot Clean",    price:399,  duration:"1 hr",  rooms:"1 item",      tag:undefined,
        color:"text-purple-600", bg:"bg-purple-50", border:"border-purple-200", colorText:"text-purple-600",
        features:["Stain removal","1 item","Dry cleaning","Deodorize"] },
      { name:"Sofa + Carpet", price:799,  duration:"2 hrs", rooms:"Sofa + rug",  tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["1 sofa (3-seater)","1 carpet or rug","Steam cleaning","Fabric protector spray","Odor treatment"] },
      { name:"Full Package",  price:1499, duration:"4 hrs", rooms:"All items",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Sofa + carpet + mattress","All rooms","Anti-allergen treatment","Full sanitization","Same-day dry"] },
    ],
    whyUs:[
      { icon:"♨️", label:"Steam Technology",  sub:"Kills 99.9% bacteria & dust mites" },
      { icon:"🌸", label:"Same Day Dry",       sub:"Sofa usable within 4 hours" },
      { icon:"🛡️", label:"Fabric Protection", sub:"Post-clean protector spray included" },
    ],
    whatWeDo:[
      { icon:"🛋️", label:"Sofa",        sub:"All sizes & fabric types" },
      { icon:"🪵", label:"Carpet/Rug",  sub:"Deep steam clean" },
      { icon:"🛏️", label:"Mattress",   sub:"Anti-allergen treatment" },
      { icon:"🪑", label:"Chairs",      sub:"Fabric & leather" },
      { icon:"🪟", label:"Curtains",    sub:"On-site cleaning" },
      { icon:"🐾", label:"Pet Stains",  sub:"Enzyme-based treatment" },
    ],
    faqs:[
      { q:"Sofa dry hone mein kitna time lagega?",           a:"4–6 hours. Fan ya AC chalate raho." },
      { q:"Purane daag nikl sakte hain?",                    a:"95% daag hata sakte hain. Bahut purane daag ke liye repeat treatment lagti hai." },
      { q:"Kya cleaning solution bachon ke liye safe hai?",  a:"Haan, non-toxic aur fragrance-free solution use karte hain." },
      { q:"Leather sofa bhi saaf karte ho?",                 a:"Haan, specialized leather cleaning solution available hai." },
    ],
  },

  "dry-cleaning": {
    tagline:   "Doorstep pickup & delivery. Garments returned fresh, pressed, and folded.",
    heroColor: "from-sky-500 via-blue-600 to-indigo-700",
    packages: [
      { name:"Basic Bundle",   price:299,  duration:"24 hrs",  rooms:"Up to 5 items",   tag:undefined,
        color:"text-sky-600",    bg:"bg-sky-50",    border:"border-sky-200",    colorText:"text-sky-600",
        features:["Up to 5 shirts or trousers","Dry clean & press","Folded & packed","Free pickup"] },
      { name:"Premium Bundle", price:699,  duration:"24 hrs",  rooms:"Up to 12 items",  tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Up to 12 garments","Suits, sarees, kurtas","Premium finish","Express option","Free delivery"] },
      { name:"Monthly Plan",   price:1999, duration:"Monthly", rooms:"Unlimited visits", tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Unlimited pickups/month","All garment types","Woollens & delicates","Priority scheduling","Dedicated bag"] },
    ],
    whyUs:[
      { icon:"🚗", label:"Free Pickup & Drop",  sub:"We come to you — no travel needed" },
      { icon:"👔", label:"Expert Pressing",      sub:"Crease-free, brand-quality finish" },
      { icon:"🌿", label:"Gentle on Fabrics",   sub:"Chemical-free process for delicates" },
    ],
    whatWeDo:[
      { icon:"👔", label:"Shirts & Trousers", sub:"Wash, dry, press" },
      { icon:"🥻", label:"Sarees & Lehengas", sub:"Delicate fabric care" },
      { icon:"🧥", label:"Suits & Blazers",   sub:"Shape-preserving clean" },
      { icon:"🧣", label:"Woollens",          sub:"Shrink-free treatment" },
      { icon:"👗", label:"Dresses",           sub:"All fabrics" },
      { icon:"🛏️", label:"Bed Linen",        sub:"Pillows, sheets, covers" },
    ],
    faqs:[
      { q:"Pickup kab hota hai?",                            a:"Same day pickup if booked before 11 AM. Delivery in 24 hrs." },
      { q:"Kya delicate/silk kapde bhi lete ho?",           a:"Haan, silk, chiffon, net sab ke liye special handling hai." },
      { q:"Agar koi garment kharab ho jaye?",               a:"Full replacement cost diya jaata hai damage ke case mein." },
      { q:"Monthly plan mein kya aata hai?",                a:"Unlimited pickups, all garment types, priority scheduling." },
    ],
  },

  "home-renovation": {
    tagline:   "Transform your living space — walls, flooring, false ceilings & complete makeovers.",
    heroColor: "from-stone-600 via-neutral-700 to-stone-800",
    packages: [
      { name:"Single Room",  price:15000, duration:"3–5 days", rooms:"1 room",     tag:undefined,
        color:"text-stone-600",  bg:"bg-stone-50",  border:"border-stone-200",  colorText:"text-stone-600",
        features:["1 room renovation","Wall repair & paint","Flooring work","Electrical points","Site cleanup"] },
      { name:"2 BHK Reno",   price:45000, duration:"7–10 days",rooms:"2 BHK",     tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Full 2 BHK","POP false ceiling","Premium flooring","Modular kitchen basic","5% snag warranty"] },
      { name:"Full Makeover", price:99000, duration:"3–4 weeks",rooms:"3+ BHK",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Complete renovation","Interior design included","Premium materials","10-year structural warranty","Dedicated project manager"] },
    ],
    whyUs:[
      { icon:"📋", label:"Fixed Price Quote",  sub:"No surprise bills — locked price before work" },
      { icon:"🏗️", label:"Licensed Contractors",sub:"Civil engineers & licensed construction team" },
      { icon:"🧹", label:"Post-Work Cleanup",  sub:"Site cleaned to move-in ready condition" },
    ],
    whatWeDo:[
      { icon:"🧱", label:"Wall Work",         sub:"Plaster, repair, paint" },
      { icon:"🪟", label:"Flooring",          sub:"Tiles, marble, vinyl" },
      { icon:"💡", label:"False Ceiling",     sub:"POP, gypsum, grid" },
      { icon:"🚿", label:"Bathroom Reno",     sub:"Full redo & fittings" },
      { icon:"🍳", label:"Kitchen Reno",      sub:"Modular & civil" },
      { icon:"🚪", label:"Doors & Windows",   sub:"Replacement & frames" },
    ],
    faqs:[
      { q:"Kitne time mein renovation complete hogi?",       a:"1 room: 3–5 days. Full 2 BHK: 7–10 days. Project size pe depend karta hai." },
      { q:"Kya materials aap log laate ho?",                 a:"Haan, materials hamari taraf se hain. Aap brand choose kar sakte ho." },
      { q:"Kya quote se zyada charges lag sakte hain?",      a:"Nahi — we give fixed-price contracts. Zero hidden charges." },
      { q:"Kya warranty milti hai?",                         a:"5-year workmanship warranty on standard, 10-year on premium package." },
    ],
  },

  "interior-designer": {
    tagline:   "Your dream home, designed & executed. End-to-end interior design at honest prices.",
    heroColor: "from-rose-600 via-pink-700 to-rose-800",
    packages: [
      { name:"Consultation",   price:999,   duration:"2 hrs",   rooms:"1 visit",     tag:undefined,
        color:"text-rose-600",   bg:"bg-rose-50",   border:"border-rose-200",   colorText:"text-rose-600",
        features:["2-hr home visit","Space analysis","Mood board","Material suggestions","Detailed quote"] },
      { name:"Room Design",    price:9999,  duration:"2 weeks",  rooms:"1 room",     tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["1 room full design","3D visualization","Vendor shortlisting","Shopping list","On-site supervision"] },
      { name:"Full Home",      price:35000, duration:"4–6 weeks",rooms:"Full home",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Complete home design","All rooms + kitchen","Modular furniture plan","Execution management","1-year post-handover support"] },
    ],
    whyUs:[
      { icon:"🖼️", label:"3D Visualization",  sub:"See your room before work begins" },
      { icon:"💰", label:"Budget Tracking",    sub:"Live cost tracker, no overspending" },
      { icon:"🏅", label:"Certified Designers",sub:"NIFT & NID trained professionals" },
    ],
    whatWeDo:[
      { icon:"🛋️", label:"Living Room",    sub:"Furniture & décor layout" },
      { icon:"🛏️", label:"Bedroom",       sub:"Wardrobes, lighting, palette" },
      { icon:"🍳", label:"Kitchen",        sub:"Modular & open kitchen" },
      { icon:"🚿", label:"Bathroom",       sub:"Fixtures & tile selection" },
      { icon:"📐", label:"Space Planning", sub:"Floor plan optimization" },
      { icon:"💡", label:"Lighting Design",sub:"Ambient & task lighting" },
    ],
    faqs:[
      { q:"Kya sirf ek room ka design milega?",              a:"Haan, Room Design package sirf 1 room ke liye hai." },
      { q:"3D design mein changes ho sakte hain?",           a:"Haan, 3 free revisions included. Additional revisions ₹999 each." },
      { q:"Execution bhi karte ho ya sirf design?",          a:"Full Home package mein execution management included hai." },
      { q:"Kya existing furniture ke saath design milega?",  a:"Haan, existing pieces ko incorporate karke design banate hain." },
    ],
  },

};

export default homeAndCleaning;
