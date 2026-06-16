// src/pages/services/ServiceDetailPage.tsx
// Design: HomeCleaningDetailPage (teal/cyan hero, sidebar, booking modal style)
// Functionality: ServiceDetailPage (all 12 categories, login→dashboard flow, no popup booking)

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star, Clock, Shield, CheckCircle2, ChevronDown, ChevronUp,
  ArrowLeft, CalendarDays, MapPin, Users, Sparkles, Leaf,
  ChevronRight, Award, Zap, Phone, MessageCircle,
  ThumbsUp, Home, Check,
} from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";
import { useAuthStore } from "../../../store/authStore";
import { MOCK_CATEGORIES, getCategoryBySlug, getCityBySlug, cityToSlug } from "../../../data/mockData";
import { CATEGORY_DATA } from "../customer/booking/data";
import homeAndCleaning    from "./data/serviceData.homeAndCleaning";
import repairsAppliances  from "./data/serviceData.repairsAndAppliances";
import beautyAndWellness   from "./data/serviceData.beautyAndWellness";
import healthcare          from "./data/serviceData.healthcare";
import education           from "./data/serviceData.education";
import skilledTrades       from "./data/serviceData.skilledTrades";
import eventsAndLifestyle  from "./data/serviceData.eventsAndLifestyle";
import petCare             from "./data/serviceData.petCare";
import homeStaff           from "./data/serviceData.homeStaff";
import professional        from "./data/serviceData.professional";

