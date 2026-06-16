// src/pages/services/data/serviceData.professional.ts
// Group: Professional
// Slugs: property-lawyer, ca-tax-filing, loan-consultant,
//        travel-agent, passport-agent, real-estate-agent, courier-services

import type { ServiceContent } from "./serviceData.homeAndCleaning";

const professional: Record<string, ServiceContent> = {

  "property-lawyer": {
    tagline:   "Trusted property lawyers at home — land registration, disputes & legal documentation.",
    heroColor: "from-slate-700 via-gray-800 to-slate-900",
    packages: [
      { name:"Consultation",   price:999,  duration:"1 hr",    rooms:"1 session",   tag:undefined,
        color:"text-slate-600",  bg:"bg-slate-50",  border:"border-slate-200",  colorText:"text-slate-600",
        features:["1-hr legal consultation","Case assessment","Document review (up to 5)","Legal opinion","Next steps guidance"] },
      { name:"Documentation",  price:2999, duration:"3–5 days",rooms:"1 matter",    tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Sale deed / rent agreement","Power of attorney","Will drafting","Notarization assistance","Stamp duty guidance"] },
      { name:"Full Legal Support",price:7999,duration:"End-to-end",rooms:"1 matter",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Complete case handling","Registry & mutation","Court representation","Title search","6-month post-support"] },
    ],
    whyUs:[
      { icon:"⚖️", label:"Bar Council Verified", sub:"Enrolled advocates with valid BCI license" },
      { icon:"🔒", label:"Confidential",         sub:"All case details strictly private" },
      { icon:"📜", label:"Document Ready",       sub:"Drafts delivered in 48 hrs" },
    ],
    whatWeDo:[
      { icon:"🏠", label:"Property Purchase",    sub:"Agreement, registry, title" },
      { icon:"📄", label:"Rent Agreement",       sub:"Drafting & notarization" },
      { icon:"⚖️", label:"Dispute Resolution",  sub:"Neighbour, partition, possession" },
      { icon:"📋", label:"Will & Succession",    sub:"Will drafting & probate" },
      { icon:"🏛️", label:"Court Filing",        sub:"Civil & revenue court matters" },
      { icon:"🔍", label:"Title Search",         sub:"Clear title verification" },
    ],
    faqs:[
      { q:"Kya home visit possible hai?",                    a:"Haan, consultation ghar pe ya video call pe dono available hai." },
      { q:"Registry ke liye kya documents chahiye?",         a:"Booking ke baad complete checklist share ki jaati hai." },
      { q:"Kya court mein represent bhi karte ho?",          a:"Haan, Full Legal Support package mein court representation included hai." },
      { q:"Fees upfront deni hogi?",                         a:"50% advance, baaki kaam complete hone pe — full transparency." },
    ],
  },

  "ca-tax-filing": {
    tagline:   "Qualified CAs at your service — ITR, GST, audit & all tax filings done right.",
    heroColor: "from-blue-700 via-indigo-700 to-blue-800",
    packages: [
      { name:"ITR Basic",      price:499,  duration:"2–3 days",rooms:"1 person",    tag:undefined,
        color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200",   colorText:"text-blue-600",
        features:["Salaried ITR-1 / ITR-2","Form 16 processing","Tax calculation","E-filing & acknowledgement","Refund tracking"] },
      { name:"Business ITR",   price:1499, duration:"4–5 days",rooms:"1 business",  tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["ITR-3 / ITR-4","P&L & balance sheet","Business income filing","TDS reconciliation","Tax saving advice"] },
      { name:"GST + Compliance",price:2999,duration:"Monthly", rooms:"1 business",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Monthly GSTR-1 & 3B","Annual GST return","TDS return filing","MCA / ROC compliance","Dedicated CA assigned"] },
    ],
    whyUs:[
      { icon:"🎓", label:"ICAI Qualified CAs",  sub:"Chartered accountants with valid ICAI membership" },
      { icon:"🔒", label:"Data Secure",         sub:"All financial data is encrypted & confidential" },
      { icon:"📱", label:"Digital First",       sub:"E-filing, WhatsApp updates, digital docs" },
    ],
    whatWeDo:[
      { icon:"📊", label:"ITR Filing",          sub:"All ITR forms, salaried & business" },
      { icon:"🧾", label:"GST Filing",          sub:"GSTR-1, 3B, annual return" },
      { icon:"📋", label:"TDS Returns",         sub:"Quarterly TDS filing" },
      { icon:"🏢", label:"Company Compliance",  sub:"MCA, ROC, annual filing" },
      { icon:"🔍", label:"Tax Audit",           sub:"Section 44AB audit" },
      { icon:"💡", label:"Tax Planning",        sub:"Save tax legally" },
    ],
    faqs:[
      { q:"ITR file karne ki last date kya hai?",            a:"Individual: 31 July. Business (audit): 31 October. Dates change ho sakti hain." },
      { q:"Kya documents chahiye ITR ke liye?",              a:"Form 16, bank statements, investment proofs — list share ki jaayegi." },
      { q:"Agar notice aaya Income Tax se?",                 a:"Haan, notice handling service available hai — separately quote karenge." },
      { q:"New tax regime ya old — kaunsa better hai?",      a:"CA aapki income analysis karke best option suggest karega." },
    ],
  },

  "loan-consultant": {
    tagline:   "Get the best loan deals — home, personal, business & education loans simplified.",
    heroColor: "from-emerald-600 via-teal-700 to-emerald-800",
    packages: [
      { name:"Free Consultation",price:0,  duration:"30 min",  rooms:"1 session",   tag:undefined,
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Eligibility check","Bank comparison","EMI calculation","CIBIL score review","Best rate identification"] },
      { name:"Application Support",price:299,duration:"3–5 days",rooms:"1 loan",   tag:"⭐ Most Popular",
        color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200",   colorText:"text-blue-600",
        features:["Document preparation","Bank application filing","Follow-up with bank","Status tracking","Disbursement support"] },
      { name:"End-to-End",       price:999, duration:"Till disbursal",rooms:"1 loan",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Best rate negotiation","All bank options","Legal & technical support","Loan against property","Post-disbursal service"] },
    ],
    whyUs:[
      { icon:"🏦", label:"20+ Bank Network",   sub:"SBI, HDFC, ICICI, Axis & more" },
      { icon:"💰", label:"Best Rate Promise",  sub:"We negotiate for lowest rate available" },
      { icon:"🆓", label:"Free Consultation",  sub:"No charge for initial eligibility check" },
    ],
    whatWeDo:[
      { icon:"🏠", label:"Home Loan",          sub:"Purchase, balance transfer, top-up" },
      { icon:"💼", label:"Business Loan",      sub:"MSME, working capital, CC/OD" },
      { icon:"👤", label:"Personal Loan",      sub:"Quick approval, minimal docs" },
      { icon:"🎓", label:"Education Loan",     sub:"Domestic & abroad studies" },
      { icon:"🚗", label:"Vehicle Loan",       sub:"Car & two-wheeler finance" },
      { icon:"🏗️", label:"Loan Against Property",sub:"Commercial & residential" },
    ],
    faqs:[
      { q:"CIBIL score kitna hona chahiye?",                 a:"750+ best hai. 650–749 pe kuch banks dete hain. Below 650 pe mushkil." },
      { q:"Home loan ke liye minimum salary?",               a:"₹15,000/month minimum for most banks. Self-employed ke liye ITR basis." },
      { q:"Processing fee alag se lagti hai?",               a:"Bank ki processing fee alag hoti hai — hum advance mein inform karte hain." },
      { q:"Loan rejection ke baad apply kar sakte hain?",    a:"Haan, 3–6 months baad ya CIBIL improve karne ke baad try kar sakte hain." },
    ],
  },

  "travel-agent": {
    tagline:   "Flights, trains, hotels & holiday packages — planned and booked stress-free at home.",
    heroColor: "from-sky-500 via-cyan-600 to-sky-700",
    packages: [
      { name:"Ticket Booking",  price:199,  duration:"Same day",rooms:"1 booking",  tag:undefined,
        color:"text-sky-600",    bg:"bg-sky-50",    border:"border-sky-200",    colorText:"text-sky-600",
        features:["Flight or train ticket","Best fare search","All airlines & classes","E-ticket delivery","Rescheduling support"] },
      { name:"Holiday Package", price:999,  duration:"2–3 days",rooms:"1 trip",     tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Flights + hotel","Itinerary planning","Cab transfers","Tour guide option","Travel insurance advice"] },
      { name:"Premium Travel",  price:2499, duration:"Full plan",rooms:"Family/Group",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["International packages","Visa guidance","Forex assistance","Luxury hotel booking","Dedicated travel manager","24/7 trip support"] },
    ],
    whyUs:[
      { icon:"✈️", label:"IATA Registered",    sub:"Authorized travel agency, genuine tickets" },
      { icon:"💰", label:"Best Fare Guarantee",sub:"Compare 50+ options before booking" },
      { icon:"📞", label:"24/7 Trip Support",  sub:"We're available even mid-journey" },
    ],
    whatWeDo:[
      { icon:"✈️", label:"Flight Booking",     sub:"Domestic & international" },
      { icon:"🚂", label:"Train Tickets",      sub:"Tatkal & advance booking" },
      { icon:"🏨", label:"Hotel Booking",      sub:"Budget to luxury" },
      { icon:"🚌", label:"Bus & Cab",          sub:"Intercity & airport transfers" },
      { icon:"🌍", label:"Holiday Packages",   sub:"Domestic & international tours" },
      { icon:"🛂", label:"Visa Assistance",    sub:"Documentation & submission" },
    ],
    faqs:[
      { q:"Kya Tatkal ticket milti hai?",                    a:"Haan, Tatkal & premium Tatkal dono available hain IRCTC se." },
      { q:"International packages mein visa included hai?",  a:"Visa guidance included hai. Visa fees alag hoti hain — government charge." },
      { q:"Ticket cancel hone par refund kab milega?",       a:"Airline/railway policy ke hisaab se — hum process track karte hain." },
      { q:"Group booking ke liye discount milta hai?",       a:"Haan, 10+ pax ke liye special group rates negotiate karte hain." },
    ],
  },

  "passport-agent": {
    tagline:   "New passport, renewal or Tatkal — guided application & documentation at home.",
    heroColor: "from-indigo-600 via-blue-700 to-indigo-800",
    packages: [
      { name:"Document Check",  price:199,  duration:"1 hr",    rooms:"1 person",   tag:undefined,
        color:"text-indigo-600", bg:"bg-indigo-50", border:"border-indigo-200", colorText:"text-indigo-600",
        features:["Document verification","Checklist guidance","Form 1 filling help","Appointment slot advice","Error-free review"] },
      { name:"Full Assistance", price:499,  duration:"2–3 days",rooms:"1 person",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Online form filling","Document preparation","Seva Kendra slot booking","Application submission","Status tracking"] },
      { name:"Tatkal Express",  price:799,  duration:"Priority", rooms:"1 person",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Tatkal appointment booking","Priority slot access","Same-day document prep","Police verification guidance","Delivery tracking"] },
    ],
    whyUs:[
      { icon:"✅", label:"100% Govt Process",  sub:"Only official Passport Seva portal used" },
      { icon:"📋", label:"Zero Rejection",     sub:"Document verified before submission" },
      { icon:"⚡", label:"Fast Appointments",  sub:"Earliest available slot secured for you" },
    ],
    whatWeDo:[
      { icon:"🆕", label:"New Passport",       sub:"First-time applicants" },
      { icon:"🔄", label:"Renewal",            sub:"Expired or expiring passport" },
      { icon:"⚡", label:"Tatkal",             sub:"Urgent 1–3 day processing" },
      { icon:"👶", label:"Minor Passport",     sub:"Children under 18" },
      { icon:"📋", label:"ECR / ECNR",        sub:"Category change guidance" },
      { icon:"🛂", label:"Police Verification",sub:"Process guidance & follow-up" },
    ],
    faqs:[
      { q:"Passport kitne din mein milta hai?",              a:"Normal: 30–45 days. Tatkal: 1–3 working days." },
      { q:"Renewal ke liye kya documents chahiye?",          a:"Old passport, Aadhar, address proof — booking ke baad full list milegi." },
      { q:"Kya aap Seva Kendra pe saath aate ho?",           a:"Document prep karte hain, appointment guide karte hain. Saath nahi aate." },
      { q:"Minor passport ke liye parents ka kya role hai?", a:"Both parents' consent aur documents mandatory hain — guide karenge." },
    ],
  },

  "real-estate-agent": {
    tagline:   "Trusted local agents for buying, selling & renting property — zero stress, best deals.",
    heroColor: "from-stone-600 via-amber-700 to-stone-700",
    packages: [
      { name:"Property Search",  price:499,  duration:"1 week",  rooms:"1 req.",    tag:undefined,
        color:"text-stone-600",  bg:"bg-stone-50",  border:"border-stone-200",  colorText:"text-stone-600",
        features:["Requirement analysis","Shortlist 5–10 properties","Site visits arranged","Budget matching","Area guidance"] },
      { name:"Buy / Sell",       price:0,    duration:"Till closure",rooms:"1 deal", tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Full buyer-seller matching","Price negotiation","Legal document check","Registry support","1–2% commission on deal"] },
      { name:"Rental Assist",    price:999,  duration:"Till move-in",rooms:"1 unit", tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Tenant / landlord matching","Rent agreement drafting","Police verification help","Security deposit guidance","Move-in coordination"] },
    ],
    whyUs:[
      { icon:"📍", label:"Hyper-Local",        sub:"Deep knowledge of your specific area" },
      { icon:"🤝", label:"Trusted Network",    sub:"Verified buyers, sellers & landlords" },
      { icon:"📋", label:"Paperwork Support",  sub:"Agreement to registry — fully guided" },
    ],
    whatWeDo:[
      { icon:"🏠", label:"Residential",        sub:"Flats, villas, plots, builder floors" },
      { icon:"🏢", label:"Commercial",         sub:"Shops, offices, warehouses" },
      { icon:"🔑", label:"Rental",             sub:"Long term & short term" },
      { icon:"📈", label:"Investment Advice",  sub:"Best areas & ROI guidance" },
      { icon:"🏗️", label:"Under Construction",sub:"New projects & pre-launch" },
      { icon:"💰", label:"Price Negotiation",  sub:"Get best deal possible" },
    ],
    faqs:[
      { q:"Agent ki fees kya hoti hai?",                     a:"Buy/Sell: 1–2% of deal value. Rental: 1 month rent typically." },
      { q:"Kya unregistered property bhi dihate ho?",        a:"Nahi — sirf legal, clear title properties ke saath deal karte hain." },
      { q:"Site visit ke liye charge lagta hai?",            a:"Nahi, site visits bilkul free hain." },
      { q:"NRI ke liye property kharidna manage karte ho?",  a:"Haan, NRI property purchase & POA service available hai." },
    ],
  },

  "courier-services": {
    tagline:   "Same-day & scheduled parcel pickup and delivery — fast, tracked & reliable.",
    heroColor: "from-yellow-500 via-orange-500 to-yellow-600",
    packages: [
      { name:"Local Delivery",  price:49,   duration:"Same day", rooms:"Up to 1 kg",  tag:undefined,
        color:"text-yellow-600", bg:"bg-yellow-50", border:"border-yellow-200", colorText:"text-yellow-600",
        features:["Within city","Up to 1 kg","Pickup from home","Live tracking link","Delivery by 8 PM"] },
      { name:"Express Pack",    price:99,   duration:"2–4 hrs",  rooms:"Up to 5 kg",  tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Priority pickup","Up to 5 kg","Fragile handling option","Digital POD","WhatsApp update on delivery"] },
      { name:"Bulk / Business", price:299,  duration:"Same day", rooms:"Up to 20 kg", tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Up to 20 kg","Multi-location drop","Invoice generation","Monthly billing option","Dedicated pickup slot"] },
    ],
    whyUs:[
      { icon:"📍", label:"Live Tracking",      sub:"Real-time parcel location shared" },
      { icon:"🔒", label:"Safe Handling",      sub:"Tamper-proof packaging on request" },
      { icon:"⚡", label:"Same Day Pickup",    sub:"Book before 2 PM for same-day pickup" },
    ],
    whatWeDo:[
      { icon:"📦", label:"Parcel Delivery",    sub:"Documents & packages" },
      { icon:"🛍️", label:"E-commerce Returns", sub:"Easy return pickup" },
      { icon:"💊", label:"Medicine Delivery",  sub:"Pharmacy to home" },
      { icon:"🍱", label:"Food & Tiffin",      sub:"Scheduled meal delivery" },
      { icon:"🏢", label:"Office Courier",     sub:"Intra-city business docs" },
      { icon:"🌍", label:"Intercity",          sub:"Next day & 2-day delivery" },
    ],
    faqs:[
      { q:"Kya same day delivery guarantee hai?",            a:"Haan, book before 12 PM for same-day. After 12 PM: next morning." },
      { q:"Fragile items safely deliver ho jayenge?",        a:"Haan, fragile handling add-on mein bubble wrap & special care included." },
      { q:"Agar delivery miss ho jaye?",                     a:"3 attempts karte hain. Fir nearest pickup point mein rakh dete hain." },
      { q:"Kya COD option hai?",                             a:"Haan, cash on delivery for select services — booking pe confirm karo." },
    ],
  },

};

export default professional;
