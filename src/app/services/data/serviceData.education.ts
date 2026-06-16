// src/pages/services/data/serviceData.education.ts
// Group: Education
// Slugs: home-tuition, music-classes, dance-classes

import type { ServiceContent } from "./serviceData.homeAndCleaning";

const education: Record<string, ServiceContent> = {

  "home-tuition": {
    tagline:   "Expert home tutors for all subjects, KG to 12th — personalized learning, real results.",
    heroColor: "from-blue-600 via-indigo-600 to-blue-700",
    packages: [
      { name:"Primary (KG–5th)",  price:999,  duration:"Monthly", rooms:"1 student",  tag:undefined,
        color:"text-blue-600",   bg:"bg-blue-50",   border:"border-blue-200",   colorText:"text-blue-600",
        features:["12 sessions/month","1-hr per session","Maths, English, Hindi, Science","Homework help","Monthly test"] },
      { name:"Middle (6th–10th)", price:1499, duration:"Monthly", rooms:"1 student",  tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["12 sessions/month","All subjects available","Exam prep & notes","Doubt sessions","Progress report to parents"] },
      { name:"Senior (11th–12th)",price:2499, duration:"Monthly", rooms:"1 student",  tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["PCM / PCB / Commerce","Board exam prep","JEE / NEET / CA foundation","Topic-wise tests","Dedicated subject expert"] },
    ],
    whyUs:[
      { icon:"🎓", label:"Verified Tutors",    sub:"Background checked, degree-verified teachers" },
      { icon:"📊", label:"Parent Updates",     sub:"Weekly progress shared with parents" },
      { icon:"📚", label:"Board Aligned",      sub:"CBSE, ICSE, UP Board, State board all covered" },
    ],
    whatWeDo:[
      { icon:"📐", label:"Mathematics",        sub:"KG to advanced calculus" },
      { icon:"🔬", label:"Science",            sub:"Physics, Chemistry, Biology" },
      { icon:"📖", label:"English",            sub:"Grammar, writing, literature" },
      { icon:"🌍", label:"Social Studies",     sub:"History, Geography, Civics" },
      { icon:"🧮", label:"Competitive Prep",   sub:"JEE, NEET, board exams" },
      { icon:"💻", label:"Computer Science",   sub:"Theory & practical" },
    ],
    faqs:[
      { q:"Tutor kaunse board ke liye available hain?",      a:"CBSE, ICSE, UP Board, MP Board, State board — sabhi ke liye." },
      { q:"Kya ek hi tutor sabhi subjects padhayega?",       a:"Ek tutor 2-3 subjects padhata hai. Multiple subjects ke liye alag tutors milenge." },
      { q:"Agar tutor nahi aaya to?",                        a:"Backup tutor arrange karte hain aur missed session reschedule karte hain." },
      { q:"Competitive exam ki special coaching milti hai?", a:"Haan, JEE/NEET/CA foundation ke liye dedicated specialist tutors hain." },
    ],
  },

  "music-classes": {
    tagline:   "Learn guitar, keyboard, tabla, singing & more — expert music tutors at your home.",
    heroColor: "from-orange-500 via-amber-600 to-orange-700",
    packages: [
      { name:"Beginner",       price:999,  duration:"Monthly", rooms:"1 student",   tag:undefined,
        color:"text-orange-600", bg:"bg-orange-50", border:"border-orange-200", colorText:"text-orange-600",
        features:["8 sessions/month","45 min per class","Instrument basics","Music notation intro","Theory foundation"] },
      { name:"Intermediate",   price:1499, duration:"Monthly", rooms:"1 student",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["12 sessions/month","1 hr per class","Song-based learning","Scale & chord mastery","Performance prep"] },
      { name:"Advanced",       price:2499, duration:"Monthly", rooms:"1 student",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["16 sessions/month","Composition & improvisation","Exam prep (Trinity, ABRSM)","Recital coaching","Recording guidance"] },
    ],
    whyUs:[
      { icon:"🎵", label:"Trained Musicians",  sub:"Performing artists & music degree holders" },
      { icon:"🎸", label:"All Instruments",    sub:"Guitar, keyboard, tabla, harmonium, vocals" },
      { icon:"📜", label:"Exam Prep",          sub:"Trinity, ABRSM, Prayag Sangeet Samiti" },
    ],
    whatWeDo:[
      { icon:"🎸", label:"Guitar",             sub:"Acoustic, electric, bass" },
      { icon:"🎹", label:"Keyboard / Piano",   sub:"Classical & contemporary" },
      { icon:"🥁", label:"Tabla & Drums",      sub:"Classical & modern beats" },
      { icon:"🎤", label:"Vocals / Singing",   sub:"Classical, Bollywood, Western" },
      { icon:"🪗", label:"Harmonium",          sub:"Hindustani classical" },
      { icon:"🎻", label:"Violin",             sub:"Classical & film music" },
    ],
    faqs:[
      { q:"Kya beginner ke liye instrument kharidna zaroori hai?",   a:"Pehle kuch sessions mein tutor instrument laayega — baad mein kharido." },
      { q:"Kya bachche aur adults dono ke liye classes hain?",       a:"Haan, age 4+ se leke adults tak sabke liye classes available hain." },
      { q:"Koi music background chahiye?",                           a:"Nahi, zero background walon ke liye bhi specially designed classes hain." },
      { q:"Online classes bhi milti hain?",                          a:"Haan, video call sessions ₹799/month extra mein available hain." },
    ],
  },

  "dance-classes": {
    tagline:   "Bollywood, classical, hip-hop & more — certified dance tutors at your home.",
    heroColor: "from-pink-500 via-fuchsia-600 to-pink-700",
    packages: [
      { name:"Beginner",       price:799,  duration:"Monthly", rooms:"1 student",   tag:undefined,
        color:"text-pink-600",   bg:"bg-pink-50",   border:"border-pink-200",   colorText:"text-pink-600",
        features:["8 sessions/month","45 min per class","Basic steps & posture","Rhythm training","Any style of choice"] },
      { name:"Regular",        price:1299, duration:"Monthly", rooms:"1 student",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["12 sessions/month","1 hr per class","Choreography learning","Flexibility training","Video feedback"] },
      { name:"Performance",    price:2499, duration:"Monthly", rooms:"1 student",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["16 sessions/month","Competition/event prep","Full choreography","Expression & stage training","Solo showcase routine"] },
    ],
    whyUs:[
      { icon:"🏅", label:"Certified Instructors", sub:"Trained in classical & contemporary styles" },
      { icon:"🎥", label:"Video Sessions",       sub:"Every class recorded for self-review" },
      { icon:"🎭", label:"All Styles",           sub:"Bollywood, Kathak, Hip-Hop, Zumba, Western" },
    ],
    whatWeDo:[
      { icon:"💃", label:"Bollywood",           sub:"Film & contemporary steps" },
      { icon:"🕺", label:"Hip-Hop",             sub:"Street style & freestyle" },
      { icon:"🪷", label:"Classical",           sub:"Kathak, Bharatnatyam, Odissi" },
      { icon:"🌀", label:"Zumba",               sub:"Fitness-based dance" },
      { icon:"✨", label:"Western",             sub:"Jazz, contemporary, salsa" },
      { icon:"👧", label:"Kids Dance",          sub:"Fun age-appropriate routines" },
    ],
    faqs:[
      { q:"Koi prior dance experience chahiye?",              a:"Nahi, complete beginners ke liye bhi classes available hain." },
      { q:"Kya competition ke liye taiyari karwa sakte hain?", a:"Haan, Performance package competition & event preparation ke liye hi hai." },
      { q:"Group classes milti hain?",                        a:"Haan, 2–4 students group sessions ₹999/month per person mein available." },
      { q:"Kaunsa style popular hai?",                        a:"Bollywood aur Zumba sabse zyada popular hain — beginners ke liye perfect." },
    ],
  },

};

export default education;
