import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center font-sans">
      <p className="eyebrow">403 • Access denied</p>
      <h1 className="h-display mt-3">Ye area aapke role ke liye nahi hai</h1>
      <p className="sub mt-3 max-w-md">Customer → /customer, Vendor → /vendor, Agent → /agent, Super Admin → /admin. Sahi account se login karein.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/auth/login" className="btn-primary">Go to login</Link>
        <Link href="/" className="btn-ghost">Home</Link>
      </div>
    </div>
  );
}
