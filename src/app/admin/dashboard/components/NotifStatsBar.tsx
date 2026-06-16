// src/pages/admin/dashboard/components/NotifStatsBar.tsx

import { Bell, AlertTriangle, CheckCircle2, Archive } from "lucide-react";
import type { AdminNotification } from "../mockAdminData";

interface Props { notifications: AdminNotification[] }

export default function NotifStatsBar({ notifications }: Props) {
  const unread   = notifications.filter(n => n.status === "unread").length;
  const urgent   = notifications.filter(n => n.priority === "urgent" && n.status === "unread").length;
  const archived = notifications.filter(n => n.status === "archived").length;
  const read     = notifications.filter(n => n.status === "read").length;

  const cards = [
    { label: "Unread",   value: unread,   icon: Bell,          color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-200"    },
    { label: "Urgent",   value: urgent,   icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200"    },
    { label: "Read",     value: read,     icon: CheckCircle2,  color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200"},
    { label: "Archived", value: archived, icon: Archive,       color: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-200"  },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div key={label}
          className={`bg-white rounded-2xl border-2 ${border} px-4 py-3
            flex items-center gap-3 hover:shadow-md transition-shadow`}>
          <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={16} className={color} />
          </div>
          <div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
