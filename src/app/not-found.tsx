import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center font-sans">
      <p className="eyebrow">404 • Page nahi mili</p>
      <h1 className="h-display mt-3">Arrey! Ye raasta ledger mein nahi hai</h1>
      <p className="sub mt-3 max-w-md">Link purana ho sakta hai ya page move ho gaya. Services ya home se restart karein.</p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link href="/" className="btn-primary">Wapas Home →</Link>
        <Link href="/services" className="btn-ghost">Browse services</Link>
      </div>
      <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.3em] text-muted">Error • NULL_ENTRY_404</p>
    </div>
  );
}
