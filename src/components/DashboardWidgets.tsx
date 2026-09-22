import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router";

/* Shared dashboard widget primitives extracted from Dashboard.tsx */

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  actionUrl?: string | null;
};

export function NotificationBell({
  notifications,
  onMarkAllRead,
}: {
  notifications: NotificationItem[] | undefined;
  onMarkAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-[#A1A1AA]" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto rounded-2xl bg-[#18181B] border border-white/10 shadow-2xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 sticky top-0 bg-[#18181B]">
              <p className="text-sm font-semibold text-white">Notifications</p>
              {unread > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="text-[11px] text-[#16A34A] hover:underline cursor-pointer font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            {!notifications || notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-[#A1A1AA]/50">
                No notifications yet — new private feedback will appear here in real time.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setOpen(false);
                    if (!n.read) onMarkAllRead();
                    if (n.actionUrl) navigate(n.actionUrl);
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer ${
                    !n.read ? "bg-[#16A34A]/[0.06]" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#16A34A] mt-1.5 shrink-0 animate-pulse" />}
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${!n.read ? "text-white" : "text-[#A1A1AA]"}`}>{n.title}</p>
                      <p className="text-[11px] text-[#A1A1AA]/70 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-[#A1A1AA]/40 mt-1">
                        {new Date(n.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#18181B]/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-white tabular-nums">{value}</p>
          {sub && <p className="text-xs text-[#A1A1AA]/60 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
    </GlassPanel>
  );
}

export function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload;
    return (
      <div className="bg-[#18181B]/95 backdrop-blur-xl border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-[#A1A1AA] mb-1">{label}</p>
        <p className="text-sm font-bold text-white">Rating Score: {payload[0].value}</p>
        {item && (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-[#16A34A]">+{item.positive} positive</span>
            <span className="text-[10px] text-amber-400">-{item.negative} negative</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}
