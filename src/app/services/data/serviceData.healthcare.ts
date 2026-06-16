// src/pages/services/data/serviceData.healthcare.ts
// Group: Healthcare
// Slugs: nursing-services, doctor-on-call, physiotherapy, lab-tests-at-home

import type { ServiceContent } from "./serviceData.homeAndCleaning";

const healthcare: Record<string, ServiceContent> = {

  "nursing-services": {
    tagline:   "Qualified nurses at home — post-surgery care, IV, wound dressing & elder support.",
    heroColor: "from-sky-500 via-blue-600 to-sky-700",
    packages: [
      { name:"4-Hour Visit",   price:699,  duration:"4 hrs",   rooms:"1 patient",   tag:undefined,
        color:"text-sky-600",    bg:"bg-sky-50",    border:"border-sky-200",    colorText:"text-sky-600",
        features:["4-hr shift","Vitals monitoring","Medication reminder","Basic wound dressing","Report to family"] },
      { name:"Day Care",       price:999,  duration:"8 hrs",   rooms:"1 patient",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["8-hr shift","IV & injections","Catheter care","Physiotherapy assist","Daily health log"] },
      { name:"Live-In Nursing",price:2499, duration:"24 hrs",  rooms:"1 patient",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["24-hr live-in","ICU-trained nurses","Ventilator/oxygen assist","Emergency alert system","Weekly family briefing"] },
    ],
    whyUs:[
      { icon:"🎓", label:"Qualified Nurses",    sub:"B.Sc & GNM certified registered nurses" },
      { icon:"🔒", label:"Background Verified", sub:"Police verification & reference checks" },
      { icon:"📋", label:"Daily Health Logs",   sub:"Written reports shared with family daily" },
    ],
    whatWeDo:[
      { icon:"💉", label:"IV & Injections",     sub:"IM, IV, SC administration" },
      { icon:"🩹", label:"Wound Dressing",      sub:"Post-surgery & diabetic wounds" },
      { icon:"🩺", label:"Vitals Monitoring",   sub:"BP, pulse, sugar, temp" },
      { icon:"💊", label:"Medication Support",  sub:"Schedule & reminders" },
      { icon:"🏥", label:"Post-Op Care",        sub:"Recovery support at home" },
      { icon:"🧓", label:"Elder Care",          sub:"Daily routine & hygiene help" },
    ],
    faqs:[
      { q:"Kya nurse ki qualification verify kar sakte hain?", a:"Haan, nurse ka registration number aur certificates share kiye jaate hain." },
      { q:"Emergency mein kya hoga?",                          a:"Nurse turant family ko inform karega aur ambulance call kar sakta hai." },
      { q:"Kya male nurse bhi available hain?",                a:"Haan, male aur female dono available hain — preference at booking." },
      { q:"Injection aur IV ke liye doctor prescription zaroori hai?", a:"Haan, prescription mandatory hai for IV & injection services." },
    ],
  },

  "doctor-on-call": {
    tagline:   "Verified doctors at your door — consultation, diagnosis & prescription at home.",
    heroColor: "from-emerald-500 via-teal-600 to-emerald-700",
    packages: [
      { name:"General Consult", price:399,  duration:"30 min", rooms:"1 patient",   tag:undefined,
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["30-min consultation","Fever, cold, body ache","Prescription writing","Diet advice","Referral if needed"] },
      { name:"Extended Visit",  price:699,  duration:"1 hr",   rooms:"1 patient",   tag:"⭐ Most Popular",
        color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200",   colorText:"text-blue-600",
        features:["1-hr home visit","Full physical examination","BP, sugar, SpO2 check","Detailed prescription","Follow-up call included"] },
      { name:"Specialist Visit",price:1499, duration:"1.5 hrs",rooms:"1 patient",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Specialist on request","Paediatrician, gynaecologist, GP","Diagnostic kit carried","Lab test ordering","Video follow-up"] },
    ],
    whyUs:[
      { icon:"🏥", label:"MCI Registered",     sub:"All doctors have valid MCI registration" },
      { icon:"⚡", label:"Within 60 Minutes",  sub:"Doctor arrives in under 1 hour" },
      { icon:"💊", label:"Digital Prescription",sub:"Prescription shared via WhatsApp" },
    ],
    whatWeDo:[
      { icon:"🤒", label:"Fever & Cold",       sub:"Diagnosis & treatment" },
      { icon:"🩺", label:"General Checkup",    sub:"Full physical exam" },
      { icon:"💉", label:"Injections",         sub:"Administered at home" },
      { icon:"👶", label:"Paediatric",         sub:"Child health & vaccination" },
      { icon:"🧓", label:"Geriatric Care",     sub:"Senior citizen visits" },
      { icon:"🏥", label:"Emergency",          sub:"Urgent home visits" },
    ],
    faqs:[
      { q:"Doctor kitni der mein aayega?",                   a:"Booking confirm hone ke baad 45–60 minute mein doctor pahunch jaata hai." },
      { q:"Kya specialist doctors available hain?",          a:"Haan, paediatrician, gynaecologist, orthopaedic available at premium." },
      { q:"Prescription valid hoti hai?",                    a:"Haan, MCI-registered doctor ki prescription legally valid hoti hai." },
      { q:"Kya 24/7 service hai?",                           a:"Haan, emergency visits available 24/7 — booking per confirm karo." },
    ],
  },

  "physiotherapy": {
    tagline:   "Certified physiotherapists at home — pain relief, mobility & post-injury recovery.",
    heroColor: "from-cyan-500 via-blue-600 to-indigo-700",
    packages: [
      { name:"Single Session", price:499,  duration:"1 hr",   rooms:"1 patient",   tag:undefined,
        color:"text-cyan-600",   bg:"bg-cyan-50",   border:"border-cyan-200",   colorText:"text-cyan-600",
        features:["1-hr session","Pain assessment","Manual therapy","Exercise guidance","Home care tips"] },
      { name:"Weekly Plan",    price:2999, duration:"Weekly", rooms:"4 sessions",  tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["4 sessions/week","Progress evaluation","Electrotherapy if needed","Home exercise chart","WhatsApp support"] },
      { name:"Recovery Pack",  price:7999, duration:"1 month",rooms:"Full course",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Full month program","16+ sessions","Electrotherapy & ultrasound","Strength rebuilding","Discharge report"] },
    ],
    whyUs:[
      { icon:"🎓", label:"BPT Certified",      sub:"Bachelor of Physiotherapy qualified" },
      { icon:"🧰", label:"Clinical Equipment", sub:"TENS, ultrasound, hot/cold therapy" },
      { icon:"📈", label:"Measurable Recovery",sub:"Documented progress every session" },
    ],
    whatWeDo:[
      { icon:"🦴", label:"Back & Neck Pain",   sub:"Disc, muscle & spine issues" },
      { icon:"🦵", label:"Knee & Hip",         sub:"Arthritis & joint pain" },
      { icon:"🤸", label:"Sports Injury",      sub:"Ligament & muscle repair" },
      { icon:"🏥", label:"Post-Surgery",       sub:"Knee, hip replacement rehab" },
      { icon:"🧠", label:"Neurological",       sub:"Stroke, Parkinson's, CP" },
      { icon:"🤰", label:"Antenatal",          sub:"Pregnancy & postnatal care" },
    ],
    faqs:[
      { q:"Doctor referral zaroori hai?",                    a:"Nahi, directly book kar sakte ho. Doctor's report helpful hoti hai." },
      { q:"Kya equipment ghar par laate hain?",              a:"Haan, TENS machine, ultrasound, hot pack saath laate hain." },
      { q:"Kitne sessions mein relief milta hai?",            a:"Acute pain: 3–5 sessions. Chronic conditions: 8–12 sessions typically." },
      { q:"Post-surgery ke liye kab start karein?",           a:"Surgeon ki clearance ke baad 2–3 din mein physio start kar sakte hain." },
    ],
  },

  "lab-tests-at-home": {
    tagline:   "Blood, urine & diagnostic samples collected at home — fast reports, certified labs.",
    heroColor: "from-violet-500 via-purple-600 to-violet-700",
    packages: [
      { name:"Basic Tests",    price:299,  duration:"15 min", rooms:"1 person",    tag:undefined,
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["CBC / Blood sugar","Urine routine","Report in 24 hrs","NABL-certified lab","Home collection"] },
      { name:"Full Body",      price:999,  duration:"20 min", rooms:"1 person",    tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["60+ parameters","CBC, LFT, KFT, thyroid","Lipid + sugar profile","Vitamin B12 & D3","Digital report in 12 hrs"] },
      { name:"Advanced Panel", price:1999, duration:"25 min", rooms:"1 person",    tag:"Best Value",
        color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200",   colorText:"text-blue-600",
        features:["100+ parameters","HbA1c, cancer markers","Hormone panel","Allergy test","Doctor consult (30 min) included"] },
    ],
    whyUs:[
      { icon:"🏥", label:"NABL Certified",     sub:"All tests processed at NABL-accredited labs" },
      { icon:"📱", label:"Digital Reports",    sub:"Reports on WhatsApp & app within 12 hrs" },
      { icon:"🩸", label:"Painless Collection",sub:"Trained phlebotomists, minimal discomfort" },
    ],
    whatWeDo:[
      { icon:"🩸", label:"Blood Tests",        sub:"CBC, sugar, thyroid, hormones" },
      { icon:"🧫", label:"Urine Tests",        sub:"Routine, culture, microalbumin" },
      { icon:"💊", label:"Vitamin Levels",     sub:"B12, D3, iron, folate" },
      { icon:"❤️", label:"Cardiac Profile",   sub:"Lipid, Troponin, homocysteine" },
      { icon:"🧬", label:"Genetic Tests",      sub:"On request — specialist referred" },
      { icon:"🦠", label:"Infection Markers",  sub:"CRP, ESR, Widal, dengue" },
    ],
    faqs:[
      { q:"Fasting zaroori hai blood test ke liye?",         a:"Kuch tests ke liye 8–12 hrs fasting zaroori hai (sugar, lipid). Hum inform karte hain." },
      { q:"Report kitni der mein aati hai?",                 a:"Routine tests: 12–24 hrs. Advanced panels: 24–48 hrs." },
      { q:"Kya senior citizens ke liye comfortable hai?",    a:"Haan, trained phlebotomists carefully handle elderly patients." },
      { q:"Kya results doctor ko directly share kar sakte hain?", a:"Haan, PDF report share karne ka option booking form mein hai." },
    ],
  },

};

export default healthcare;
