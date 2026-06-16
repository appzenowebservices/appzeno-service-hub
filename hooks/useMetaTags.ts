// src/hooks/useMetaTags.ts
//
// AI-powered meta tags hook.
// Pass a PageContext object → Claude API generates SEO-optimised
// title, description, keywords, and Open Graph tags automatically.
// Results are cached in sessionStorage so the API is called only once
// per unique page context per browser session.
//
// Usage (any page):
//   const meta = useMetaTags({
//     pageType: "vendor",
//     vendor,
//     city: cityName,
//   });
//   // then render: <MetaHead meta={meta} />

import { useState, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PageType =
  | "home"
  | "allServices"
  | "serviceDetail"
  | "vendorDirectory"
  | "vendorProfile"
  | "allCities"
  | "howItWorks"
  | "aboutUs"
  | "contactUs"
  | "login"
  | "register"
  | "privacy"
  | "terms";

export interface PageContext {
  pageType:     PageType;
  // Service pages
  serviceName?:  string;
  serviceDesc?:  string;
  category?:     string;
  subServices?:  string[];
  // Vendor pages
  businessName?: string;
  ownerName?:    string;
  rating?:       number;
  totalReviews?: number;
  totalJobs?:    number;
  yearsExp?:     number;
  vendorAbout?:  string;
  // Location
  city?:         string;
  area?:         string;
  // City pages
  cityCount?:    number;
  // Generic
  customHint?:   string;   // any extra context you want AI to know
}

export interface MetaTags {
  title:       string;
  description: string;
  keywords:    string;
  ogTitle:     string;
  ogDescription: string;
  canonical?:  string;
  loading:     boolean;
  error:       boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CACHE KEY
// ─────────────────────────────────────────────────────────────────────────────
function cacheKey(ctx: PageContext): string {
  // deterministic key from the context
  return `meta_${ctx.pageType}_${ctx.serviceName ?? ""}_${ctx.businessName ?? ""}_${ctx.city ?? ""}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildPrompt(ctx: PageContext): string {
  const brand = "ADDies ServiceHub";
  const tagline = "India's trusted hyperlocal home services marketplace";

  const contextLines: string[] = [
    `Brand: ${brand} — ${tagline}`,
    `Page type: ${ctx.pageType}`,
  ];

  if (ctx.city)         contextLines.push(`City: ${ctx.city}`);
  if (ctx.area)         contextLines.push(`Area/Locality: ${ctx.area}`);
  if (ctx.serviceName)  contextLines.push(`Service: ${ctx.serviceName}`);
  if (ctx.serviceDesc)  contextLines.push(`Service description: ${ctx.serviceDesc}`);
  if (ctx.category)     contextLines.push(`Category: ${ctx.category}`);
  if (ctx.subServices?.length)
    contextLines.push(`Sub-services covered: ${ctx.subServices.slice(0, 8).join(", ")}`);
  if (ctx.businessName) contextLines.push(`Vendor business name: ${ctx.businessName}`);
  if (ctx.ownerName)    contextLines.push(`Owner: ${ctx.ownerName}`);
  if (ctx.rating)       contextLines.push(`Vendor rating: ${ctx.rating}/5`);
  if (ctx.totalReviews) contextLines.push(`Total reviews: ${ctx.totalReviews}`);
  if (ctx.totalJobs)    contextLines.push(`Total jobs completed: ${ctx.totalJobs}+`);
  if (ctx.yearsExp)     contextLines.push(`Years of experience: ${ctx.yearsExp}`);
  if (ctx.vendorAbout)  contextLines.push(`About vendor: ${ctx.vendorAbout.slice(0, 200)}`);
  if (ctx.cityCount)    contextLines.push(`Cities served: ${ctx.cityCount}+`);
  if (ctx.customHint)   contextLines.push(`Extra context: ${ctx.customHint}`);

  return `You are an expert Indian SEO specialist for a home services marketplace.

Given the following page context, generate SEO-optimised meta tags.

PAGE CONTEXT:
${contextLines.join("\n")}

RULES:
- title: 50-60 chars, include primary keyword + city if available, end with "| ADDies"
- description: 140-160 chars, benefit-driven, include city, call-to-action
- keywords: 8-12 comma-separated, mix of short-tail and long-tail, India-relevant
- ogTitle: same as title or slightly catchier (max 60 chars)
- ogDescription: same as description or slightly more engaging (max 160 chars)
- Use natural Indian English (not overly formal)
- Include city name naturally where relevant
- Focus on trust signals: verified, rated, affordable, near me

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "title": "...",
  "description": "...",
  "keywords": "...",
  "ogTitle": "...",
  "ogDescription": "..."
}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACKS (shown while AI loads or on error)
// ─────────────────────────────────────────────────────────────────────────────
function getFallback(ctx: PageContext): Omit<MetaTags, "loading" | "error"> {
  const city = ctx.city ?? "your city";
  const brand = "ADDies ServiceHub";

  const map: Record<PageType, Omit<MetaTags, "loading" | "error">> = {
    home: {
      title:         `${brand} — Trusted Home Services in ${city}`,
      description:   `Book verified home services in ${city}. Cleaning, plumbing, electrical, AC repair & more. Rated pros, transparent pricing. Book now on ADDies.`,
      keywords:      `home services ${city}, book plumber ${city}, home cleaning ${city}, ADDies ServiceHub`,
      ogTitle:       `${brand} — Trusted Home Services in ${city}`,
      ogDescription: `Find and book verified home service professionals in ${city}. Fast, affordable, and reliable.`,
    },
    allServices: {
      title:         `All Home Services in ${city} | ${brand}`,
      description:   `Browse 50+ home services in ${city} — cleaning, plumbing, electrical, beauty, healthcare & more. Verified professionals. Book online instantly.`,
      keywords:      `all home services ${city}, home services list, book service ${city}, ADDies`,
      ogTitle:       `All Home Services in ${city} | ${brand}`,
      ogDescription: `50+ verified home services in ${city}. Browse and book instantly on ADDies ServiceHub.`,
    },
    serviceDetail: {
      title:         `${ctx.serviceName ?? "Home Service"} in ${city} | ${brand}`,
      description:   `Book trusted ${ctx.serviceName ?? "home service"} in ${city}. Verified professionals, transparent pricing, doorstep service. Starting ₹299. Book now.`,
      keywords:      `${ctx.serviceName} ${city}, book ${ctx.serviceName}, ${ctx.serviceName} near me, ADDies`,
      ogTitle:       `${ctx.serviceName ?? "Home Service"} in ${city} | ${brand}`,
      ogDescription: `Book ${ctx.serviceName ?? "home service"} at your doorstep in ${city}. Verified & rated professionals.`,
    },
    vendorDirectory: {
      title:         `Find Verified Service Vendors in ${city} | ${brand}`,
      description:   `Discover top-rated home service vendors in ${city}. Compare ratings, prices & reviews. Book verified professionals for cleaning, plumbing, electrical & more.`,
      keywords:      `service vendors ${city}, hire professional ${city}, verified vendors, ADDies directory`,
      ogTitle:       `Top Service Vendors in ${city} | ${brand}`,
      ogDescription: `Find and hire verified home service professionals in ${city}. Compare ratings and book instantly.`,
    },
    vendorProfile: {
      title:         `${ctx.businessName ?? "Service Professional"} in ${city} | ${brand}`,
      description:   `Book ${ctx.businessName ?? "this professional"} in ${city}. ${ctx.rating ? `Rated ${ctx.rating}/5` : "Highly rated"}, ${ctx.totalJobs ?? "100"}+ jobs completed. Verified & trusted on ADDies ServiceHub.`,
      keywords:      `${ctx.businessName} ${city}, ${ctx.category} ${city}, hire ${ctx.category}, ADDies`,
      ogTitle:       `${ctx.businessName ?? "Service Professional"} | ${brand}`,
      ogDescription: `${ctx.businessName ?? "Professional"} in ${city} — ${ctx.rating ? `${ctx.rating}★` : "Top rated"}, ${ctx.totalJobs ?? "100"}+ jobs. Book now.`,
    },
    allCities: {
      title:         `ADDies Service Cities Across India | ${brand}`,
      description:   `ADDies ServiceHub is available in ${ctx.cityCount ?? "50"}+ cities across India. Find trusted home services in your city — Bangalore, Mumbai, Delhi, Lucknow & more.`,
      keywords:      `ADDies cities, home services India, service cities list, ADDies ServiceHub locations`,
      ogTitle:       `${ctx.cityCount ?? "50"}+ Cities | ${brand}`,
      ogDescription: `ADDies home services available across ${ctx.cityCount ?? "50"}+ cities in India. Find services near you.`,
    },
    howItWorks: {
      title:         `How ADDies Works — Book Home Services Easily | ${brand}`,
      description:   `Book home services in 4 simple steps on ADDies. Browse, choose, book, and pay after service. Verified professionals, transparent pricing, 7-day guarantee.`,
      keywords:      `how ADDies works, book home service steps, ADDies process, home service booking`,
      ogTitle:       `How It Works | ${brand}`,
      ogDescription: `Book verified home services in 4 easy steps. Pay only after service. 7-day guarantee.`,
    },
    aboutUs: {
      title:         `About ADDies ServiceHub — India's Home Services Platform`,
      description:   `ADDies ServiceHub connects Indian homeowners with verified service professionals. Learn about our mission, values, and how we're making home services accessible across India.`,
      keywords:      `about ADDies, ADDies ServiceHub, home services India, ADDies mission`,
      ogTitle:       `About Us | ${brand}`,
      ogDescription: `Learn how ADDies is transforming home services across India with verified professionals.`,
    },
    contactUs: {
      title:         `Contact ADDies ServiceHub | Get Help & Support`,
      description:   `Get in touch with ADDies ServiceHub. Customer support, vendor inquiries, partnership opportunities. We're here to help — reach us by phone, email, or chat.`,
      keywords:      `ADDies contact, ADDies support, home service help, ADDies customer care`,
      ogTitle:       `Contact Us | ${brand}`,
      ogDescription: `Reach ADDies ServiceHub for support, partnerships, or inquiries. We respond fast.`,
    },
    login: {
      title:         `Login to ADDies ServiceHub`,
      description:   `Login to your ADDies account to book home services, track orders, and manage your bookings. New user? Register in seconds.`,
      keywords:      `ADDies login, sign in ADDies, ADDies account`,
      ogTitle:       `Login | ${brand}`,
      ogDescription: `Sign in to book and manage your home service bookings on ADDies ServiceHub.`,
    },
    register: {
      title:         `Register on ADDies ServiceHub — Join as Customer or Vendor`,
      description:   `Create your free ADDies account. Book home services as a customer or grow your business as a verified service vendor. Join 50,000+ users on ADDies.`,
      keywords:      `ADDies register, join ADDies, ADDies vendor registration, ADDies signup`,
      ogTitle:       `Register | ${brand}`,
      ogDescription: `Join ADDies ServiceHub as a customer or partner vendor. Free registration, instant access.`,
    },
    privacy: {
      title:         `Privacy Policy | ${brand}`,
      description:   `Read ADDies ServiceHub's privacy policy. Learn how we collect, use, and protect your personal data in compliance with Indian data protection laws.`,
      keywords:      `ADDies privacy policy, data protection ADDies, ADDies terms`,
      ogTitle:       `Privacy Policy | ${brand}`,
      ogDescription: `How ADDies ServiceHub collects and protects your personal information.`,
    },
    terms: {
      title:         `Terms & Conditions | ${brand}`,
      description:   `Read ADDies ServiceHub's terms and conditions. Understand the rules governing use of our platform for customers and service vendors across India.`,
      keywords:      `ADDies terms conditions, ADDies user agreement, ADDies service terms`,
      ogTitle:       `Terms & Conditions | ${brand}`,
      ogDescription: `Terms and conditions for using ADDies ServiceHub platform as a customer or vendor.`,
    },
  };

  return map[ctx.pageType] ?? map.home;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HOOK
// ─────────────────────────────────────────────────────────────────────────────
export function useMetaTags(ctx: PageContext): MetaTags {
  const fallback = getFallback(ctx);
  const [meta, setMeta] = useState<MetaTags>({ ...fallback, loading: true, error: false });

  useEffect(() => {
    const key = cacheKey(ctx);

    // ── Check sessionStorage cache ──
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        setMeta({ ...parsed, loading: false, error: false });
        return;
      }
    } catch (_) {}

    // ── Call Claude API ──
    let cancelled = false;

    async function fetchMeta() {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model:      "claude-sonnet-4-20250514",
            max_tokens: 400,
            messages:   [{ role: "user", content: buildPrompt(ctx) }],
          }),
        });

        if (!res.ok) throw new Error(`API ${res.status}`);

        const data = await res.json();
        const text = data.content
          ?.filter((b: any) => b.type === "text")
          .map((b: any) => b.text)
          .join("") ?? "";

        // Strip any accidental markdown fences
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        const result: Omit<MetaTags, "loading" | "error"> = {
          title:         parsed.title         ?? fallback.title,
          description:   parsed.description   ?? fallback.description,
          keywords:      parsed.keywords      ?? fallback.keywords,
          ogTitle:       parsed.ogTitle        ?? fallback.ogTitle,
          ogDescription: parsed.ogDescription ?? fallback.ogDescription,
        };

        if (!cancelled) {
          // Cache in sessionStorage
          try { sessionStorage.setItem(key, JSON.stringify(result)); } catch (_) {}
          setMeta({ ...result, loading: false, error: false });
        }
      } catch (err) {
        if (!cancelled) {
          // Use fallback silently — user sees good defaults, no broken UI
          setMeta({ ...fallback, loading: false, error: true });
        }
      }
    }

    fetchMeta();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey(ctx)]);

  return meta;
}
