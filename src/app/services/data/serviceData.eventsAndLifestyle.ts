// src/pages/services/data/serviceData.eventsAndLifestyle.ts
// Group: Events & Lifestyle
// Slugs: event-planner, photographer, caterer, birthday-decorator,
//        purohit-pandit, astrologer

import type { ServiceContent } from "./serviceData.homeAndCleaning";

const eventsAndLifestyle: Record<string, ServiceContent> = {

  "event-planner": {
    tagline:   "Stress-free events, every time — birthdays, weddings & corporate events fully managed.",
    heroColor: "from-fuchsia-500 via-pink-600 to-rose-700",
    packages: [
      { name:"Consultation",   price:999,  duration:"2 hrs",   rooms:"Planning",    tag:undefined,
        color:"text-fuchsia-600",bg:"bg-fuchsia-50",border:"border-fuchsia-200",colorText:"text-fuchsia-600",
        features:["2-hr planning session","Venue & vendor suggestions","Budget breakdown","Timeline draft","Checklist provided"] },
      { name:"Day Coordinator", price:4999, duration:"Full day",rooms:"1 event",    tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Full day on-site coordination","Vendor management","Setup & breakdown","Guest handling","Backup planning"] },
      { name:"Full Management", price:14999,duration:"End-to-end",rooms:"1 event",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Complete event management","Venue booking","Catering coordination","Décor & entertainment","Live coverage arrangement","Post-event report"] },
    ],
    whyUs:[
      { icon:"📋", label:"Checklist Driven",   sub:"300-point event checklist used" },
      { icon:"🤝", label:"Vendor Network",     sub:"50+ trusted local vendors & caterers" },
      { icon:"🆘", label:"Backup Plans",       sub:"Contingency ready for every scenario" },
    ],
    whatWeDo:[
      { icon:"🎂", label:"Birthday Parties",   sub:"Kids, adults, milestone birthdays" },
      { icon:"💍", label:"Weddings",           sub:"Mehendi, sangeet, reception" },
      { icon:"🏢", label:"Corporate Events",   sub:"Seminars, launches, team outings" },
      { icon:"🎓", label:"Graduations",        sub:"Farewell & convocation parties" },
      { icon:"🍽️", label:"Kitty & Lunches",   sub:"Ladies parties & get-togethers" },
      { icon:"🎪", label:"Theme Events",       sub:"Costume, retro, destination" },
    ],
    faqs:[
      { q:"Kitni advance mein book karna chahiye?",          a:"Birthday: 1 week. Wedding: 1–2 months. Corporate: 2 weeks minimum." },
      { q:"Kya aap venue bhi book karte ho?",                a:"Full Management package mein venue sourcing & negotiation included hai." },
      { q:"Budget kya hona chahiye minimum?",                a:"Small gathering ₹15,000 se start. Wedding packages ₹50,000+." },
      { q:"Bahar shahar ke events bhi handle karte ho?",     a:"Haan, intercity events ke liye travel + accommodation add-on available." },
    ],
  },

  "photographer": {
    tagline:   "Professional photographers for weddings, events, products & portrait sessions.",
    heroColor: "from-gray-700 via-neutral-800 to-gray-900",
    packages: [
      { name:"2-Hour Shoot",   price:1499, duration:"2 hrs",   rooms:"1 location",  tag:undefined,
        color:"text-gray-600",   bg:"bg-gray-50",   border:"border-gray-200",   colorText:"text-gray-600",
        features:["2 hrs coverage","50+ edited photos","1 location","Digital delivery","WhatsApp preview"] },
      { name:"Half Day",       price:3499, duration:"4 hrs",   rooms:"2 locations", tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["4 hrs coverage","150+ edited photos","2 locations","Same-day preview","USB + Google Drive delivery"] },
      { name:"Full Day",       price:7999, duration:"8 hrs",   rooms:"All day",     tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Full day coverage","400+ edited photos","Unlimited locations","Reels / video clips","Album design option","72-hr delivery"] },
    ],
    whyUs:[
      { icon:"📷", label:"Pro Equipment",      sub:"Sony/Canon full-frame with prime lenses" },
      { icon:"🖼️", label:"Quick Delivery",     sub:"Edited photos in 48–72 hours" },
      { icon:"🎨", label:"Natural Editing",    sub:"True-to-life color grading, no heavy filters" },
    ],
    whatWeDo:[
      { icon:"💍", label:"Wedding",            sub:"Full day coverage" },
      { icon:"👶", label:"Newborn & Kids",     sub:"Milestone photography" },
      { icon:"🎂", label:"Birthday Events",    sub:"Candid & posed" },
      { icon:"📦", label:"Product Shoots",     sub:"E-commerce & catalogue" },
      { icon:"👤", label:"Portrait & Profile", sub:"LinkedIn, matrimony, brand" },
      { icon:"🏢", label:"Corporate",          sub:"Conferences & team photos" },
    ],
    faqs:[
      { q:"Photos kitni der mein milti hain?",               a:"Preview 24 hrs mein. Full edited gallery 48–72 hrs mein." },
      { q:"Kya raw files bhi milti hain?",                   a:"Raw files share nahi karte — only professionally edited finals." },
      { q:"Reels ya video bhi milega?",                      a:"Full Day package mein short reels included hain. Video add-on ₹2,999." },
      { q:"Outdoor shoot ke liye kya chahiye?",              a:"Location, permission (if needed) aap arrange karo — baaki hum sambhaalenge." },
    ],
  },

  "caterer": {
    tagline:   "Home-style or buffet catering for all occasions — fresh, hygienic & delicious.",
    heroColor: "from-orange-500 via-amber-600 to-yellow-600",
    packages: [
      { name:"Home Gathering",  price:149,  duration:"Per plate",rooms:"Min 20 plates",tag:undefined,
        color:"text-orange-600", bg:"bg-orange-50", border:"border-orange-200", colorText:"text-orange-600",
        features:["Veg thali (5 items)","Rice + roti + dal","Salad & papad","Disposable plates","Min 20 plates"] },
      { name:"Party Buffet",   price:249,  duration:"Per plate",rooms:"Min 30 plates",tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["8-item veg buffet","2 sweets included","Live counter option","Staff provided","Setup & cleanup"] },
      { name:"Premium Banquet",price:449,  duration:"Per plate",rooms:"Min 50 plates",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["12-item veg + non-veg","Welcome drink","Dessert station","Dedicated serving team","Custom menu option"] },
    ],
    whyUs:[
      { icon:"🧑‍🍳", label:"Experienced Cooks", sub:"10+ years catering experience" },
      { icon:"🌿", label:"Fresh Ingredients",  sub:"Same-day sourced, no frozen food" },
      { icon:"🛡️", label:"FSSAI Certified",   sub:"Food safety standards followed" },
    ],
    whatWeDo:[
      { icon:"🍛", label:"North Indian",       sub:"Dal makhni, paneer, naan" },
      { icon:"🫓", label:"South Indian",       sub:"Dosa, idli, sambhar, rasam" },
      { icon:"🍜", label:"Chinese",            sub:"Veg hakka, fried rice, manchurian" },
      { icon:"🍰", label:"Desserts",           sub:"Gulab jamun, halwa, ice cream" },
      { icon:"🥗", label:"Salad Bar",          sub:"Custom salad & chaat station" },
      { icon:"🍢", label:"Snacks & Starters",  sub:"Pakoda, rolls, tandoori" },
    ],
    faqs:[
      { q:"Kitne log minimum order chahiye?",                a:"Basic thali ke liye 20 plates. Buffet ke liye 30 plates minimum." },
      { q:"Kya non-veg bhi milega?",                         a:"Haan, Premium Banquet mein non-veg option available hai." },
      { q:"Cooking ghar mein hogi ya bahar se aayegi?",      a:"Fresh cooking at your venue — we bring equipment & ingredients." },
      { q:"Kitne pehle book karna chahiye?",                 a:"2–3 din pehle. Weekend aur festival bookings 1 week advance." },
    ],
  },

  "birthday-decorator": {
    tagline:   "Stunning birthday setups at home — balloons, themes & party décor fully arranged.",
    heroColor: "from-yellow-400 via-orange-500 to-pink-600",
    packages: [
      { name:"Simple Decor",   price:999,  duration:"2 hrs",   rooms:"1 area",      tag:undefined,
        color:"text-yellow-600", bg:"bg-yellow-50", border:"border-yellow-200", colorText:"text-yellow-600",
        features:["50 balloons","Happy Birthday banner","Foil curtain backdrop","Basic colour theme","Setup in 1.5 hrs"] },
      { name:"Theme Package",  price:2499, duration:"3 hrs",   rooms:"2 areas",     tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["100 balloons + arch","Custom theme (Unicorn, Marvel etc)","Table centrepiece","LED lights","Photo booth corner"] },
      { name:"Grand Setup",    price:4999, duration:"4 hrs",   rooms:"Full home",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["200+ balloons","Premium theme décor","Flower arrangement","Name/age cutout","Entrance gate décor","Cleanup included"] },
    ],
    whyUs:[
      { icon:"🎨", label:"50+ Themes",         sub:"Disney, superhero, floral, minimalist & more" },
      { icon:"⚡", label:"Quick Setup",         sub:"Full setup in under 3 hours" },
      { icon:"🧹", label:"Post-Party Cleanup",  sub:"Décor removed & space cleaned after" },
    ],
    whatWeDo:[
      { icon:"🎈", label:"Balloon Décor",      sub:"Arches, columns, bouquets" },
      { icon:"✨", label:"Theme Decoration",   sub:"Custom concept execution" },
      { icon:"💡", label:"LED & Fairy Lights", sub:"Ambient lighting" },
      { icon:"📸", label:"Photo Booth",        sub:"Props & backdrop" },
      { icon:"🌸", label:"Flower Work",        sub:"Fresh & artificial arrangements" },
      { icon:"🎂", label:"Cake Table Setup",   sub:"Centrepiece & display" },
    ],
    faqs:[
      { q:"Kitne pehle book karein?",                        a:"1–2 din pehle. Same day possible before 10 AM (limited slots)." },
      { q:"Kya specific theme request kar sakte hain?",      a:"Haan, any theme accepted. WhatsApp pe reference photo bhejo." },
      { q:"Kitna space chahiye setup ke liye?",              a:"10x10 ft minimum area — drawing room, hall, terrace sab OK hai." },
      { q:"Cleanup karte ho kya?",                           a:"Grand Setup mein cleanup included. Others mein ₹299 add-on." },
    ],
  },

  "purohit-pandit": {
    tagline:   "Learned pandits for all rituals — Puja, Havan, Griha Pravesh & religious ceremonies.",
    heroColor: "from-orange-500 via-red-600 to-orange-700",
    packages: [
      { name:"Simple Puja",    price:499,  duration:"1–2 hrs", rooms:"1 ceremony",  tag:undefined,
        color:"text-orange-600", bg:"bg-orange-50", border:"border-orange-200", colorText:"text-orange-600",
        features:["Satyanarayan Katha","Lakshmi / Ganesh Puja","Samagri list provided","Pandit vishist mantra path","Prasad guidance"] },
      { name:"Havan Package",  price:999,  duration:"2–4 hrs", rooms:"1 ceremony",  tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Havan kund setup","Samagri included","Mantra path + ahutis","Aarti & prasad distribution","Basic flower arrangement"] },
      { name:"Grand Ceremony", price:2999, duration:"Full day",rooms:"1 ceremony",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Griha Pravesh / Wedding ritual","2–3 pandits","Full samagri","Detailed puja vidhi","Muhurat calculation","Post-puja aarti"] },
    ],
    whyUs:[
      { icon:"📜", label:"Vedic Trained",      sub:"Gurukul-educated, shastra-adhering pandits" },
      { icon:"🕐", label:"Muhurat Advisory",   sub:"Auspicious time calculated for ceremonies" },
      { icon:"📦", label:"Samagri Available",  sub:"Puja items arranged on request" },
    ],
    whatWeDo:[
      { icon:"🪔", label:"Satyanarayan Katha", sub:"Monthly & auspicious occasions" },
      { icon:"🔥", label:"Havan & Yagya",      sub:"All types of homam" },
      { icon:"🏠", label:"Griha Pravesh",       sub:"New home entry ritual" },
      { icon:"👶", label:"Namkaran",            sub:"Baby naming ceremony" },
      { icon:"💍", label:"Vivah Puja",          sub:"Wedding rituals & vidhi" },
      { icon:"🌙", label:"Shradh & Pind Daan", sub:"Ancestral rituals" },
    ],
    faqs:[
      { q:"Samagri hum laaein ya aap?",                      a:"Basic samagri list pehle share karte hain. Full samagri service ₹499 extra." },
      { q:"Kya pandit Hindi mein samjhaaenge?",              a:"Haan, poora vidhi Hindi ya local language mein explain kiya jaayega." },
      { q:"Kitne time pehle book karein?",                   a:"Normal puja 1 din pehle. Vivah & Griha Pravesh 1 week advance." },
      { q:"Kya 2 pandits ke saath ceremony hoti hai?",       a:"Grand Ceremony mein 2–3 pandits standard hain." },
    ],
  },

  "astrologer": {
    tagline:   "Vedic astrology, kundali & numerology consultations by experienced astrologers.",
    heroColor: "from-indigo-600 via-violet-700 to-indigo-800",
    packages: [
      { name:"Quick Reading",  price:399,  duration:"30 min",  rooms:"1 person",    tag:undefined,
        color:"text-indigo-600", bg:"bg-indigo-50", border:"border-indigo-200", colorText:"text-indigo-600",
        features:["30-min consultation","Sun, moon & lagna analysis","1 life area focus","Remedies suggested","Chat follow-up"] },
      { name:"Full Kundali",   price:999,  duration:"1.5 hrs", rooms:"1 person",    tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Complete birth chart","Career, marriage, health","Dasha analysis","Gemstone advice","Written report shared"] },
      { name:"Family Plan",    price:2499, duration:"3 hrs",   rooms:"Family",      tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["2 full kundalis","Kundali matching","Detailed compatibility","5-year forecast","Personalized remedies","Priority WhatsApp support"] },
    ],
    whyUs:[
      { icon:"⭐", label:"15+ Years Exp.",     sub:"Practicing astrologers with proven track record" },
      { icon:"📜", label:"Written Reports",    sub:"Detailed PDF report after every session" },
      { icon:"🔒", label:"Confidential",       sub:"All consultations strictly private" },
    ],
    whatWeDo:[
      { icon:"📅", label:"Kundali Reading",   sub:"Birth chart analysis" },
      { icon:"💍", label:"Kundali Matching",  sub:"Marriage compatibility" },
      { icon:"💼", label:"Career Guidance",   sub:"Best path & timing" },
      { icon:"🔢", label:"Numerology",        sub:"Name & number analysis" },
      { icon:"💎", label:"Gemstone Advice",   sub:"Rashi ratna recommendation" },
      { icon:"🌙", label:"Vastu Tips",        sub:"Home & office directions" },
    ],
    faqs:[
      { q:"Exact birth time zaroori hai?",                   a:"Haan, sahi kundali ke liye exact time, date & place of birth chahiye." },
      { q:"Kya phone ya video call pe bhi hoti hai?",        a:"Haan, in-person aur video/phone dono available hain." },
      { q:"Gemstone recommendation reliable hai?",           a:"Haan, basis kundali planetary positions pe suggest karte hain — force nahi." },
      { q:"Remedies kya hote hain?",                         a:"Mantra, daan, upvaas, gemstone — sab simple aur doable hote hain." },
    ],
  },

};

export default eventsAndLifestyle;
