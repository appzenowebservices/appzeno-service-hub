// src/components/seo/MetaHead.tsx
//
// Injects AI-generated meta tags into <head> via react-helmet-async.
//
// ONE-TIME SETUP:
//   npm install react-helmet-async
//
//   In App.tsx — wrap your entire app:
//   import { HelmetProvider } from "react-helmet-async";
//   <HelmetProvider><App /></HelmetProvider>
//
// USAGE on any page (2 lines):
//   const meta = useMetaTags({ pageType: "serviceDetail", serviceName, city });
//   <MetaHead meta={meta} path="/lucknow/home-cleaning" />

import { Helmet } from "react-helmet-async";
import type { MetaTags } from "../../../../hooks/useMetaTags";

interface Props {
  meta:  MetaTags;
  path?: string;   // URL path for canonical, e.g. "/vendors/abc-cleaning-lucknow"
}

const BASE_URL  = "https://addies.in";        // ← your production domain
const OG_IMAGE  = `${BASE_URL}/og-image.png`; // ← 1200×630 brand banner image
const SITE_NAME = "ADDies ServiceHub";
const TWITTER   = "@addiesapp";               // ← update if needed

export default function MetaHead({ meta, path }: Props) {
  const canonical = path ? `${BASE_URL}${path}` : undefined;

  return (
    <Helmet>
      {/* ── Primary SEO ─────────────────────────────────────────────── */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords"    content={meta.keywords}    />
      <meta name="robots"      content="index, follow"    />
      <meta name="author"      content={SITE_NAME}        />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* ── Open Graph — Facebook, WhatsApp, LinkedIn previews ──────── */}
      <meta property="og:type"        content="website"           />
      <meta property="og:site_name"   content={SITE_NAME}         />
      <meta property="og:title"       content={meta.ogTitle}       />
      <meta property="og:description" content={meta.ogDescription} />
      <meta property="og:image"       content={OG_IMAGE}          />
      {canonical && <meta property="og:url" content={canonical}   />}

      {/* ── Twitter Card ─────────────────────────────────────────────── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER}             />
      <meta name="twitter:title"       content={meta.ogTitle}        />
      <meta name="twitter:description" content={meta.ogDescription}  />
      <meta name="twitter:image"       content={OG_IMAGE}            />

      {/* ── Mobile / PWA ─────────────────────────────────────────────── */}
      <meta name="theme-color"                           content="#1e40af"   />
      <meta name="application-name"                      content={SITE_NAME} />
      <meta name="apple-mobile-web-app-capable"          content="yes"       />
      <meta name="apple-mobile-web-app-status-bar-style" content="default"   />
      <meta name="apple-mobile-web-app-title"            content={SITE_NAME} />

      {/* ── India geo SEO ────────────────────────────────────────────── */}
      <meta name="geo.region"    content="IN"    />
      <meta name="geo.placename" content="India" />
      <meta httpEquiv="content-language" content="en-IN" />
    </Helmet>
  );
}
