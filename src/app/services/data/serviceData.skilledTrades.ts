// src/pages/services/data/serviceData.skilledTrades.ts
// Group: Skilled Trades
// Note: painting, carpentry, packers-movers, cctv-installation already in ServiceDetailPage inline
// New slug added: car-bike-service

import type { ServiceContent } from "./serviceData.homeAndCleaning";

const skilledTrades: Record<string, ServiceContent> = {

  "car-bike-service": {
    tagline:   "Doorstep car & bike servicing — oil change, wash, tyre check & more without leaving home.",
    heroColor: "from-slate-600 via-gray-700 to-zinc-800",
    packages: [
      { name:"Basic Service",  price:499,  duration:"1.5 hrs", rooms:"1 vehicle",   tag:undefined,
        color:"text-slate-600",  bg:"bg-slate-50",  border:"border-slate-200",  colorText:"text-slate-600",
        features:["Engine oil change","Oil filter replace","Air filter check","Tyre pressure & wash","Exterior rinse"] },
      { name:"Standard Service",price:999, duration:"2.5 hrs", rooms:"1 vehicle",   tag:"⭐ Most Popular",
        color:"text-emerald-600",bg:"bg-emerald-50",border:"border-emerald-200",colorText:"text-emerald-600",
        features:["Everything in Basic","Battery check","Brake inspection","Interior vacuum","Wiper fluid refill","AC vent clean"] },
      { name:"Full Detail",    price:1999, duration:"4 hrs",   rooms:"1 vehicle",   tag:"Best Value",
        color:"text-violet-600", bg:"bg-violet-50", border:"border-violet-200", colorText:"text-violet-600",
        features:["Full service","Foam wash + wax polish","Interior deep clean","Tyre dressing","Ceramic coat option","Service report"] },
    ],
    whyUs:[
      { icon:"🔧", label:"Trained Mechanics",  sub:"Maruti, Hyundai, Honda certified technicians" },
      { icon:"🛢️", label:"Genuine Engine Oil", sub:"Castrol, Motul, Shell — brand of your choice" },
      { icon:"🏠", label:"Zero Travel",        sub:"No need to drive to a service center" },
    ],
    whatWeDo:[
      { icon:"🛢️", label:"Oil Change",         sub:"Engine & gear oil" },
      { icon:"🚿", label:"Car Wash",           sub:"Foam, rinse & dry" },
      { icon:"🔋", label:"Battery Check",      sub:"Voltage & terminals" },
      { icon:"🛞", label:"Tyre Service",       sub:"Pressure, rotation, check" },
      { icon:"🧹", label:"Interior Cleaning",  sub:"Vacuum & wipe down" },
      { icon:"🔍", label:"General Inspection", sub:"Brakes, lights, belts" },
    ],
    faqs:[
      { q:"Kya bike aur car dono service karte ho?",         a:"Haan, two-wheelers, cars, SUVs sab ke liye available hai." },
      { q:"Engine oil konsa laate ho?",                      a:"Castrol, Shell, Motul — aap brand choose kar sakte ho booking mein." },
      { q:"Agar koi major issue mile toh?",                  a:"Turant inform karte hain — quote share karte hain aur aapki permission se kaam." },
      { q:"Kitni jagah service available hai?",              a:"Gated societies, open parking, basements — sab jagah visit karte hain." },
    ],
  },

};

export default skilledTrades;