// ── Per-category content ──────────────────────────────────────────────────────
const CAT_CONTENT: Record<string, {
  tagline:   string;
  heroColor: string; // tailwind gradient classes for hero
  packages:  { name: string; tag?: string; price: number; duration: string; rooms: string; color: string; bg: string; border: string; colorText: string; features: string[] }[];
  whyUs:     { icon: string; label: string; sub: string }[];
  faqs:      { q: string; a: string }[];
  whatWeDo:  { icon: string; label: string; sub: string }[];
}> = {
  "home-cleaning": {
    tagline: "Trained professionals, eco-friendly products, spotless home — guaranteed.",
    heroColor: "from-cyan-600 via-teal-600 to-emerald-700",
    packages: [
      { name:"Basic Clean",   price:499,  duration:"2–3 hrs", rooms:"1–2 BHK", tag:undefined,
        color:"text-blue-600", bg:"bg-blue-50", border:"border-blue-200", colorText:"text-blue-600",
        features:["Dusting all surfaces","Floor sweeping & mopping","Bathroom cleaning","Kitchen countertop wipe","Trash removal"] },
      { name:"Standard Clean",price:899,  duration:"3–5 hrs", rooms:"2–3 BHK", tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["Everything in Basic","Inside cabinet wipe","Appliance exterior clean","Window sill cleaning","Sofa vacuuming","Balcony sweep"] },
      { name:"Deep Clean",    price:1599, duration:"6–8 hrs", rooms:"3–4 BHK", tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Everything in Standard","Inside fridge & microwave","Scrubbing tiles & grout","Behind furniture cleaning","Full kitchen degreasing","Mattress vacuuming"] },
    ],
    whyUs:[
      { icon:"🎓", label:"Trained Staff",       sub:"15-day training & background check" },
      { icon:"🧴", label:"Eco-Friendly Products",sub:"ISO-certified, safe for kids & pets" },
      { icon:"🔄", label:"Re-clean Guarantee",  sub:"Free re-clean within 48 hours if unsatisfied" },
    ],
    whatWeDo:[
      { icon:"🛋️", label:"Living Room",  sub:"Dusting, vacuuming, mopping" },
      { icon:"🍳", label:"Kitchen",      sub:"Counters, sink, appliances" },
      { icon:"🚿", label:"Bathrooms",    sub:"Tiles, toilet, mirrors" },
      { icon:"🛏️", label:"Bedrooms",    sub:"Floors, surfaces, fans" },
      { icon:"🪴", label:"Balcony",      sub:"Sweep & mop" },
      { icon:"✨", label:"Entire Home",  sub:"Top-to-bottom clean" },
    ],
    faqs:[
      { q:"Kya cleaning products aap log laate ho?",            a:"Haan, eco-friendly products aur equipment saath laate hain. Kuch bhi nahi chahiye aapko." },
      { q:"Kitne professionals aayenge?",                        a:"Package ke hisaab se 1–3 professionals. Deep Clean mein 2–3 log." },
      { q:"Agar kaam se satisfied nahi hue to?",                a:"100% satisfaction guarantee. 24 ghante ke andar complain karo — free re-clean milegi." },
      { q:"Kya mujhe ghar par rehna zaroori hai?",              a:"Nahi, key/access de ke ja sakte ho. Baad mein photos & report share kiya jaayega." },
    ],
  },
  "plumbing": {
    tagline: "Fast, reliable plumbers. Leak fixed before your floor gets damaged.",
    heroColor: "from-blue-600 via-blue-700 to-indigo-800",
    packages: [
      { name:"Basic Fix",       price:299,  duration:"1 hr",    rooms:"1 issue",   tag:undefined,
        color:"text-blue-600", bg:"bg-blue-50", border:"border-blue-200", colorText:"text-blue-600",
        features:["Single leak fix","Tap repair","Basic tools","Visiting charge waived"] },
      { name:"Standard Repair", price:599,  duration:"2 hrs",   rooms:"Up to 3 pts",tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["Up to 3 leak points","Pipe replacement","Drain unblocking","Toilet repair","Free follow-up 7 days"] },
      { name:"Full Plumbing",   price:1299, duration:"4 hrs",   rooms:"Full bathroom",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Complete bathroom","New fittings install","Water tank clean","Motor check","12-month warranty"] },
    ],
    whyUs:[
      { icon:"⚡", label:"30-min Response",    sub:"Emergency plumbers 24/7" },
      { icon:"🔩", label:"Genuine Parts",      sub:"ISI-marked pipes & fittings only" },
      { icon:"📋", label:"Transparent Billing",sub:"Final price confirmed before work" },
    ],
    whatWeDo:[
      { icon:"💧", label:"Pipe Leaks",         sub:"All pipe types" },
      { icon:"🚿", label:"Tap & Faucet",       sub:"Repair & replacement" },
      { icon:"🚽", label:"Toilet Repair",      sub:"Tank & flush issues" },
      { icon:"🪣", label:"Water Tank",         sub:"Cleaning & repair" },
      { icon:"🌀", label:"Drain Unblocking",   sub:"Fast drain clearing" },
      { icon:"🔧", label:"New Fittings",       sub:"Installation work" },
    ],
    faqs:[
      { q:"Do you charge a visiting fee?",                       a:"₹100 visiting charge applies, refunded if you book the service." },
      { q:"Can you fix leaks in old buildings?",                 a:"Yes, trained for GI, CPVC, and PVC pipes." },
      { q:"How long do repairs last?",                           a:"Standard repairs carry a 90-day workmanship warranty." },
      { q:"Is same-day service available?",                      a:"Yes, book before 12 PM for same-day plumbing service." },
    ],
  },
  "electrical": {
    tagline: "Certified electricians for safe, reliable electrical work at home.",
    heroColor: "from-amber-500 via-orange-600 to-red-700",
    packages: [
      { name:"Quick Fix",        price:299,  duration:"1 hr",   rooms:"1 fault",      tag:undefined,
        color:"text-amber-600", bg:"bg-amber-50", border:"border-amber-200", colorText:"text-amber-600",
        features:["Single fault fix","Switch/plug repair","Basic wiring","Safety check"] },
      { name:"Standard Service", price:699,  duration:"2 hrs",  rooms:"Up to 5 pts",  tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["Up to 5 points","Fan installation","MCB repair","Earthing check","30-day warranty"] },
      { name:"Full Electrical",  price:1499, duration:"4 hrs",  rooms:"Full home",    tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Complete rewiring","Inverter/UPS setup","DB board upgrade","Safety audit","1-year warranty"] },
    ],
    whyUs:[
      { icon:"🎖️", label:"Licensed Electricians",sub:"Valid electrical contractor licenses" },
      { icon:"🛡️", label:"Safety First",          sub:"IS 732 electrical safety standards" },
      { icon:"⏱️", label:"Same Day Service",       sub:"Book before 2 PM, get service today" },
    ],
    whatWeDo:[
      { icon:"🔌", label:"Switchboard",     sub:"Repair & replacement" },
      { icon:"💡", label:"Light Fitting",   sub:"Install & fix" },
      { icon:"🌀", label:"Fan Work",        sub:"Install, repair, balance" },
      { icon:"⚡", label:"MCB/Fuse",        sub:"Tripping & short circuit" },
      { icon:"🔋", label:"Inverter",        sub:"Setup & repair" },
      { icon:"🧱", label:"Wiring",          sub:"New & repair work" },
    ],
    faqs:[
      { q:"Is it safe to have electrical work at home?",         a:"Our electricians are CIRE-certified and follow all safety protocols." },
      { q:"Do you handle inverter/solar installations?",         a:"Yes, premium package covers inverter, UPS, and solar panel work." },
      { q:"What if there's a short circuit risk?",               a:"Free safety audit before starting any electrical work." },
      { q:"How long does repair warranty last?",                 a:"30-day warranty on standard, 1-year on full electrical package." },
    ],
  },
  "ac-service": {
    tagline: "Cool air guaranteed. Expert AC service and repair for all brands.",
    heroColor: "from-sky-500 via-blue-600 to-cyan-700",
    packages: [
      { name:"AC Servicing",  price:499,  duration:"1 hr",   rooms:"1 AC",    tag:undefined,
        color:"text-sky-600", bg:"bg-sky-50", border:"border-sky-200", colorText:"text-sky-600",
        features:["Filter cleaning","Coil wash","Water drainage check","Performance test"] },
      { name:"Full Service",  price:899,  duration:"2 hrs",  rooms:"1 AC",    tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["Deep coil cleaning","Gas pressure check","Fan motor oil","Remote sync","90-day warranty"] },
      { name:"Gas + Service", price:1799, duration:"3 hrs",  rooms:"Up to 2 ACs",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["All above + gas refill","PCB check","Compressor test","2 ACs covered","1-year AMC option"] },
    ],
    whyUs:[
      { icon:"🌡️", label:"All Brands",    sub:"Samsung, LG, Daikin, Voltas, Hitachi" },
      { icon:"🔬", label:"Genuine Gas",   sub:"R32/R410a from authorized suppliers" },
      { icon:"📱", label:"Live Tracking", sub:"Track your technician in real-time" },
    ],
    whatWeDo:[
      { icon:"❄️", label:"AC Servicing",     sub:"Deep clean & tune-up" },
      { icon:"💨", label:"Gas Refill",        sub:"R32/R410a refrigerant" },
      { icon:"🔧", label:"AC Repair",         sub:"All fault types" },
      { icon:"📥", label:"Installation",      sub:"New AC fitting" },
      { icon:"📤", label:"Uninstallation",    sub:"Safe removal" },
      { icon:"🖥️", label:"PCB Repair",       sub:"Electronic board fix" },
    ],
    faqs:[
      { q:"How often should I service my AC?",                   a:"Twice a year — once before summer, once before monsoon." },
      { q:"How do I know if my AC needs gas?",                   a:"Poor cooling even after servicing is the main indicator." },
      { q:"Do you cover window ACs too?",                        a:"Yes, split, window, cassette, and tower ACs all covered." },
      { q:"Is same-day AC service available?",                   a:"Yes, book before 12 PM for same-day service in most cities." },
    ],
  },
  "painting": {
    tagline: "Transform your walls. Professional painters, premium paints.",
    heroColor: "from-rose-500 via-pink-600 to-purple-700",
    packages: [
      { name:"Touch Up",      price:799,  duration:"4 hrs",  rooms:"Up to 200 sqft", tag:undefined,
        color:"text-rose-600", bg:"bg-rose-50", border:"border-rose-200", colorText:"text-rose-600",
        features:["Up to 200 sq ft","Same color match","Putty included","1 coat finish"] },
      { name:"Room Painting", price:1999, duration:"1 day",  rooms:"1 room",         tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["1 room full walls","Primer + 2 coats","Color consultation","Asian/Berger paint","Furniture covered"] },
      { name:"Full Home",     price:4999, duration:"3 days", rooms:"Full home",       tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Entire home","Premium paints","Texture options","POP work included","2-year warranty"] },
    ],
    whyUs:[
      { icon:"🎨", label:"Color Consultation",sub:"Free AR color preview before painting" },
      { icon:"🏷️", label:"Brand Paints Only", sub:"Asian Paints, Berger, Nerolac only" },
      { icon:"🧹", label:"Zero Mess Promise",  sub:"Full floor/furniture protection & cleanup" },
    ],
    whatWeDo:[
      { icon:"🏠", label:"Interior Walls",    sub:"Full room painting" },
      { icon:"🌦️", label:"Exterior",          sub:"Weather-proof paint" },
      { icon:"💧", label:"Waterproofing",     sub:"Damp & seepage fix" },
      { icon:"🪵", label:"Wood Polish",       sub:"Furniture & doors" },
      { icon:"🌀", label:"Texture Painting",  sub:"Decorative finishes" },
      { icon:"🖌️", label:"Whitewash",         sub:"Traditional finish" },
    ],
    faqs:[
      { q:"Do you provide paints or should I buy?",              a:"We bring paints included in package price — no hidden costs." },
      { q:"How long does paint take to dry?",                    a:"Touch dry in 2 hours, fully cured in 24 hours." },
      { q:"Can you do texture and stencil painting?",            a:"Yes, premium package includes all decorative painting options." },
      { q:"Is furniture protection included?",                   a:"Yes, full floor and furniture protection is standard in all packages." },
    ],
  },
  "carpentry": {
    tagline: "Expert carpenters for furniture repair, assembly, and custom work.",
    heroColor: "from-amber-700 via-orange-700 to-amber-800",
    packages: [
      { name:"Quick Fix",    price:349,  duration:"1 hr",   rooms:"1 item",        tag:undefined,
        color:"text-amber-700", bg:"bg-amber-50", border:"border-amber-200", colorText:"text-amber-700",
        features:["1 item repair","Basic hardware fix","Door/hinge fix","Tools included"] },
      { name:"Standard Job", price:699,  duration:"2 hrs",  rooms:"Up to 3 items", tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["Up to 3 items","Furniture assembly","Cabinet fitting","Wardrobe repair","60-day warranty"] },
      { name:"Custom Work",  price:1999, duration:"1 day",  rooms:"Full room",     tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Modular assembly","False ceiling","Custom shelves","Full room joinery","6-month warranty"] },
    ],
    whyUs:[
      { icon:"🪵", label:"Quality Materials",sub:"Grade-A ply & hardwood" },
      { icon:"📐", label:"Precision Work",   sub:"Measurements to the millimeter" },
      { icon:"🏠", label:"Modular Experts",  sub:"IKEA, HomeTown, Urban Ladder certified" },
    ],
    whatWeDo:[
      { icon:"🚪", label:"Door Repair",     sub:"Hinge, frame, lock" },
      { icon:"🛋️", label:"Furniture",       sub:"Repair & assembly" },
      { icon:"🗄️", label:"Cabinets",        sub:"Install & fix" },
      { icon:"🪟", label:"Windows",         sub:"Frame & shutter work" },
      { icon:"🛏️", label:"Bed Assembly",    sub:"All sizes" },
      { icon:"✨", label:"False Ceiling",    sub:"POP & gypsum" },
    ],
    faqs:[
      { q:"Can you assemble IKEA/HomeTown furniture?",           a:"Yes, we specialize in flat-pack assembly for all major brands." },
      { q:"Do you do custom built-in furniture?",                a:"Yes, custom wardrobes, shelves, and kitchen units in premium package." },
      { q:"What if the repair doesn't hold?",                    a:"All repairs come with a 60-day warranty — free redo if it fails." },
      { q:"Do you bring your own tools?",                        a:"Yes, our carpenters carry a full professional toolkit." },
    ],
  },
  "pest-control": {
    tagline: "Certified pest control. Safe for kids and pets.",
    heroColor: "from-green-600 via-emerald-700 to-teal-800",
    packages: [
      { name:"Single Pest",  price:599,  duration:"1 hr",    rooms:"1 type",    tag:undefined,
        color:"text-green-600", bg:"bg-green-50", border:"border-green-200", colorText:"text-green-600",
        features:["1 pest type","Gel/spray treatment","Kitchen-safe chemicals","1 room focus"] },
      { name:"Full Home",    price:999,  duration:"2 hrs",   rooms:"Full home", tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["All common pests","Cockroach + ants","Lizard repellent","3-month warranty","Safe for pets"] },
      { name:"Annual AMC",   price:2999, duration:"Yearly",  rooms:"Full home", tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["4 visits/year","Termite treatment","Rodent baiting","Mosquito fogging","Priority scheduling"] },
    ],
    whyUs:[
      { icon:"🌿", label:"Child & Pet Safe",    sub:"WHO-approved, odorless chemicals" },
      { icon:"🎓", label:"Certified Operators", sub:"PCO certificates from state authority" },
      { icon:"🔄", label:"Free Re-treatment",  sub:"Free redo within warranty period" },
    ],
    whatWeDo:[
      { icon:"🪳", label:"Cockroaches",  sub:"Gel & spray treatment" },
      { icon:"🐜", label:"Ants",         sub:"Colony elimination" },
      { icon:"🦟", label:"Mosquitoes",   sub:"Fogging & spray" },
      { icon:"🐁", label:"Rodents",      sub:"Baiting & traps" },
      { icon:"🐛", label:"Termites",     sub:"Wood protection" },
      { icon:"🛏️", label:"Bed Bugs",    sub:"Heat & chemical treatment" },
    ],
    faqs:[
      { q:"Do we need to vacate during treatment?",              a:"No — we use odorless gel treatments. You can stay home." },
      { q:"How long before I see results?",                      a:"Cockroaches & ants: 24-48 hours. Termites: 7-10 days." },
      { q:"Is it safe for my pets?",                             a:"Yes, WHO-approved chemicals safe for pets at all times." },
      { q:"Do you offer AMC plans?",                             a:"Yes, annual AMC with 4 visits/year at significant discount." },
    ],
  },
  "appliance-repair": {
    tagline: "All major appliances repaired by brand-certified technicians.",
    heroColor: "from-slate-600 via-slate-700 to-gray-800",
    packages: [
      { name:"Diagnosis",      price:199, duration:"30 min",  rooms:"1 appliance", tag:undefined,
        color:"text-slate-600", bg:"bg-slate-50", border:"border-slate-200", colorText:"text-slate-600",
        features:["Problem diagnosis","Repair estimate","No repair = no charge","All brands"] },
      { name:"Basic Repair",   price:499, duration:"2 hrs",   rooms:"1 appliance", tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["Single appliance","Part replacement","90-day warranty","Genuine spare parts"] },
      { name:"Multi-Appliance",price:999, duration:"Half day",rooms:"Up to 3",     tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Up to 3 appliances","Annual maintenance","Priority support","1-year parts warranty"] },
    ],
    whyUs:[
      { icon:"🏭", label:"Brand Certified",  sub:"Samsung, LG, Whirlpool authorized" },
      { icon:"🔩", label:"Genuine Parts",    sub:"Original parts with manufacturer warranty" },
      { icon:"🏠", label:"Doorstep Service", sub:"No need to carry heavy appliances" },
    ],
    whatWeDo:[
      { icon:"🧺", label:"Washing Machine", sub:"All types & brands" },
      { icon:"❄️", label:"Refrigerator",    sub:"Cooling & compressor" },
      { icon:"📺", label:"TV/LED",          sub:"Display & electronics" },
      { icon:"🌡️", label:"Geyser",         sub:"Heating element & tank" },
      { icon:"🍽️", label:"Dishwasher",     sub:"Pump & spray arm" },
      { icon:"📡", label:"Microwave",       sub:"Magnetron & panel" },
    ],
    faqs:[
      { q:"Do you carry spare parts with you?",                  a:"Yes, our vans carry common spares for 95% of repairs." },
      { q:"What if my appliance can't be repaired?",             a:"We give an honest opinion — and can help you recycle the old one." },
      { q:"Is the repair warranty on parts or labour?",          a:"Both — 90-day warranty covers both parts and labour." },
      { q:"Do you service all brands?",                          a:"Yes, Samsung, LG, Whirlpool, Godrej, IFB and all major brands." },
    ],
  },
  "water-purifier": {
    tagline: "Clean drinking water guaranteed. RO service by certified experts.",
    heroColor: "from-cyan-500 via-teal-600 to-blue-700",
    packages: [
      { name:"Basic Service",price:299,  duration:"1 hr",    rooms:"1 unit",  tag:undefined,
        color:"text-cyan-600", bg:"bg-cyan-50", border:"border-cyan-200", colorText:"text-cyan-600",
        features:["Filter cleaning","Output check","TDS measurement","Service report"] },
      { name:"Standard AMC", price:699,  duration:"1 hr",    rooms:"2 visits/yr",tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["Filter change","UV lamp check","Membrane flush","2 visits/year","Parts at cost"] },
      { name:"Full AMC",     price:1499, duration:"Yearly",  rooms:"4 visits/yr",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["All filters replaced","Membrane if needed","4 visits/year","Free parts","Priority response"] },
    ],
    whyUs:[
      { icon:"🧪", label:"TDS Testing",        sub:"Free before-after TDS report" },
      { icon:"📦", label:"Original Filters",   sub:"Kent, Aquaguard, Livpure authorized" },
      { icon:"📅", label:"AMC Reminder",       sub:"Auto service reminders" },
    ],
    whatWeDo:[
      { icon:"🔧", label:"RO Service",        sub:"Full cleaning & check" },
      { icon:"🔄", label:"Filter Change",     sub:"All filter types" },
      { icon:"💡", label:"UV Lamp",           sub:"Replace & test" },
      { icon:"💧", label:"Membrane",          sub:"Flush & replace" },
      { icon:"🆕", label:"New Install",       sub:"Wall mount & setup" },
      { icon:"🩺", label:"TDS Check",         sub:"Water quality test" },
    ],
    faqs:[
      { q:"How often should I service my RO?",                   a:"Every 6 months for filters, annually for membrane replacement." },
      { q:"Which brands do you service?",                        a:"Kent, Aquaguard, Livpure, HUL, Pureit, Blue Star and more." },
      { q:"What if the purifier stops working after service?",   a:"We provide a 90-day service warranty — free fix if it fails." },
      { q:"Do you replace membranes?",                           a:"Yes, membrane replacement is included in the Full AMC package." },
    ],
  },
  "sofa-carpet-cleaning": {
    tagline: "Deep clean your sofa, carpet & mattress. Stains out, freshness in.",
    heroColor: "from-purple-600 via-violet-700 to-purple-800",
    packages: [
      { name:"Spot Clean",    price:399,  duration:"1 hr",   rooms:"1 item",         tag:undefined,
        color:"text-purple-600", bg:"bg-purple-50", border:"border-purple-200", colorText:"text-purple-600",
        features:["Stain removal","1 item","Dry cleaning","Deodorize"] },
      { name:"Sofa + Carpet", price:799,  duration:"2 hrs",  rooms:"Sofa + rug",    tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["1 sofa (3-seater)","1 carpet/rug","Steam cleaning","Fabric protector","Odor treatment"] },
      { name:"Full Package",  price:1499, duration:"4 hrs",  rooms:"All rooms",     tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Sofa + carpet + mattress","All rooms","Anti-allergen treatment","Sanitization","Same-day dry"] },
    ],
    whyUs:[
      { icon:"♨️", label:"Steam Technology",  sub:"Kills 99.9% bacteria & dust mites" },
      { icon:"🌸", label:"Same Day Dry",       sub:"Sofa usable within 4 hours" },
      { icon:"🛡️", label:"Fabric Protection", sub:"Post-clean protector spray" },
    ],
    whatWeDo:[
      { icon:"🛋️", label:"Sofa",         sub:"All sizes & fabrics" },
      { icon:"🪵", label:"Carpet/Rug",   sub:"Deep steam clean" },
      { icon:"🛏️", label:"Mattress",    sub:"Anti-allergen treatment" },
      { icon:"🪑", label:"Chairs",       sub:"Fabric & leather" },
      { icon:"🪟", label:"Curtains",     sub:"On-site cleaning" },
      { icon:"🐾", label:"Pet Stains",   sub:"Enzyme treatment" },
    ],
    faqs:[
      { q:"How long will it take for sofa to dry?",              a:"4-6 hours with our fast-dry method. Keep AC/fan on." },
      { q:"Can you remove old/tough stains?",                    a:"We remove 95% of stains. Old stains may need repeat treatment." },
      { q:"Is the cleaning solution safe for kids?",             a:"Yes, non-toxic, fragrance-free solutions safe for children." },
      { q:"Do you clean leather sofas?",                         a:"Yes, we have specialized leather cleaning solutions." },
    ],
  },
  "packers-movers": {
    tagline: "Safe, on-time shifting. Your valuables packed like our own.",
    heroColor: "from-orange-500 via-amber-600 to-orange-700",
    packages: [
      { name:"Mini Move",      price:2499, duration:"Half day",rooms:"1–2 rooms",    tag:undefined,
        color:"text-orange-600", bg:"bg-orange-50", border:"border-orange-200", colorText:"text-orange-600",
        features:["1-2 rooms","Basic packing","Local within city","2 movers","Transport included"] },
      { name:"Home Shifting",  price:4999, duration:"Full day",rooms:"3–4 rooms",   tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["3-4 rooms","Premium packing","Loading+unloading","4 movers","Insurance ₹50k"] },
      { name:"Full Move",      price:9999, duration:"2 days",  rooms:"5+ rooms",    tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["5+ rooms","Fragile item packing","Car transport option","6 movers","Insurance ₹2L","Unpacking"] },
    ],
    whyUs:[
      { icon:"📋", label:"Inventory Tracking",sub:"Photo inventory before & after" },
      { icon:"🛡️", label:"Transit Insurance",sub:"Complimentary insurance on all bookings" },
      { icon:"📍", label:"GPS Tracking",      sub:"Track belongings in real-time" },
    ],
    whatWeDo:[
      { icon:"📦", label:"Packing",          sub:"Bubble wrap & foam" },
      { icon:"🚚", label:"Transport",        sub:"GPS tracked vehicles" },
      { icon:"📤", label:"Loading",          sub:"Professional handling" },
      { icon:"📥", label:"Unloading",        sub:"Careful placement" },
      { icon:"🏢", label:"Office Shifting",  sub:"Minimal downtime" },
      { icon:"🗃️", label:"Storage",          sub:"Short & long term" },
    ],
    faqs:[
      { q:"How far in advance should I book?",                   a:"At least 3 days for local moves, 7 days for intercity." },
      { q:"Are fragile items safe?",                             a:"We use bubble wrap, foam padding, and double-box method." },
      { q:"What if something breaks?",                           a:"Transit insurance covers damage up to ₹2 lakhs." },
      { q:"Do you do intercity moves?",                          a:"Yes, intercity moves covered in Full Move package." },
    ],
  },
  "cctv-installation": {
    tagline: "Professional CCTV installation. See your home from anywhere.",
    heroColor: "from-gray-700 via-slate-800 to-gray-900",
    packages: [
      { name:"2 Camera",   price:2999,  duration:"3 hrs",  rooms:"2 cameras",    tag:undefined,
        color:"text-gray-600", bg:"bg-gray-50", border:"border-gray-200", colorText:"text-gray-600",
        features:["2 HD cameras","DVR setup","50m cable","Mobile app setup","Basic config"] },
      { name:"4 Camera",   price:4999,  duration:"4 hrs",  rooms:"4 cameras",   tag:"⭐ Most Popular",
        color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", colorText:"text-emerald-600",
        features:["4 HD cameras","NVR 1TB","Night vision","Remote access","1-year warranty"] },
      { name:"Full Home",  price:8999,  duration:"1 day",  rooms:"8 cameras",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["8 cameras","2TB NVR","4K cameras option","Intercom","3-year warranty","Annual maintenance"] },
    ],
    whyUs:[
      { icon:"📱", label:"Remote View",    sub:"Watch live from anywhere in the world" },
      { icon:"🌙", label:"Night Vision",   sub:"Colour night vision 24/7" },
      { icon:"☁️", label:"Cloud Backup",  sub:"Footage safe even if DVR stolen" },
    ],
    whatWeDo:[
      { icon:"📷", label:"Camera Install",   sub:"Indoor & outdoor" },
      { icon:"💾", label:"DVR/NVR Setup",   sub:"1TB–2TB storage" },
      { icon:"📱", label:"Mobile Setup",    sub:"iOS & Android app" },
      { icon:"🌙", label:"Night Vision",    sub:"IR & colour" },
      { icon:"🔧", label:"Cable Routing",   sub:"Neat & hidden wires" },
      { icon:"☁️", label:"Cloud Backup",   sub:"Optional cloud storage" },
    ],
    faqs:[
      { q:"Can I view cameras on my phone?",                     a:"Yes — we set up free mobile viewing on iOS and Android." },
      { q:"How many days of recording can I store?",             a:"30 days with 1TB NVR. Expandable to 90 days with 2TB." },
      { q:"Do you do commercial CCTV too?",                      a:"Yes, shops, offices, and warehouses — custom solutions available." },
      { q:"What if a camera stops working after install?",       a:"1–3 year warranty depending on package. Free replacement." },
    ],
  },
};

// ── Reviews (generic — can be per-category later) ────────────────────────────
const GENERIC_REVIEWS = [
  { id:1, name:"Priya S.",  avatar:"PS", rating:5, date:"2 days ago",  location:"Lucknow",   text:"Bahut achha kaam kiya! Team bilkul professional thi. Definitely recommend karunga ADDies ko." },
  { id:2, name:"Amit K.",   avatar:"AK", rating:5, date:"1 week ago",  location:"Delhi",     text:"Professional team, on time, and very thorough. Will book again!" },
  { id:3, name:"Sunita R.", avatar:"SR", rating:4, date:"2 weeks ago", location:"Jaipur",    text:"Good service overall. Minor delay in arrival but otherwise great." },
  { id:4, name:"Rahul M.",  avatar:"RM", rating:5, date:"3 weeks ago", location:"Mumbai",    text:"Worth every rupee. The team was polite and worked without supervision needed." },
];

// ── Helper: get next 7 dates ──────────────────────────────────────────────────
function getNextDates() {
  const days   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const today  = new Date();
  return Array.from({ length:7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return { id:`d${i}`, day:days[d.getDay()], date:d.getDate(), month:months[d.getMonth()], label: i===0?"Today":i===1?"Tomorrow":null };
  });
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ServiceDetailPage() {
  const { citySlug = "", categorySlug = "" } = useParams<{ citySlug:string; categorySlug:string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const category = getCategoryBySlug(categorySlug);
  const city     = getCityBySlug(citySlug);
  // Merge all data sources: existing inline + new group files
  const ALL_SERVICE_DATA: Record<string, typeof CAT_CONTENT[string]> = {
    ...CAT_CONTENT,
    ...homeAndCleaning,
    ...repairsAppliances,
    ...beautyAndWellness,
    ...healthcare,
    ...education,
    ...skilledTrades,
    ...eventsAndLifestyle,
    ...petCare,
    ...homeStaff,
    ...professional,
  };
  const content = ALL_SERVICE_DATA[categorySlug] ?? null;

  const cityName    = city?.name ?? citySlug.split("-").map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(" ");
  const catName     = category?.name ?? categorySlug.split("-").map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(" ");

  const [selectedPkgIdx, setSelectedPkgIdx] = useState(1); // default: middle package
  const [openFaq,        setOpenFaq]        = useState<number|null>(null);

  const DATES = getNextDates();

  // ── Unknown category ──────────────────────────────────────────────────────
  if (!category || !content) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center text-center px-4">
          <div>
            <p className="text-6xl mb-4">🔍</p>
            <h1 className="text-2xl font-black text-neutral-800 mb-2">Service Not Found</h1>
            <p className="text-neutral-500 mb-6">This category doesn't exist yet.</p>
            <button onClick={() => navigate("/")} className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold">
              Back to Home
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const pkg = content.packages[selectedPkgIdx];
  const canBook = !isAuthenticated || user?.role === "customer";

  // ── Book Now handler — NO POPUP, redirect to dashboard ───────────────────
  function handleBookNow() {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { redirect:"/customer", openTab:"book", categorySlug, citySlug },
      });
    } else if (user?.role === "customer") {
      navigate("/customer", {
        state: { openTab:"book", categorySlug, citySlug },
      });
    }
    // vendor/agent → do nothing (button hidden)
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${content.heroColor}`}>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="page-container py-10 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/60 mb-6 flex-wrap">
              <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Home</button>
              <ChevronRight size={12} />
              <button onClick={() => navigate(`/${citySlug}`)} className="hover:text-white transition-colors capitalize">{cityName}</button>
              <ChevronRight size={12} />
              <span className="text-white font-semibold">{catName}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
              {/* Left */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full text-white text-xs font-semibold mb-4 backdrop-blur-sm">
                  <Sparkles size={12} className="text-yellow-300" />
                  Most Booked Service in {cityName}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                  Professional<br />
                  <span className="text-white/80">{catName}</span>
                </h1>
                <p className="text-white/80 text-sm leading-relaxed max-w-lg mb-6">{content.tagline}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-white/90 text-sm">
                    <Star size={15} className="text-yellow-300 fill-yellow-300" />
                    <span className="font-bold">4.8</span>
                    <span className="text-white/60">(2,400+ reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90 text-sm">
                    <Users size={15} className="text-white/70" />
                    <span className="font-bold">50,000+</span>
                    <span className="text-white/60">bookings done</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90 text-sm">
                    <MapPin size={15} className="text-white/70" />
                    <span className="font-bold">{cityName}</span>
                    <span className="text-white/60">& nearby</span>
                  </div>
                </div>
              </div>

              {/* Right: Quick price card */}
              <div className="w-full lg:w-80 bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-6 flex-shrink-0">
                <p className="text-xs text-white/60 font-semibold uppercase tracking-wider mb-1">Starting from</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-black text-white">₹{content.packages[0].price.toLocaleString("en-IN")}</span>
                  <span className="text-white/60 text-sm mb-1">/ visit</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {content.whyUs.slice(0,3).map(w => (
                    <li key={w.label} className="flex items-center gap-2 text-sm text-white/85">
                      <CheckCircle2 size={14} className="text-white/70 flex-shrink-0" />
                      {w.label}
                    </li>
                  ))}
                </ul>
                {canBook && (
                  <button onClick={handleBookNow}
                    className="w-full py-3.5 bg-white text-slate-800 font-black rounded-2xl text-sm
                               hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                    Book Now →
                  </button>
                )}
                <p className="text-center text-xs text-white/50 mt-3">
                  {isAuthenticated ? "Customize in booking form" : "Login required · Free & fast"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── HIGHLIGHTS BAR ────────────────────────────────────────────── */}
        <div className="border-b border-neutral-100 bg-white shadow-sm">
          <div className="page-container py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon:Shield,  label:"100% Verified",     sub:"Background checked pros",   color:"text-blue-500",   bg:"bg-blue-50" },
                { icon:Zap,     label:"Same Day Available", sub:"Book & get service today",  color:"text-amber-500",  bg:"bg-amber-50" },
                { icon:Leaf,    label:"Safe & Certified",   sub:"Quality guaranteed",        color:"text-emerald-500",bg:"bg-emerald-50" },
                { icon:Award,   label:"4.8★ Rated",        sub:"From 2,400+ reviews",       color:"text-violet-500", bg:"bg-violet-50" },
              ].map(h => (
                <div key={h.label} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${h.bg} flex items-center justify-center flex-shrink-0`}>
                    <h.icon size={18} className={h.color} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-800 leading-tight">{h.label}</p>
                    <p className="text-xs text-neutral-500">{h.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
        <div className="page-container py-10">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* ── LEFT COLUMN ── */}
            <div className="flex-1 min-w-0">

              {/* PACKAGES */}
              <section className="mb-10">
                <h2 className="text-xl font-black text-neutral-900 mb-1">Choose Your Package</h2>
                <p className="text-sm text-neutral-500 mb-5">Select the plan that fits your needs — customize after booking.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  {content.packages.map((p, i) => (
                    <button key={i} onClick={() => setSelectedPkgIdx(i)}
                      className={`relative text-left rounded-2xl border-2 p-5 transition-all group
                        ${selectedPkgIdx === i
                          ? `${p.border} ${p.bg} shadow-lg scale-[1.02]`
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md"}`}
                    >
                      {p.tag && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full whitespace-nowrap">
                          {p.tag}
                        </span>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-black uppercase tracking-wider ${selectedPkgIdx===i ? p.colorText : "text-neutral-400"}`}>
                          {p.name}
                        </span>
                        {selectedPkgIdx === i && <CheckCircle2 size={16} className={p.colorText} />}
                      </div>
                      <div className="text-2xl font-black text-neutral-900 mb-1">₹{p.price.toLocaleString("en-IN")}</div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mb-4">
                        <span className="flex items-center gap-1"><Clock size={11}/>{p.duration}</span>
                        <span className="flex items-center gap-1"><Home size={11}/>{p.rooms}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {p.features.map(f => (
                          <li key={f} className="flex items-start gap-2 text-xs text-neutral-600">
                            <CheckCircle2 size={11} className={`${selectedPkgIdx===i?p.colorText:"text-neutral-300"} flex-shrink-0 mt-0.5`}/>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>
                {canBook && (
                  <button onClick={handleBookNow}
                    className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all
                      bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200
                      hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl active:scale-[0.98]">
                    Book {pkg.name} · ₹{pkg.price.toLocaleString("en-IN")} <ChevronRight size={18}/>
                  </button>
                )}
                <p className="text-center text-xs text-neutral-400 mt-2">
                  {isAuthenticated ? "You'll fill details in the booking form" : "Login required · Free account, 30 seconds"}
                </p>
              </section>

              {/* WHAT WE DO */}
              <section className="mb-10">
                <h2 className="text-xl font-black text-neutral-900 mb-5">What We Cover</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {content.whatWeDo.map(item => (
                    <div key={item.label}
                      className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-neutral-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 text-lg">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-800">{item.label}</p>
                        <p className="text-xs text-neutral-500">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* HOW IT WORKS */}
              <section className="mb-10">
                <h2 className="text-xl font-black text-neutral-900 mb-5">How It Works</h2>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 to-emerald-300 hidden sm:block" />
                  <div className="flex flex-col gap-5">
                    {[
                      { step:"01", title:"Book Online",         desc:"Choose package. No advance payment needed.",          icon:CalendarDays, color:"bg-teal-500" },
                      { step:"02", title:"Professional Arrives",desc:"Verified pro reaches your doorstep on time.",         icon:Users,        color:"bg-blue-500" },
                      { step:"03", title:"Job Done",            desc:"Thorough work as per your selected package.",         icon:Sparkles,     color:"bg-violet-500" },
                      { step:"04", title:"Pay After Service",   desc:"Satisfied? Pay via UPI, cash or card.",               icon:Check,        color:"bg-emerald-500" },
                    ].map(s => (
                      <div key={s.step} className="flex items-start gap-5 sm:pl-12 relative">
                        <div className={`w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center flex-shrink-0 text-white shadow-md sm:absolute sm:-left-0`}>
                          <s.icon size={18}/>
                        </div>
                        <div className="bg-white rounded-2xl border border-neutral-100 p-4 flex-1 hover:border-teal-200 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-neutral-300">{s.step}</span>
                            <h3 className="text-sm font-black text-neutral-900">{s.title}</h3>
                          </div>
                          <p className="text-xs text-neutral-500 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* WHY US */}
              <section className="mb-10">
                <h2 className="text-xl font-black text-neutral-900 mb-5">Why Choose ADDies</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {content.whyUs.map(w => (
                    <div key={w.label} className="bg-white rounded-2xl border border-neutral-100 p-5">
                      <div className="text-2xl mb-3">{w.icon}</div>
                      <p className="text-sm font-black text-neutral-800 mb-1">{w.label}</p>
                      <p className="text-xs text-neutral-500 leading-relaxed">{w.sub}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* REVIEWS */}
              <section className="mb-10">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-black text-neutral-900 mb-0.5">Customer Reviews</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400"/>)}
                      </div>
                      <span className="text-sm font-bold text-neutral-700">4.8</span>
                      <span className="text-sm text-neutral-400">from 2,400+ reviews</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <ThumbsUp size={13} className="text-emerald-600"/>
                    <span className="text-xs font-bold text-emerald-700">96% satisfied</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GENERIC_REVIEWS.map(r => (
                    <div key={r.id} className="bg-white rounded-2xl border border-neutral-100 p-5 hover:border-teal-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-xs font-black">
                            {r.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-neutral-800">{r.name}</p>
                            <div className="flex items-center gap-1 text-xs text-neutral-400">
                              <MapPin size={10}/>{r.location}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-neutral-400">{r.date}</span>
                      </div>
                      <div className="flex mb-2">
                        {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400"/>)}
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section className="mb-10">
                <h2 className="text-xl font-black text-neutral-900 mb-5">Frequently Asked Questions</h2>
                <div className="flex flex-col gap-2">
                  {content.faqs.map((faq, i) => (
                    <div key={i}
                      className={`bg-white rounded-2xl border transition-all overflow-hidden
                        ${openFaq===i ? "border-teal-300 shadow-sm" : "border-neutral-100 hover:border-neutral-200"}`}>
                      <button onClick={() => setOpenFaq(openFaq===i ? null : i)}
                        className="w-full flex items-center justify-between p-5 text-left">
                        <span className="text-sm font-bold text-neutral-800 pr-4">{faq.q}</span>
                        {openFaq===i
                          ? <ChevronUp size={16} className="text-teal-500 flex-shrink-0"/>
                          : <ChevronDown size={16} className="text-neutral-400 flex-shrink-0"/>}
                      </button>
                      {openFaq===i && (
                        <div className="px-5 pb-5">
                          <p className="text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Other services */}
              <section className="mb-10">
                <h2 className="text-xl font-black text-neutral-900 mb-4">Other Services in {cityName}</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {MOCK_CATEGORIES.filter(c => c.slug!==categorySlug).slice(0,6).map(cat => (
                    <button key={cat.slug}
                      onClick={() => navigate(`/${citySlug}/${cat.slug}`)}
                      className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-neutral-100 hover:border-teal-200 hover:bg-teal-50 transition-all">
                      <span className="text-2xl">{cat.icon}</span>
                      <p className="text-xs font-semibold text-neutral-700 text-center leading-tight">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </section>

            </div>

            {/* ── STICKY SIDEBAR ── */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-20">

                {/* Package summary card */}
                <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden mb-4">
                  <div className="h-1.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400" />
                  <div className="p-6">
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-1">Selected Package</p>
                    <h3 className={`text-lg font-black ${pkg.colorText} mb-1`}>{pkg.name}</h3>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-3xl font-black text-neutral-900">₹{pkg.price.toLocaleString("en-IN")}</span>
                      <span className="text-neutral-400 text-sm mb-1">/ visit</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 border border-neutral-100 mb-5">
                      <div className="text-center">
                        <p className="text-xs text-neutral-400">Duration</p>
                        <p className="text-sm font-bold text-neutral-800">{pkg.duration}</p>
                      </div>
                      <div className="w-px h-8 bg-neutral-200" />
                      <div className="text-center">
                        <p className="text-xs text-neutral-400">Coverage</p>
                        <p className="text-sm font-bold text-neutral-800">{pkg.rooms}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-xs text-neutral-700">
                          <CheckCircle2 size={13} className={`${pkg.colorText} flex-shrink-0 mt-0.5`}/>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {canBook ? (
                      <button onClick={handleBookNow}
                        className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black rounded-2xl text-sm
                                   hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl
                                   hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                        <CalendarDays size={16}/>
                        Book This Package
                      </button>
                    ) : (
                      <div className="w-full py-4 rounded-2xl bg-neutral-100 text-neutral-400 text-center text-sm font-semibold">
                        Booking for customers only
                      </div>
                    )}
                    <p className="text-center text-xs text-neutral-400 mt-3 flex items-center justify-center gap-1">
                      <Shield size={11} className="text-emerald-400"/>
                      No advance payment · Pay after service
                    </p>
                  </div>
                </div>

                {/* Quick package switcher */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-4 mb-4">
                  <p className="text-xs font-black text-neutral-400 uppercase tracking-wider mb-3">Switch Package</p>
                  <div className="flex flex-col gap-2">
                    {content.packages.map((p, i) => (
                      <button key={i} onClick={() => setSelectedPkgIdx(i)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all
                          ${selectedPkgIdx===i
                            ? `${p.border} ${p.bg} ${p.colorText}`
                            : "border-neutral-100 text-neutral-500 hover:border-neutral-200"}`}>
                        <span>{p.name}</span>
                        <span className="font-black">₹{p.price.toLocaleString("en-IN")}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Need help */}
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-teal-600"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-teal-900">Need help choosing?</p>
                    <p className="text-xs text-teal-600">Call us: 1800-ADDies</p>
                  </div>
                  <button className="p-2 bg-teal-500 rounded-xl text-white hover:bg-teal-600 transition-colors">
                    <MessageCircle size={14}/>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM CTA ───────────────────────────────────────────────── */}
        {canBook && (
          <div className={`bg-gradient-to-r ${content.heroColor} py-12`}>
            <div className="page-container text-center text-white">
              <p className="text-3xl mb-3">{category.icon}</p>
              <h3 className="text-2xl font-black mb-2">Ready to book {catName} in {cityName}?</h3>
              <p className="text-white/70 text-sm mb-6">Verified pros · Transparent pricing · Pay after service</p>
              <button onClick={handleBookNow}
                className="px-10 py-4 bg-white text-slate-800 font-black rounded-2xl text-sm
                           hover:bg-emerald-50 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center gap-2">
                Book Now → ₹{content.packages[0].price.toLocaleString("en-IN")} onwards
              </button>
              <p className="text-xs text-white/50 mt-4 flex items-center justify-center gap-1">
                <Shield size={12}/> No advance payment needed
              </p>
            </div>
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
