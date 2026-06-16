import { Link } from "react-router-dom";
import { Home } from "lucide-react";

interface Props { page: string; }

export default function ComingSoon({ page }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#D6EAF8" }}>
          <span className="text-3xl">🚧</span>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#1A5276" }}>{page}</h2>
        <p className="text-sm mb-6" style={{ color: "#6C757D" }}>Under construction — coming soon</p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                     text-white hover:text-white transition-opacity hover:opacity-85"
          style={{ background: "linear-gradient(135deg, #2E86C1, #1A5276)" }}
        >
          <Home size={15} /> Go to Homepage
        </Link>
      </div>
    </div>
  );
}
