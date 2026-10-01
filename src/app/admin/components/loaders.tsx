import Image from "next/image";

/** Branded loading suite for the ops console. */

export function LoadingConsole() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface font-sans">
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-primary-200/60" />
        <Image src="/logo.png" alt="ADDies" width={56} height={56} className="relative h-14 w-14 rounded-2xl bg-white object-contain p-1 shadow-card" />
      </span>
      <p className="text-sm font-extrabold text-ink">Loading your console…</p>
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

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="stat-card">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-7 w-20" />
          <Skeleton className="mt-1.5 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="card lg:col-span-3">
        <Skeleton className="h-4 w-40" />
        <div className="mt-4 flex h-40 items-end gap-1.5">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="flex-1 rounded-t-lg bg-slate-200/80 animate-pulse" style={{ height: `${30 + ((i * 37) % 60)}%` }} />
          ))}
        </div>
      </div>
      <div className="card lg:col-span-2">
        <Skeleton className="h-4 w-36" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className="h-2 flex-1" />
              <Skeleton className="h-2.5 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5, height = "h-14" }: { rows?: number; height?: string }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`card flex items-center gap-3 ${height}`}>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function InlineSync({ label = "Syncing" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-body shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
      </span>
      {label}…
    </span>
  );
}