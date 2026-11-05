import { Check, Clock, ShieldAlert, UserRound, XCircle } from "lucide-react";

export type BookingTimelineEvent = {
  id: string;
  status: string;
  action?: string | null;
  actorRole: string;
  note?: string | null;
  createdAt: string | Date;
};

const STATUS_STYLE: Record<string, { dot: string; ring: string; icon: typeof Check }> = {
  PENDING: { dot: "bg-accent-400", ring: "ring-accent-100", icon: Clock },
  ASSIGNED: { dot: "bg-primary-500", ring: "ring-primary-100", icon: UserRound },
  ACCEPTED: { dot: "bg-primary-600", ring: "ring-primary-100", icon: Check },
  IN_PROGRESS: { dot: "bg-primary-700", ring: "ring-primary-100", icon: Clock },
  COMPLETED: { dot: "bg-success", ring: "ring-success/20", icon: Check },
  CANCELLED: { dot: "bg-slate-400", ring: "ring-slate-100", icon: XCircle },
  DISPUTED: { dot: "bg-danger", ring: "ring-danger/20", icon: ShieldAlert },
};

function eventLabel(ev: BookingTimelineEvent): string {
  switch (ev.action) {
    case "AGENT_ASSIGNED":
      return "Area agent assigned";
    case "VENDOR_ASSIGNED":
      return "Vendor assigned";
    case "VENDOR_DECLINED":
      return "Vendor declined";
    case "NOTE":
      return "Note added";
    default:
      return ev.status.replace(/_/g, " ");
  }
}

export function BookingTimeline({
  events,
  empty = "No tracking events yet.",
  className = "",
}: {
  events?: BookingTimelineEvent[] | null;
  empty?: string;
  className?: string;
}) {
  const rows = [...(events ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (rows.length === 0) {
    return <p className={`text-xs text-muted ${className}`}>{empty}</p>;
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {rows.map((ev, i) => {
        const style = STATUS_STYLE[ev.status] ?? STATUS_STYLE.PENDING!;
        const Icon = style.icon;
        return (
          <div key={ev.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ring-4 ${style.dot} ${style.ring}`}>
                <Icon size={13} />
              </span>
              {i < rows.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
            </div>
            <div className="min-w-0 pb-4">
              <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-extrabold text-ink">
                {eventLabel(ev)}
                <span className="chip chip-neutral !px-2 !py-0.5 !text-[10px]">{ev.actorRole}</span>
              </p>
              {ev.note ? <p className="mt-0.5 text-xs leading-relaxed text-body">{ev.note}</p> : null}
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                <Clock size={10} />
                {new Date(ev.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
