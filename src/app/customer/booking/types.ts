// src/pages/customer/booking/types.ts

export interface Step1Data {
  cityId:        string;
  cityName:      string;
  categoryIds:   string[];          // ← MULTIPLE categories
  subServices:   string[];          // ← MULTIPLE sub-services
  propertyType:  "apartment"|"house"|"office"|"shop"|"";
  serviceTypes:  string[];          // ← MULTIPLE service types
}

export interface Step2Data {
  problemTypes:  string[];          // ← MULTIPLE problem types
  description:   string;
  images:        File[];
  video:         File | null;
  urgency:       "standard"|"priority"|"emergency";
}

export interface Step3Data {
  houseFlat:     string;
  building:      string;
  floor:         string;
  landmark:      string;
  area:          string;
  pincode:       string;
  lat:           number;
  lng:           number;
  liftAvailable: boolean | null;
  parkingAvail:  boolean | null;
  gatedSociety:  boolean | null;
  fetchingGps:   boolean;           // ← GPS loading state
}

// Per-vendor time slot (when multiple categories → multiple vendors)
export interface VendorSlot {
  categoryId:   string;
  categoryName: string;
  categoryIcon: string;
  date:         string;
  timeSlot:     string;
  flexibility:  "exact"|"flexible";
}

export interface Step4Data {
  vendorSlots:  VendorSlot[];       // ← one per selected category
}

export interface Step6Data {
  paymentMode:    "partial"|"full"|"cod";
  paymentMethod:  "upi"|"card"|"netbanking"|"cash";
  partialAmount:  number;           // ← custom partial amount
  couponCode:     string;
  couponApplied:  boolean;
  couponDiscount: number;
  walletUsed:     number;
  upiId:          string;
  agreedPrice:    boolean;
}

export interface BookingFormData {
  s1: Step1Data;
  s2: Step2Data;
  s3: Step3Data;
  s4: Step4Data;
  s6: Step6Data;
}
