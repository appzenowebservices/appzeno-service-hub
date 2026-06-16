import { useNavigate } from "react-router-dom";
import { UserCircle, Briefcase, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import PublicLayout from "../components/layout/PublicLayout";

const ROLES = [
  {
    slug:        "customer",
    label:       "Register as Customer",
    icon:        UserCircle,
    description: "Book home services, track orders, manage your household needs.",
    color:       "from-blue-500 to-blue-600",
    bg:          "bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-400",
    iconColor:   "text-blue-600",
    shadow:      "hover:shadow-blue-100",
  },
  {
    slug:        "vendor",
    label:       "Register as Vendor",
    icon:        Briefcase,
    description: "Offer your services, get leads, grow your business with ADDies.",
    color:       "from-emerald-500 to-emerald-600",
    bg:          "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-400",
    iconColor:   "text-emerald-600",
    shadow:      "hover:shadow-emerald-100",
  },
  {
    slug:        "agent",
    label:       "Register as City Agent",
    icon:        Building2,
    description: "Manage vendors, resolve disputes, and grow your city network.",
    color:       "from-violet-500 to-violet-600",
    bg:          "bg-violet-50 hover:bg-violet-100 border-violet-200 hover:border-violet-400",
    iconColor:   "text-violet-600",
    shadow:      "hover:shadow-violet-100",
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex flex-col items-center justify-center px-4 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold tracking-wide uppercase">
          <ShieldCheck size={13} /> Join ADDies ServiceHub
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 mb-2">
          Who are you joining as?
        </h1>
        <p className="text-neutral-500 text-sm max-w-md mx-auto">
          Choose the type of account that best describes you. You can always create multiple accounts.
        </p>
        <p className="mt-8 text-sm text-neutral-400">
        <button onClick={() => navigate("/")} className="text-primary-600 font-semibold hover:underline">
          Go Back Home
        </button>
      </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
        {ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.slug}
              onClick={() => navigate(`/register/${role.slug}`)}
              className={`
                group flex flex-col items-start gap-4 p-6 rounded-2xl border-2
                ${role.bg} ${role.shadow}
                hover:shadow-xl transition-all duration-200 text-left
              `}
            >
              <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm ${role.iconColor}`}>
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 text-base leading-tight mb-1">
                  {role.label}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {role.description}
                </p>
              </div>
              <div className={`mt-auto flex items-center gap-1 text-xs font-semibold ${role.iconColor} group-hover:gap-2 transition-all`}>
                Get Started <ArrowRight size={13} />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-neutral-400">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-primary-600 font-semibold hover:underline">
          Login here
        </button>
      </p>
    </div>
    </PublicLayout>
  );
}
