import Link from "next/link";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">ADDies</Link>
        <nav className="flex gap-6">
          <Link href="/services" className="hover:text-primary">Services</Link>
          <Link href="/directory" className="hover:text-primary">Vendors</Link>
          <Link href="/how-it-works" className="hover:text-primary">How It Works</Link>
        </nav>
        <div className="flex gap-2">
          <Link href="/auth/login" className="px-4 py-2 text-primary border border-primary rounded-full hover:bg-primary/10">Login</Link>
          <Link href="/auth/register" className="px-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90">Sign Up</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Trusted Service Providers</h1>
          <p className="text-slate-600 mb-6">Connect with verified vendors in your city for all your service needs.</p>
          <Link href="/services" className="inline-block px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary/90">
            Find Services
          </Link>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <Link key={i} href={`/services`} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="text-3xl mb-2">🔧</div>
              <p className="text-sm font-medium">Service {i}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}