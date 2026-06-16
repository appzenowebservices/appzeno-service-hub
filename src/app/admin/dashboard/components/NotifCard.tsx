// src/pages/admin/dashboard/components/NotifCard.tsx

import { Archive, RotateCcw, ExternalLink } from "lucide-react";
import type { AdminNotification } from "../mockAdminData";
import { PriorityBadge, CategoryBadge } from "./NotifBadge";

interface Props {
  notif:       AdminNotification;
  onMarkRead:  (id: string) => void;
  onArchive:   (id: string) => void;
  onUnarchive: (id: string) => void;
  onNavigate:  (tab: string) => void;
}

const PRIORITY_LEFT_BORDER: Record<string, string> = {
  urgent: "border-l-4 border-l-red-400",
  high:   "border-l-4 border-l-amber-400",
  normal: "border-l-4 border-l-sky-300",
  low:    "border-l-4 border-l-slate-200",
};

export default function NotifCard({ notif: n, onMarkRead, onArchive, onUnarchive, onNavigate }: Props) {
  const isUnread   = n.status === "unread";
  const isArchived = n.status === "archived";

  return (
    <div
      onClick={() => isUnread && onMarkRead(n.id)}
      className={`bg-white rounded-2xl border ${PRIORITY_LEFT_BORDER[n.priority]}
        p-4 transition-all hover:shadow-md cursor-default group
        ${isUnread    ? "border-slate-200 shadow-sm" : "border-slate-100 opacity-80"}
        ${isArchived  ? "opacity-60" : ""}`}>

      <div className="flex items-start gap-3">
        {/* Icon + unread dot */}
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
            ${isUnread ? "bg-slate-50" : "bg-slate-50"}`}>
            {n.icon}
          </div>
          {isUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm leading-snug ${isUnread ? "font-black text-slate-800" : "font-semibold text-slate-600"}`}>
              {n.title}
            </p>
            <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{n.time}</span>
          </div>

          {/* Body */}
          <p className="text-xs text-slate-500 leading-relaxed mb-2 line-clamp-2">{n.body}</p>

          {/* Meta + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <CategoryBadge category={n.category} />
            <PriorityBadge priority={n.priority} pulse={isUnread} />
            <span className="text-xs text-slate-400">{n.meta}</span>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2">
            {n.actionLabel && n.actionTab && (
              <button
                onClick={e => { e.stopPropagation(); onNavigate(n.actionTab!); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 text-white
                  text-xs font-bold hover:bg-sky-700 transition-colors">
                <ExternalLink size={11} />
                {n.actionLabel}
              </button>
            )}
            {isUnread && (
              <button
                onClick={e => { e.stopPropagation(); onMarkRead(n.id); }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold
                  text-slate-500 hover:bg-slate-50 transition-colors">
                Mark Read
              </button>
            )}
            {!isArchived ? (
              <button
                onClick={e => { e.stopPropagation(); onArchive(n.id); }}
                className="ml-auto p-1.5 rounded-xl text-slate-300 hover:text-slate-500
                  hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-all">
                <Archive size={14} />
              </button>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); onUnarchive(n.id); }}
                className="ml-auto p-1.5 rounded-xl text-slate-300 hover:text-sky-500
                  hover:bg-sky-50 opacity-0 group-hover:opacity-100 transition-all">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
