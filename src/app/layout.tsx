import "~/styles/globals.css";

import { type Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { SessionProvider } from 'next-auth/react';
// import FcmBootstrap from "~/app/components/FcmBootstrap";


export const metadata: Metadata = {
  title: {
    default: "ADDies Service Hub — Ghar ka har kaam",
    template: "%s | ADDies Service Hub",
  },
  description:
    "Plumbing, AC service, cleaning, beauty, tuition aur 50+ home services — verified vendors, upfront pricing, warranty ke saath.",
  keywords: [
    "Apni Desi Dukaan",
    "ADD",
    "desi dukaan",
    "kirana online",
    "local store delivery",
    "groceries online India",
    "daily essentials delivery",
    "home delivery kirana",
  ],
  authors: [{ name: "Apni Desi Dukaan Team" }],
  creator: "Apni Desi Dukaan",
  publisher: "Apni Desi Dukaan",

  // Favicon & icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://apnidesidukaan.com",
    siteName: "Apni Desi Dukaan",
    title: "Apni Desi Dukaan – Sab Kuch Milega Yahan",
    description:
      "Your one-stop desi marketplace for groceries, medicines, food, tailoring, and daily essentials. Shop from local stores with trust and convenience.",
    images: [
      {
        url: "/og-banner.png", // make a banner image (1200x630px)
        width: 1200,
        height: 630,
        alt: "Apni Desi Dukaan – Apni ghar ki dukaan",
      },
    ],
  },

  // Twitter Card (for sharing)
  twitter: {
    card: "summary_large_image",
    title: "Apni Desi Dukaan – Sab Kuch Milega Yahan",
    description:
      "Order groceries, medicines, food, and essentials from your trusted local stores with Apni Desi Dukaan.",
    images: ["/og-banner.png"],
    creator: "@ADD_Official", // replace when you have a handle
  },

};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/logo.webp" />
        <meta name="theme-color" content="#0369a1" />
      <body className="bg-surface text-ink font-sans">
        <SessionProvider >
          <TRPCReactProvider>
            {children}
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
