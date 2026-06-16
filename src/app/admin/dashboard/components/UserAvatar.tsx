// src/pages/admin/dashboard/components/UserAvatar.tsx

const AVATAR_COLORS = [
  "bg-sky-500",    "bg-violet-500", "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500",   "bg-cyan-500",
  "bg-indigo-500", "bg-teal-500",
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface Props {
  name:   string;
  size?:  "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
}

const SIZE_MAP = {
  sm:  { box: "w-8 h-8",   text: "text-xs"  },
  md:  { box: "w-10 h-10", text: "text-sm"  },
  lg:  { box: "w-14 h-14", text: "text-xl"  },
};

export default function UserAvatar({ name, size = "md", shape = "circle" }: Props) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");

  const { box, text } = SIZE_MAP[size];
  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";

  return (
    <div className={`${box} ${radius} ${colorForName(name)}
      flex items-center justify-center text-white font-black flex-shrink-0 select-none`}>
      <span className={text}>{initials}</span>
    </div>
  );
}
