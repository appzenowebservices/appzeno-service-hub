"use client";

import Image from "next/image";

/** Shared branded loader (logo + bar) used by every role console. */
export default function BrandedLoader({ label = "Loading ADDies…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface font-sans">
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-primary-200/60" />
        <Image src="/logo.png" alt="ADDies" width={56} height={56} priority className="relative h-14 w-14 rounded-2xl bg-white object-contain p-1 shadow-card" />
      </span>
      <p className="text-sm font-extrabold text-ink">{label}</p>
      <div className="h-1.5 w-44 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/3 animate-[loadbar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary-600 to-accent-400" />
      </div>
      <style jsx>{`
        @keyframes loadbar {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(320%); }
        }
      `}</style>
    </div>
  );
}
