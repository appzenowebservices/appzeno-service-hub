// src/pages/services/data/serviceData.beautyAndWellness.ts
// Group: Beauty & Wellness
// Slugs: beauty-services, haircut-styling, makeup-artist,
//        massage-at-home, yoga-trainer, fitness-trainer

import type { ServiceContent } from "./serviceData.homeAndCleaning";

const beautyAndWellness: Record<string, ServiceContent> = {

  "beauty-services": {
    tagline:   "Salon-quality beauty treatments at your doorstep — safe, hygienic & relaxing.",
    heroColor: "from-rose-500 via-pink-600 to-fuchsia-700",
    packages: [
      { name:"Basic Glow",    price:499,  duration:"1.5 hrs", rooms:"1 person",    tag:undefined,
        color:"text-rose-600",   bg:"bg-rose-50",   border:"border-rose-200",   colorText:"text-rose-600",
        features:["Facial (basic)","Threading (brows + upper lip)","Manicure","Hand massage"] },
      { name:"Full Pamper",   price:999,  duration:"3 hrs",   rooms:"1 person",    tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Everything in Basic","Full waxing (arms + legs)","Pedicure","Foot massage","Face pack"] },
      { name:"Bridal Ready",  price:2499, duration:"5 hrs",   rooms:"1 person",    tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Advanced facial","Full body waxing","Manicure + Pedicure","Eyebrow shaping","Head massage","Skin prep"] },
    ],
    whyUs:[
      { icon:"🧴", label:"Hygienic Kit",       sub:"Disposable tools, sealed products used" },
      { icon:"👩‍🎓", label:"Certified Beauticians", sub:"Government-certified beauty professionals" },
      { icon:"🏠", label:"Comfort of Home",    sub:"No waiting, no travel, total privacy" },
    ],
    whatWeDo:[
      { icon:"✨", label:"Facial",          sub:"Deep cleanse & glow" },
      { icon:"🪒", label:"Waxing",          sub:"Full body & face" },
      { icon:"💅", label:"Manicure",        sub:"Nails, cuticles, hand care" },
      { icon:"🦶", label:"Pedicure",        sub:"Feet, heels, nails" },
      { icon:"👁️", label:"Threading",       sub:"Brows, upper lip, chin" },
      { icon:"💆", label:"Head Massage",    sub:"Relaxing oil massage" },
    ],
    faqs:[
      { q:"Kya products safe hain sensitive skin ke liye?",  a:"Haan, we use dermatologist-approved products. Allergy test on request." },
      { q:"Kitna time pehle book karna chahiye?",            a:"Same day booking available before 3 PM. Pre-booking recommended." },
      { q:"Kya male beauticians bhi aate hain?",             a:"Nahi — we only send female beauticians for all women's services." },
      { q:"Products aap log laate ho?",                      a:"Haan, saare products aur tools hamari taraf se hote hain." },
    ],
  },

  "haircut-styling": {
    tagline:   "Professional haircuts & styling by trained stylists — right at your home.",
    heroColor: "from-violet-500 via-purple-600 to-indigo-700",
    packages: [
      { name:"Basic Cut",     price:199,  duration:"45 min",  rooms:"1 person",    tag:undefined,
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Haircut (men or women)","Blow dry basic","Comb styling"] },
      { name:"Cut & Style",   price:499,  duration:"1.5 hrs", rooms:"1 person",    tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Haircut + wash","Professional blow dry","Iron or tong styling","Head massage","Hair serum"] },
      { name:"Salon Package",  price:1499, duration:"3 hrs",   rooms:"1 person",   tag:"Best Value",
        color:"text-rose-600",   bg:"bg-rose-50",   border:"border-rose-200",   colorText:"text-rose-600",
        features:["Full haircut & style","Deep conditioning","Hair spa","Scalp treatment","Professional finish"] },
    ],
    whyUs:[
      { icon:"✂️", label:"Trained Stylists",   sub:"Lakme Academy & VLCC certified" },
      { icon:"💧", label:"Quality Products",   sub:"L'Oreal, Streax, Wella used" },
      { icon:"🏠", label:"No Salon Wait",      sub:"Book your slot, we come on time" },
    ],
    whatWeDo:[
      { icon:"✂️", label:"Haircut",            sub:"Men, women, kids" },
      { icon:"💨", label:"Blow Dry",           sub:"Straight & voluminous" },
      { icon:"🌀", label:"Curling / Ironing",  sub:"All hair types" },
      { icon:"💆", label:"Hair Spa",           sub:"Deep nourishment" },
      { icon:"🧴", label:"Conditioning",       sub:"Damage repair & shine" },
      { icon:"✨", label:"Scalp Treatment",    sub:"Dandruff & hair fall" },
    ],
    faqs:[
      { q:"Kya kids ke bhi haircut milti hai?",               a:"Haan, children's haircut available at ₹149 add-on." },
      { q:"Kya stylists apna equipment laate hain?",          a:"Haan, professional tools, scissors & dryer saath laate hain." },
      { q:"Kya hair color service bhi milti hai?",            a:"Color service abhi add-on basis pe available hai — booking pe confirm karo." },
      { q:"Kya male customers ke liye bhi hai?",              a:"Haan, men's haircut & grooming package available hai." },
    ],
  },

  "makeup-artist": {
    tagline:   "Bridal, party & casual makeup by certified artists — on your schedule, at your venue.",
    heroColor: "from-pink-500 via-rose-600 to-pink-700",
    packages: [
      { name:"Casual Makeup",  price:999,  duration:"1.5 hrs", rooms:"1 person",   tag:undefined,
        color:"text-pink-600",   bg:"bg-pink-50",   border:"border-pink-200",   colorText:"text-pink-600",
        features:["Day or evening look","Foundation + contouring","Eye makeup","Lip color","Setting spray"] },
      { name:"Party Makeup",   price:1999, duration:"2.5 hrs", rooms:"1 person",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["HD or airbrush option","Full eye glam","Brows styling","Lashes (included)","Long-lasting finish","Pre-makeup skincare"] },
      { name:"Bridal Makeup",  price:4999, duration:"4 hrs",   rooms:"1 person",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Airbrush bridal makeup","HD finish","False lashes + lining","Full face prep","Dupatta draping","Touch-up kit included"] },
    ],
    whyUs:[
      { icon:"🎨", label:"Premium Products",   sub:"MAC, Huda Beauty, Kryolan, Forever52" },
      { icon:"📷", label:"Camera Ready",       sub:"HD finish for photos & videos" },
      { icon:"👰", label:"Bridal Specialists", sub:"100+ bridal looks experience" },
    ],
    whatWeDo:[
      { icon:"💄", label:"Bridal Makeup",      sub:"Full traditional & modern" },
      { icon:"🎉", label:"Party Makeup",       sub:"Glam & evening looks" },
      { icon:"📸", label:"Photoshoot Makeup",  sub:"Editorial & product shoots" },
      { icon:"👁️", label:"Eye Makeup",        sub:"Smokey, cut-crease, natural" },
      { icon:"✨", label:"Airbrush",           sub:"Flawless HD finish" },
      { icon:"💅", label:"Nail Art",           sub:"Gel & regular nail work" },
    ],
    faqs:[
      { q:"Kitne pehle booking karni chahiye?",               a:"Weekends ke liye 2-3 din pehle book karo. Bridal ke liye 1 week." },
      { q:"Kya trial makeup milta hai?",                      a:"Haan, bridal package mein trial session included hai." },
      { q:"Products hygienic hain?",                          a:"Haan, saare brushes sanitize karte hain, sealing products use karte hain." },
      { q:"Kya hairdressing bhi milti hai saath?",            a:"Haan, hair styling add-on ₹499 mein available hai." },
    ],
  },

  "massage-at-home": {
    tagline:   "Relaxation, therapy & deep tissue massage by certified therapists — at your home.",
    heroColor: "from-teal-500 via-emerald-600 to-teal-700",
    packages: [
      { name:"Relaxation",    price:799,  duration:"60 min",  rooms:"1 person",    tag:undefined,
        color:"text-teal-600",   bg:"bg-teal-50",   border:"border-teal-200",   colorText:"text-teal-600",
        features:["Swedish relaxation massage","Back + shoulders + neck","Aromatherapy oil","Stress relief focus"] },
      { name:"Deep Therapy",  price:1299, duration:"90 min",  rooms:"1 person",    tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Deep tissue technique","Full body (back to feet)","Hot stone option","Muscle knot release","Post-session tips"] },
      { name:"Wellness Pack", price:2499, duration:"2 hrs",   rooms:"1 person",    tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Full body deep massage","Head & scalp massage","Foot reflexology","Hot compress","Monthly plan option"] },
    ],
    whyUs:[
      { icon:"🎓", label:"Certified Therapists", sub:"VLCC & INIFD diploma holders" },
      { icon:"🌿", label:"Organic Oils",         sub:"Cold-pressed, fragrance-safe oils" },
      { icon:"🔒", label:"Same Gender Only",     sub:"Female therapist for women, male for men" },
    ],
    whatWeDo:[
      { icon:"💆", label:"Full Body",         sub:"Back, arms, legs, feet" },
      { icon:"🧠", label:"Head Massage",      sub:"Scalp & neck relief" },
      { icon:"🦶", label:"Foot Reflexology",  sub:"Pressure point therapy" },
      { icon:"🔥", label:"Hot Stone",         sub:"Deep muscle warmth" },
      { icon:"🌸", label:"Aromatherapy",      sub:"Essential oil blends" },
      { icon:"🤰", label:"Prenatal",          sub:"Safe pregnancy massage" },
    ],
    faqs:[
      { q:"Kya massage table laate hain?",                   a:"Haan, portable professional massage bed saath laate hain." },
      { q:"Pregnant women ke liye safe hai?",                a:"Haan, trained prenatal massage available — doctor advice preferred." },
      { q:"Same gender therapist guarantee hai?",            a:"Haan, 100% same gender therapists — no exceptions." },
      { q:"Kya couple massage bhi hoti hai?",                a:"Haan, couple session ₹1,999 add-on mein available hai." },
    ],
  },

  "yoga-trainer": {
    tagline:   "Personal yoga sessions at home — flexibility, stress relief & mindfulness, your way.",
    heroColor: "from-amber-400 via-orange-500 to-yellow-600",
    packages: [
      { name:"Single Session", price:399,  duration:"1 hr",   rooms:"1 person",    tag:undefined,
        color:"text-amber-600",  bg:"bg-amber-50",  border:"border-amber-200",  colorText:"text-amber-600",
        features:["1 hr session","Basic asanas","Breathing exercises","Cool-down stretch"] },
      { name:"Monthly Plan",   price:2999, duration:"Monthly",rooms:"Daily/Alt",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["12 sessions/month","Personalized routine","Pranayama & meditation","Diet tips","Progress tracking"] },
      { name:"Therapy Yoga",   price:1499, duration:"Per session",rooms:"1 person",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Medical/therapeutic yoga","Back pain, anxiety, PCOD focus","Custom asana sequence","Specialist trainer","Posture correction"] },
    ],
    whyUs:[
      { icon:"🎓", label:"Certified Trainers",  sub:"YCB & Patanjali certified yoga instructors" },
      { icon:"🧘", label:"Personalized Plan",   sub:"Routine designed for your body & goals" },
      { icon:"🏠", label:"No Gym Needed",       sub:"Just a mat — we bring the rest" },
    ],
    whatWeDo:[
      { icon:"🧘", label:"Hatha Yoga",         sub:"Traditional asana practice" },
      { icon:"🌬️", label:"Pranayama",         sub:"Breathing techniques" },
      { icon:"🧠", label:"Meditation",         sub:"Mindfulness & stress relief" },
      { icon:"💪", label:"Power Yoga",         sub:"Strength & stamina" },
      { icon:"🤸", label:"Flexibility",        sub:"Stretch & posture work" },
      { icon:"🩺", label:"Therapy Yoga",       sub:"Back pain, PCOD, anxiety" },
    ],
    faqs:[
      { q:"Beginners ke liye suitable hai?",                 a:"Haan, session beginner se advanced tak customize karte hain." },
      { q:"Kya mat provide karte ho?",                       a:"Haan, yoga mat, blocks aur strap saath laate hain." },
      { q:"Online sessions bhi milte hain?",                 a:"Haan, video call sessions available at ₹299/session." },
      { q:"Senior citizens ke liye appropriate hai?",        a:"Haan, gentle yoga for seniors available — low impact, joint-friendly." },
    ],
  },

  "fitness-trainer": {
    tagline:   "Certified personal trainers at home — weight loss, muscle gain & custom fitness plans.",
    heroColor: "from-red-500 via-orange-600 to-red-700",
    packages: [
      { name:"Single Session", price:499,  duration:"1 hr",   rooms:"1 person",    tag:undefined,
        color:"text-red-600",    bg:"bg-red-50",    border:"border-red-200",    colorText:"text-red-600",
        features:["1 hr workout","Fitness assessment","Basic routine","Form correction"] },
      { name:"Monthly Plan",   price:3499, duration:"Monthly",rooms:"Daily/Alt",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["12–20 sessions","Custom workout plan","Diet chart","Weight & inch tracking","WhatsApp check-ins"] },
      { name:"Transformation",  price:7999, duration:"3 months",rooms:"1 person",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["3-month program","Full nutrition plan","Body composition analysis","Before/after tracking","Dedicated trainer"] },
    ],
    whyUs:[
      { icon:"🏅", label:"Certified Trainers",  sub:"ISSA, ACE & Gold's Gym certified" },
      { icon:"📊", label:"Progress Tracking",   sub:"Weekly measurements & photo records" },
      { icon:"🥗", label:"Diet Guidance",       sub:"Macro-based meal plan included" },
    ],
    whatWeDo:[
      { icon:"🏋️", label:"Strength Training", sub:"Weights & resistance" },
      { icon:"🏃", label:"Cardio",             sub:"HIIT, circuit, endurance" },
      { icon:"🤸", label:"Functional Fitness", sub:"Mobility & daily movement" },
      { icon:"⚖️", label:"Weight Loss",        sub:"Fat burn programs" },
      { icon:"💪", label:"Muscle Building",    sub:"Hypertrophy plans" },
      { icon:"🥗", label:"Nutrition",          sub:"Diet & supplement advice" },
    ],
    faqs:[
      { q:"Equipment chahiye hoga?",                         a:"Basic bodyweight training ke liye kuch nahi chahiye. Dumbbells optional." },
      { q:"Weight loss ke liye kitne sessions chahiye?",     a:"Visible results 4–6 weeks mein — consistent sessions zaroori hain." },
      { q:"Kya female trainers bhi available hain?",         a:"Haan, certified female trainers available — request at booking." },
      { q:"Post-injury fitness bhi possible hai?",           a:"Haan, rehab fitness programs available — doctor clearance required." },
    ],
  },

};

export default beautyAndWellness;
