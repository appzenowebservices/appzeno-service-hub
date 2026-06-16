// src/pages/services/data/serviceData.homeStaff.ts
// Group: Home Staff
// Slugs: cook-on-demand, baby-sitter, elder-care

import type { ServiceContent } from "./serviceData.homeAndCleaning";

const homeStaff: Record<string, ServiceContent> = {

  "cook-on-demand": {
    tagline:   "Hire a skilled home cook on-demand — daily meals, tiffin service & special occasions.",
    heroColor: "from-orange-500 via-red-500 to-orange-600",
    packages: [
      { name:"Part-Time Cook",  price:499,  duration:"3–4 hrs", rooms:"1 meal shift", tag:undefined,
        color:"text-orange-600", bg:"bg-orange-50", border:"border-orange-200", colorText:"text-orange-600",
        features:["Breakfast + lunch or dinner","Up to 4 members","Grocery list shared","Utensils & cleanup","Your recipe or theirs"] },
      { name:"Full-Time Cook",  price:799,  duration:"6–8 hrs", rooms:"All 3 meals",  tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["All 3 meals","Up to 6 members","Dabba/tiffin option","Kitchen cleanup","Weekly menu planning"] },
      { name:"Monthly Hire",   price:9999, duration:"Monthly", rooms:"Daily service", tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["30-day engagement","Background verified","Cook of your preference","Leave replacement","Custom diet support"] },
    ],
    whyUs:[
      { icon:"✅", label:"Background Verified",sub:"Police verification & ID checked" },
      { icon:"🍽️", label:"Multi-Cuisine",      sub:"North Indian, South Indian, Chinese, Continental" },
      { icon:"🔄", label:"Replacement Ready",  sub:"Instant replacement if cook is absent" },
    ],
    whatWeDo:[
      { icon:"🍛", label:"Daily Meals",        sub:"Roti, sabzi, dal, rice" },
      { icon:"🥣", label:"Breakfast",          sub:"Paratha, poha, idli, eggs" },
      { icon:"🧆", label:"Snacks & Tiffin",    sub:"Lunchbox & evening snacks" },
      { icon:"🎂", label:"Special Occasions",  sub:"Parties & family functions" },
      { icon:"🥗", label:"Diet Cooking",       sub:"Diabetic, keto, jain, vegan" },
      { icon:"🧹", label:"Kitchen Cleanup",    sub:"Vessels & platform clean" },
    ],
    faqs:[
      { q:"Kya cook roz aayega?",                            a:"Haan, 6 days/week by default. 7th day ke liye replacement available." },
      { q:"Grocery kaun kharidega?",                         a:"Aap kharido ya cook ke saath list share karo — cash advance basis pe." },
      { q:"Kya cook ki cooking pehle taste kar sakte hain?", a:"Haan, trial session ₹199 mein book kar sakte ho." },
      { q:"Agar cook leave par gaya toh?",                   a:"Same day replacement guarantee — koi working day miss nahi hoga." },
    ],
  },

  "baby-sitter": {
    tagline:   "Trusted, verified babysitters & nannies for your child's safety and happiness.",
    heroColor: "from-pink-400 via-rose-500 to-pink-600",
    packages: [
      { name:"Half Day",       price:399,  duration:"4 hrs",   rooms:"1 child",     tag:undefined,
        color:"text-pink-600",   bg:"bg-pink-50",   border:"border-pink-200",   colorText:"text-pink-600",
        features:["4-hr supervised care","Feeding & diaper change","Age-appropriate play","Safe indoor activities","Updates every 2 hrs"] },
      { name:"Full Day",       price:699,  duration:"8 hrs",   rooms:"1 child",     tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["8-hr full day care","Meals & nap support","Homework help (2+ yrs)","Outdoor play if needed","Parent WhatsApp updates"] },
      { name:"Monthly Nanny",  price:8999, duration:"Monthly", rooms:"1–2 children",tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Monthly engagement","Infant care specialist","Routine building","Milestone tracking","Background & health verified"] },
    ],
    whyUs:[
      { icon:"🔒", label:"Triple Verified",    sub:"Police check, ID & reference verified" },
      { icon:"👶", label:"Child First Aid",    sub:"First aid & CPR trained babysitters" },
      { icon:"📱", label:"Live Updates",       sub:"Photo & activity updates via WhatsApp" },
    ],
    whatWeDo:[
      { icon:"👶", label:"Infant Care",        sub:"0–12 months specialist care" },
      { icon:"🧸", label:"Toddler Play",       sub:"1–3 years activity & play" },
      { icon:"📚", label:"Homework Help",      sub:"School-age learning support" },
      { icon:"🍼", label:"Feeding & Sleep",    sub:"Routine support" },
      { icon:"🚿", label:"Bathing & Hygiene",  sub:"Complete care" },
      { icon:"🏥", label:"Emergency Ready",    sub:"First aid & quick response" },
    ],
    faqs:[
      { q:"Kya babysitter ke documents verify kar sakte hain?", a:"Haan, Aadhar, police verification certificate share kiya jaata hai." },
      { q:"Kya infant ke liye specialist available hai?",       a:"Haan, newborn specialist nannies available hain — request at booking." },
      { q:"Agar bacha zyada cry kare toh?",                    a:"Trained babysitters soothing techniques jaante hain. Aapko inform karenge." },
      { q:"Kya overnight babysitting milti hai?",               a:"Haan, overnight care ₹1,199 mein available hai." },
    ],
  },

  "elder-care": {
    tagline:   "Compassionate, trained caretakers for senior citizens — daily care, companionship & support.",
    heroColor: "from-blue-500 via-sky-600 to-blue-700",
    packages: [
      { name:"4-Hour Visit",   price:499,  duration:"4 hrs",   rooms:"1 senior",    tag:undefined,
        color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200",   colorText:"text-blue-600",
        features:["4-hr companionship","Medication reminder","Mobility assistance","Light exercise support","Daily report"] },
      { name:"Day Care",       price:799,  duration:"8 hrs",   rooms:"1 senior",    tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["8-hr full day","Bathing & grooming assist","Meal preparation","Doctor visit escort","Family WhatsApp updates"] },
      { name:"Live-In Care",   price:15999,duration:"Monthly", rooms:"1 senior",    tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["24-hr live-in caretaker","Dementia/Alzheimer's trained","Medical coordination","Emergency response","Weekly family call"] },
    ],
    whyUs:[
      { icon:"❤️", label:"Compassion Trained", sub:"Empathy & patience focused caretakers" },
      { icon:"🏥", label:"Medical Aware",      sub:"Trained in chronic conditions & medication" },
      { icon:"🔒", label:"Background Verified",sub:"Police clearance & senior care certified" },
    ],
    whatWeDo:[
      { icon:"💊", label:"Medication",         sub:"Schedule & administration" },
      { icon:"🚿", label:"Personal Hygiene",   sub:"Bathing, grooming, dressing" },
      { icon:"🍽️", label:"Meal Support",       sub:"Cooking & feeding assistance" },
      { icon:"🚶", label:"Mobility Help",      sub:"Walking, physio exercises" },
      { icon:"💬", label:"Companionship",      sub:"Conversation & mental engagement" },
      { icon:"🏥", label:"Hospital Escort",    sub:"Doctor visits & checkups" },
    ],
    faqs:[
      { q:"Kya bedridden patients ke liye bhi available hai?", a:"Haan, trained caretakers for fully or partially bedridden seniors." },
      { q:"Dementia patients ki care hoti hai?",               a:"Haan, specially trained memory care specialists available hain." },
      { q:"Agar caretaker absent ho toh?",                     a:"Same day replacement guarantee — no day uncovered." },
      { q:"Family ko updates milte hain?",                     a:"Haan, daily WhatsApp report & weekly video call with family." },
    ],
  },

};

export default homeStaff;
