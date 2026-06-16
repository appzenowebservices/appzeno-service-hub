// src/pages/customer/booking/data.ts

export const CATEGORY_DATA: Record<string, {
  subServices:  string[];
  problems:     string[];
  serviceTypes: string[];
  basePrice:    number;
  visitCharge:  number;
  estDuration:  number;
}> = {
  "1": {
    subServices:  ["Full Home Cleaning","Kitchen Deep Clean","Bathroom Cleaning","Balcony Cleaning","Post-construction Clean"],
    problems:     ["Regular Maintenance","Deep Cleaning Required","Post-Event Cleanup","Pre-Move In","Post-Move Out"],
    serviceTypes: ["Standard Clean","Deep Clean","Inspection","Sanitization"],
    basePrice: 999, visitCharge: 0, estDuration: 3,
  },
  "2": {
    subServices:  ["Pipe Leak Fix","Tap/Faucet Repair","Toilet Repair","Water Tank Clean","Drain Unblocking","New Fitting"],
    problems:     ["Water Leakage","Pipe Blockage","Low Pressure","No Water Supply","Tap Dripping","Toilet Overflow"],
    serviceTypes: ["Repair","Replacement","Installation","Inspection"],
    basePrice: 300, visitCharge: 100, estDuration: 1.5,
  },
  "3": {
    subServices:  ["Switchboard Repair","Fan Install/Repair","Wiring Work","MCB/Fuse Issue","Light Fitting","Inverter Service"],
    problems:     ["No Power","Short Circuit","Frequent Tripping","Fan Not Working","Light Flickering","Sparking"],
    serviceTypes: ["Repair","Installation","Replacement","Inspection"],
    basePrice: 300, visitCharge: 100, estDuration: 1.5,
  },
  "4": {
    subServices:  ["AC Service & Cleaning","Gas Refill","AC Repair","AC Installation","AC Uninstall","PCB Repair"],
    problems:     ["Not Cooling","Gas Leakage","Water Dripping","Noise Issue","Not Starting","Remote Not Working"],
    serviceTypes: ["Service","Repair","Installation","Gas Refill"],
    basePrice: 799, visitCharge: 150, estDuration: 2,
  },
  "5": {
    subServices:  ["Interior Wall Paint","Exterior Paint","Waterproofing","Wood Polish","Texture Painting","Whitewash"],
    problems:     ["Peeling Paint","Dampness/Seepage","Old Paint Removal","New Paint Required","Touch Up Work"],
    serviceTypes: ["Full Paint","Touch Up","Waterproofing","Inspection"],
    basePrice: 1500, visitCharge: 0, estDuration: 8,
  },
  "6": {
    subServices:  ["Door Repair","Furniture Repair","Cabinet Install","False Ceiling","Window Work","Bed Assembly"],
    problems:     ["Broken Door","Loose Hinges","Furniture Damage","Cabinet Issue","Window Not Closing","Bed Squeaking"],
    serviceTypes: ["Repair","Installation","Replacement","Custom Work"],
    basePrice: 400, visitCharge: 100, estDuration: 2,
  },
  "7": {
    subServices:  ["Cockroach Treatment","Termite Control","Rodent Control","Mosquito Treatment","Bed Bug Treatment","Full Home Treatment"],
    problems:     ["Cockroach Infestation","Termite Damage","Rodent Sighting","Mosquito Problem","Bed Bugs","General Pest Issue"],
    serviceTypes: ["Spray Treatment","Gel Treatment","Fumigation","Annual Contract"],
    basePrice: 999, visitCharge: 0, estDuration: 2,
  },
  "8": {
    subServices:  ["Washing Machine","Refrigerator","Microwave","Geyser/Water Heater","Dishwasher","TV/LED Repair"],
    problems:     ["Not Working","Making Noise","Water Leaking","Not Heating/Cooling","Display Error","Door Issue"],
    serviceTypes: ["Repair","Service","Replacement","Installation"],
    basePrice: 350, visitCharge: 150, estDuration: 1.5,
  },
  "9": {
    subServices:  ["RO Service","Filter Change","UV Lamp Replace","Membrane Replace","New Installation","Repair"],
    problems:     ["Slow Output","Bad Taste","Not Purifying","Leaking","Error Light","Total Failure"],
    serviceTypes: ["Service","Repair","Installation","Filter Change"],
    basePrice: 299, visitCharge: 100, estDuration: 1,
  },
  "10": {
    subServices:  ["Sofa Cleaning","Carpet/Rug Cleaning","Mattress Cleaning","Chair Cleaning","Curtain Cleaning"],
    problems:     ["Stains","Bad Odor","General Dirt","Pest in Fabric","Pre-Event Clean","Post-Pet Clean"],
    serviceTypes: ["Dry Clean","Wet Clean","Steam Clean","Deep Clean"],
    basePrice: 599, visitCharge: 0, estDuration: 2,
  },
  "11": {
    subServices:  ["Home Shifting","Office Shifting","Vehicle Transport","Bike Transport","Storage","Part Load"],
    problems:     ["Full Home Move","Single Room Move","Office Relocation","Item Transport","Temporary Storage"],
    serviceTypes: ["Local Move","Intercity Move","Loading Only","Packing Only"],
    basePrice: 3000, visitCharge: 0, estDuration: 6,
  },
  "12": {
    subServices:  ["CCTV Installation","DVR/NVR Setup","Camera Repair","Cable Routing","Remote Access Setup","Upgrade"],
    problems:     ["New Installation","Camera Not Working","Blurry Image","No Recording","Night Vision Issue","Coverage Gaps"],
    serviceTypes: ["Installation","Repair","Upgrade","Inspection"],
    basePrice: 2500, visitCharge: 200, estDuration: 3,
  },
};

export const ALL_TIME_SLOTS = [
  "7:00 AM – 9:00 AM","9:00 AM – 11:00 AM","11:00 AM – 1:00 PM",
  "1:00 PM – 3:00 PM","3:00 PM – 5:00 PM","5:00 PM – 7:00 PM",
];

export const UNAVAILABLE_TODAY = ["7:00 AM – 9:00 AM","1:00 PM – 3:00 PM"];

export const VALID_COUPONS: Record<string, { type: "percent"|"flat"; value: number; desc: string }> = {
  "ADDIES10":  { type:"percent", value:10, desc:"10% off on total" },
  "FLAT50":    { type:"flat",    value:50, desc:"₹50 flat discount" },
  "NEWUSER":   { type:"percent", value:15, desc:"15% off for new users" },
  "WELCOME99": { type:"flat",    value:99, desc:"₹99 off on first booking" },
};

export const STEPS = [
  { label:"Service",  short:"1" },
  { label:"Issue",    short:"2" },
  { label:"Location", short:"3" },
  { label:"Schedule", short:"4" },
  { label:"Pricing",  short:"5" },
  { label:"Payment",  short:"6" },
  { label:"Confirm",  short:"7" },
];

export const CITY_GEO: Record<string, [number,number]> = {
  "lucknow":   [26.8467, 80.9462],
  "delhi":     [28.6139, 77.2090],
  "mumbai":    [19.0760, 72.8777],
  "bangalore": [12.9716, 77.5946],
  "hyderabad": [17.3850, 78.4867],
  "pune":      [18.5204, 73.8567],
  "jaipur":    [26.9124, 75.7873],
  "ahmedabad": [23.0225, 72.5714],
  "kanpur":    [26.4499, 80.3319],
  "varanasi":  [25.3176, 82.9739],
  "barabanki": [26.9285, 81.1860],
};
