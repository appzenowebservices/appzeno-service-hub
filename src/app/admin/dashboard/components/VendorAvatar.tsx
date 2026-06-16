// src/pages/admin/dashboard/components/VendorAvatar.tsx

const COLORS = [
  "bg-sky-500",    "bg-violet-500", "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500",   "bg-cyan-500",
  "bg-indigo-500", "bg-teal-500",   "bg-orange-500",
];

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

interface Props {
  name:  string;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { box: "w-8 h-8",   text: "text-xs",  radius: "rounded-xl" },
  md: { box: "w-11 h-11", text: "text-base", radius: "rounded-xl" },
  lg: { box: "w-14 h-14", text: "text-xl",  radius: "rounded-2xl" },
};

export default function VendorAvatar({ name, size = "md" }: Props) {
  const initial = name.charAt(0).toUpperCase();
  const { box, text, radius } = SIZES[size];
  return (
    <div className={`${box} ${radius} ${colorFor(name)}
      flex items-center justify-center text-white font-black flex-shrink-0 select-none`}>
      <span className={text}>{initial}</span>
    </div>
  );
}
