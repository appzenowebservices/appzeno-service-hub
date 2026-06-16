// src/pages/services/data/serviceData.petCare.ts
// Group: Pet Care
// Slugs: pet-grooming, pet-trainer

import type { ServiceContent } from "./serviceData.homeAndCleaning";

const petCare: Record<string, ServiceContent> = {

  "pet-grooming": {
    tagline:   "Professional pet grooming at home — bath, trim, nail & hygiene care for your furball.",
    heroColor: "from-teal-500 via-emerald-600 to-cyan-700",
    packages: [
      { name:"Basic Grooming", price:399,  duration:"1 hr",   rooms:"1 pet",        tag:undefined,
        color:"text-teal-600",   bg:"bg-teal-50",   border:"border-teal-200",   colorText:"text-teal-600",
        features:["Shampoo bath","Blow dry","Nail trimming","Ear cleaning","De-shedding brush"] },
      { name:"Full Grooming",  price:699,  duration:"2 hrs",  rooms:"1 pet",        tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Bath + blow dry","Haircut & trim","Nail filing","Teeth brushing","Paw massage","Bandana finish"] },
      { name:"Spa Package",    price:1299, duration:"3 hrs",  rooms:"1 pet",        tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Medicated or de-tick bath","Full coat trim & style","Anal gland expression","Tick & flea treatment","Cologne spray","Post-groom photo"] },
    ],
    whyUs:[
      { icon:"🐾", label:"Certified Groomers", sub:"Trained & animal behaviour aware" },
      { icon:"🌿", label:"Pet-Safe Products",  sub:"Hypoallergenic, no harsh chemicals" },
      { icon:"🏠", label:"Stress-Free",        sub:"Home setting reduces pet anxiety" },
    ],
    whatWeDo:[
      { icon:"🛁", label:"Bath & Dry",         sub:"Shampoo, condition, blow dry" },
      { icon:"✂️", label:"Haircut & Trim",     sub:"Breed-specific styling" },
      { icon:"💅", label:"Nail Trimming",      sub:"Clip & file" },
      { icon:"👂", label:"Ear Cleaning",       sub:"Safe, gentle cleaning" },
      { icon:"🦷", label:"Teeth Brushing",     sub:"Dental hygiene basics" },
      { icon:"🐛", label:"Tick & Flea",        sub:"Treatment & prevention" },
    ],
    faqs:[
      { q:"Kaunse pets groom karte ho?",                     a:"Dogs aur cats — all breeds, all sizes. Rabbits on request." },
      { q:"Kya groomer equipment laata hai?",                a:"Haan, tub, dryer, scissors, all products saath laata hai." },
      { q:"Agar pet aggressive ho toh?",                     a:"Mild sedation nahi karte — only calm & positive reinforcement methods." },
      { q:"Kitni baar grooming karwani chahiye?",            a:"Long coat breeds: monthly. Short coat: every 6–8 weeks." },
    ],
  },

  "pet-trainer": {
    tagline:   "Certified pet trainers at home — obedience, behaviour correction & socialisation.",
    heroColor: "from-amber-500 via-orange-600 to-amber-700",
    packages: [
      { name:"Starter Pack",   price:499,  duration:"1 hr",   rooms:"1 pet",        tag:undefined,
        color:"text-amber-600",  bg:"bg-amber-50",  border:"border-amber-200",  colorText:"text-amber-600",
        features:["1-hr session","Basic commands (sit, stay, come)","Owner training tips","Behaviour assessment","Progress notes"] },
      { name:"Monthly Plan",   price:2999, duration:"Monthly",rooms:"8 sessions",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["8 sessions/month","Advanced obedience","Leash & socialisation","Aggression management","WhatsApp check-ins"] },
      { name:"Behaviour Fix",  price:4999, duration:"6 weeks",rooms:"Full course",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["12 sessions","Problem behaviour focus","Separation anxiety","Biting & jumping cure","Certificate of completion","Lifetime email support"] },
    ],
    whyUs:[
      { icon:"🎓", label:"Certified Trainers",  sub:"IACP & KPA certified dog trainers" },
      { icon:"❤️", label:"Force-Free Methods",  sub:"Positive reinforcement only — no punishment" },
      { icon:"👨‍👩‍👧", label:"Owner Training",     sub:"We train you to train your pet" },
    ],
    whatWeDo:[
      { icon:"🐶", label:"Basic Commands",      sub:"Sit, stay, come, down, off" },
      { icon:"🦮", label:"Leash Training",      sub:"No-pull walking" },
      { icon:"🤝", label:"Socialisation",       sub:"People, dogs, sounds" },
      { icon:"😤", label:"Aggression Control",  sub:"Fear & dominance issues" },
      { icon:"😰", label:"Separation Anxiety",  sub:"Calm when alone" },
      { icon:"🐱", label:"Cat Training",        sub:"Litter, scratching, behaviour" },
    ],
    faqs:[
      { q:"Kaunsi breed ke liye training available hai?",    a:"Saari breeds — from Labrador to German Shepherd to Indie dogs." },
      { q:"Kitne sessions mein results dikhte hain?",        a:"Basic commands: 3–4 sessions. Behaviour issues: 6–8 sessions." },
      { q:"Kya purane dogs ko bhi train kar sakte hain?",   a:"Haan, old dogs can learn new tricks — patience aur consistency se." },
      { q:"Kya cat training bhi available hai?",             a:"Haan, litter training, scratch redirection & basic commands for cats." },
    ],
  },

};

export default petCare;
