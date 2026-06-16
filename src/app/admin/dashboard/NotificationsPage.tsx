// src/pages/admin/dashboard/NotificationsPage.tsx

import { useState, useMemo } from "react";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import {
  ADMIN_NOTIFICATIONS,
  type AdminNotification,
  type NotifCategory,
  type NotifPriority,
} from "./mockAdminData";

import NotifStatsBar  from "./components/NotifStatsBar";
import NotifFilterBar from "./components/NotifFilterBar";
import NotifCard      from "./components/NotifCard";

type StatusFilter = "all" | "unread" | "read" | "archived";

interface Props {
  onNavigate?: (tab: string) => void;
}

export default function NotificationsPage({ onNavigate }: Props) {
  const [notifs,    setNotifs]    = useState<AdminNotification[]>(ADMIN_NOTIFICATIONS);
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState<StatusFilter>("all");
  const [category,  setCategory]  = useState<NotifCategory | "all">("all");
  const [priority,  setPriority]  = useState<NotifPriority | "all">("all");
  const [toast,     setToast]     = useState<string | null>(null);

  // ── Actions ──────────────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: "read" } : n));
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => n.status === "unread" ? { ...n, status: "read" } : n));
    showToast("All notifications marked as read");
  }

  function archive(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: "archived" } : n));
  }

  function unarchive(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: "read" } : n));
  }

  function clearAll() {
    setNotifs(prev => prev.map(n => ({ ...n, status: "archived" as const })));
    showToast("All notifications archived");
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notifs
      .filter(n => {
        if (search && !n.title.toLowerCase().includes(q) &&
          !n.body.toLowerCase().includes(q) && !n.meta.toLowerCase().includes(q)) return false;
        if (status   !== "all" && n.status   !== status)   return false;
        if (category !== "all" && n.category !== category) return false;
        if (priority !== "all" && n.priority !== priority) return false;
        return true;
      })
      .sort((a, b) => {
        // Sort: unread first, then by priority, then by timestamp desc
        if (a.status === "unread" && b.status !== "unread") return -1;
        if (b.status === "unread" && a.status !== "unread") return 1;
        const P: Record<NotifPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
        if (P[a.priority] !== P[b.priority]) return P[a.priority] - P[b.priority];
        return b.timestamp.localeCompare(a.timestamp);
      });
  }, [notifs, search, status, category, priority]);

  const unreadCount = notifs.filter(n => n.status === "unread").length;

  // Group by date for display
  const today     = filtered.filter(n => n.time.includes("min") || n.time.includes("hr") || n.time === "Just now");
  const yesterday = filtered.filter(n => n.time === "Yesterday");
  const older     = filtered.filter(n => n.time.includes("days ago") || n.time.includes("week"));

  function renderGroup(label: string, items: AdminNotification[]) {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">{label}</p>
        <div className="space-y-3">
          {items.map(n => (
            <NotifCard
              key={n.id}
              notif={n}
              onMarkRead={markRead}
              onArchive={archive}
              onUnarchive={unarchive}
              onNavigate={tab => onNavigate?.(tab)}
            />
          ))}
        </div>
      </div>
    );
  }

  const showUngrouped = search || status !== "all" || category !== "all" || priority !== "all";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-800">Notifications</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Stay on top of disputes, payouts, vendor alerts and platform activity
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 text-white
                text-xs font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-200">
              <CheckCheck size={13} />
              Mark All Read
            </button>
          )}
          <button onClick={clearAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200
              text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <BellOff size={13} />
            Archive All
          </button>
        </div>
      </div>

      {/* Stats */}
      <NotifStatsBar notifications={notifs} />

      {/* Urgent banner */}
      {notifs.filter(n => n.priority === "urgent" && n.status === "unread").length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4
          flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-black text-red-800">
              🚨 {notifs.filter(n => n.priority === "urgent" && n.status === "unread").length} Urgent Notification{notifs.filter(n => n.priority === "urgent" && n.status === "unread").length > 1 ? "s" : ""} — Immediate Action Required
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Escalated disputes and critical vendor flags need your attention now
            </p>
          </div>
          <button
            onClick={() => { setStatus("unread"); setPriority("urgent"); }}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold
              hover:bg-red-700 transition-colors shadow-md shadow-red-200 flex-shrink-0">
            View Urgent
          </button>
        </div>
      )}

      {/* Filters */}
      <NotifFilterBar
        search={search}    onSearch={setSearch}
        status={status}    onStatus={setStatus}
        category={category} onCategory={setCategory}
        priority={priority} onPriority={setPriority}
      />

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          Showing <strong className="text-slate-700">{filtered.length}</strong> notifications
          {unreadCount > 0 && <span className="ml-2 text-sky-600 font-bold">· {unreadCount} unread</span>}
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center">
          <Bell size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-black text-slate-500">No notifications</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters.</p>
        </div>
      ) : showUngrouped ? (
        <div className="space-y-3">
          {filtered.map(n => (
            <NotifCard key={n.id} notif={n}
              onMarkRead={markRead} onArchive={archive}
              onUnarchive={unarchive} onNavigate={tab => onNavigate?.(tab)} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {renderGroup("Today", today)}
          {renderGroup("Yesterday", yesterday)}
          {renderGroup("Earlier", older)}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]
          bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl
          flex items-center gap-2 whitespace-nowrap">
          <CheckCheck size={15} className="text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
