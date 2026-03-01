import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Trophy, AlertTriangle, Clock, Info } from "lucide-react";
import { useNotifications, type AppNotification, type NotificationType } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<NotificationType, { icon: typeof Trophy; color: string; bg: string }> = {
  achievement: { icon: Trophy, color: "text-health-good", bg: "bg-health-good/10" },
  risk: { icon: AlertTriangle, color: "text-health-danger", bg: "bg-health-danger/10" },
  reminder: { icon: Clock, color: "text-health-warning", bg: "bg-health-warning/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
};

function NotificationItem({ notification, onRead }: { notification: AppNotification; onRead: () => void }) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <button
      onClick={onRead}
      className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-muted/50 ${
        notification.read ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-2.5">
        <div className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0 mt-0.5`}>
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium text-foreground leading-tight ${!notification.read ? "font-semibold" : ""}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notification.body}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            {formatDistanceToNow(notification.time, { addSuffix: true })}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function NotificationCenter() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll, requestBrowserPermission, browserPermission } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="relative gap-1.5"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] rounded-full bg-health-danger text-[10px] font-bold text-white flex items-center justify-center leading-none px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        <span className="hidden sm:inline">Alerts</span>
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card rounded-xl shadow-card-hover border border-border overflow-hidden z-50 animate-float-up">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-foreground text-sm">Notifications</h3>
              <p className="text-[10px] text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {browserPermission !== "granted" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={requestBrowserPermission}
                  className="text-xs h-7 px-2"
                  title="Enable browser notifications"
                >
                  <Bell className="w-3 h-3 mr-1" />
                  Enable
                </Button>
              )}
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7 px-2" title="Mark all read">
                  <CheckCheck className="w-3.5 h-3.5" />
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7 px-2" title="Clear all">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs h-7 px-2">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Submit health data to receive personalized alerts
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map(n => (
                  <NotificationItem key={n.id} notification={n} onRead={() => markRead(n.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
