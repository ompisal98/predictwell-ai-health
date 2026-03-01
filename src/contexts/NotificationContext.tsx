import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { RiskReport } from "@/lib/healthEngine";

export type NotificationType = "achievement" | "risk" | "reminder" | "info";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: Date;
  read: boolean;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "time" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  requestBrowserPermission: () => Promise<boolean>;
  browserPermission: NotificationPermission | "default";
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

const STORAGE_KEY = "predictwell_notifications";

function loadStored(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((n: any) => ({ ...n, time: new Date(n.time) }));
  } catch { return []; }
}

function saveStored(notifications: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadStored);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  useEffect(() => { saveStored(notifications); }, [notifications]);

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "time" | "read">) => {
    const newNotif: AppNotification = {
      ...n,
      id: crypto.randomUUID(),
      time: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotif, ...prev].slice(0, 50));

    // Send browser notification if permitted
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        const icon = n.type === "achievement" ? "🏆" : n.type === "risk" ? "⚠️" : n.type === "reminder" ? "🔔" : "💡";
        new Notification(`${icon} ${n.title}`, { body: n.body, icon: "/favicon.ico" });
      } catch { /* browser may block */ }
    }
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return false;
    const result = await Notification.requestPermission();
    setBrowserPermission(result);
    return result === "granted";
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, addNotification, markRead, markAllRead, clearAll,
      requestBrowserPermission, browserPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

// --- Smart Notification Triggers ---

export function generateHealthNotifications(
  currentReport: RiskReport,
  previousReport: RiskReport | null,
  addNotification: NotificationContextValue["addNotification"],
) {
  // Goal Achievements
  if (currentReport.lifestyleScore >= 80) {
    addNotification({
      type: "achievement",
      title: "Lifestyle Score Above 80!",
      body: `Your lifestyle score hit ${currentReport.lifestyleScore}%. You're maintaining excellent habits across sleep, activity, and stress management.`,
    });
  }

  if (currentReport.heartRisk < 35 && currentReport.depressionRisk < 35 && currentReport.fatigueRisk < 35) {
    addNotification({
      type: "achievement",
      title: "All Risks Low!",
      body: "All your health risk scores are in the low range. Outstanding work on maintaining healthy behaviors!",
    });
  }

  // Risk Trend Changes (compare with previous)
  if (previousReport) {
    const heartDelta = currentReport.heartRisk - previousReport.heartRisk;
    const depressionDelta = currentReport.depressionRisk - previousReport.depressionRisk;
    const fatigueDelta = currentReport.fatigueRisk - previousReport.fatigueRisk;

    if (heartDelta >= 15) {
      addNotification({
        type: "risk",
        title: "Heart Risk Increasing",
        body: `Your heart risk rose by ${heartDelta}% since your last entry. Consider increasing daily steps and reducing sedentary time.`,
      });
    } else if (heartDelta <= -15) {
      addNotification({
        type: "achievement",
        title: "Heart Risk Improving!",
        body: `Your heart risk dropped by ${Math.abs(heartDelta)}%. Your activity improvements are paying off!`,
      });
    }

    if (depressionDelta >= 15) {
      addNotification({
        type: "risk",
        title: "Depression Risk Rising",
        body: `Depression risk increased by ${depressionDelta}%. Focus on sleep quality and stress-reduction techniques.`,
      });
    } else if (depressionDelta <= -15) {
      addNotification({
        type: "achievement",
        title: "Mental Health Improving!",
        body: `Depression risk dropped by ${Math.abs(depressionDelta)}%. Your sleep and stress habits are making a difference.`,
      });
    }

    if (fatigueDelta >= 15) {
      addNotification({
        type: "risk",
        title: "Fatigue Risk Climbing",
        body: `Fatigue risk went up by ${fatigueDelta}%. Prioritize getting 7+ hours of sleep with good deep sleep quality.`,
      });
    }

    const lifeDelta = currentReport.lifestyleScore - previousReport.lifestyleScore;
    if (lifeDelta >= 10) {
      addNotification({
        type: "achievement",
        title: "Lifestyle Score Gaining!",
        body: `Your lifestyle score improved by ${lifeDelta} points. Keep building on these positive habits!`,
      });
    }
  }

  // Alert-based notifications
  if (currentReport.anomalyDetected) {
    addNotification({
      type: "risk",
      title: "Anomaly Detected",
      body: "Your behavioral pattern today deviates significantly from your baseline. Review your data and consider consulting a health professional.",
    });
  }

  // Habit Reminders based on patterns
  if (currentReport.heartRisk >= 65) {
    addNotification({
      type: "reminder",
      title: "Movement Reminder",
      body: "Your heart risk is elevated. Try a 15-minute walk now or set hourly stand-up reminders to break sedentary patterns.",
    });
  }

  if (currentReport.fatigueRisk >= 65) {
    addNotification({
      type: "reminder",
      title: "Sleep Hygiene Reminder",
      body: "Fatigue risk is high. Tonight, try dimming lights 1 hour before bed and avoiding caffeine after 2 PM.",
    });
  }

  if (currentReport.depressionRisk >= 65) {
    addNotification({
      type: "reminder",
      title: "Stress Relief Reminder",
      body: "Mental health risk is elevated. Take 5 minutes for deep breathing: inhale 4s, hold 7s, exhale 8s. Repeat 4 times.",
    });
  }
}
