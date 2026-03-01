import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, getDay } from "date-fns";

type HeatmapCell = { hour: number; day: string; value: number };

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const displayDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 17 }, (_, i) => i + 6);

function getColor(value: number): string {
  if (value === 0) return "hsl(var(--muted))";
  if (value < 20) return "hsl(213, 80%, 95%)";
  if (value < 40) return "hsl(213, 80%, 82%)";
  if (value < 60) return "hsl(213, 80%, 65%)";
  if (value < 80) return "hsl(213, 80%, 50%)";
  return "hsl(213, 80%, 38%)";
}

/**
 * Maps a daily_steps count to an approximate hourly activity percentage.
 * We spread the activity across waking hours (6-22) for the day the entry was created.
 */
function stepsToActivity(steps: number): number {
  // 10000 steps ≈ 100% activity for the day
  return Math.min(100, Math.round((steps / 10000) * 100));
}

export default function ActivityHeatmap() {
  const { user } = useAuth();
  const [data, setData] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const sevenDaysAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");

      const { data: entries } = await supabase
        .from("health_data")
        .select("daily_steps, sedentary_hours, date, created_at")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgo)
        .order("created_at", { ascending: false });

      // Build a map: keep only the latest entry per date
      const latestByDate = new Map<string, { daily_steps: number; sedentary_hours: number; created_at: string }>();
      if (entries) {
        for (const e of entries) {
          if (!latestByDate.has(e.date)) {
            latestByDate.set(e.date, e);
          }
        }
      }

      const cells: HeatmapCell[] = [];

      // For each of the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "yyyy-MM-dd");
        const dayName = dayNames[getDay(date)];
        const entry = latestByDate.get(dateStr);

        if (!entry) {
          // No data for this day – all zeros
          for (const hour of hours) {
            cells.push({ hour, day: dayName, value: 0 });
          }
          continue;
        }

        const activity = stepsToActivity(entry.daily_steps);
        const sedentaryRatio = entry.sedentary_hours / 16; // fraction of waking hours sedentary
        const createdHour = new Date(entry.created_at).getHours();

        for (const hour of hours) {
          // Distribute activity: higher around the entry creation time, lower during sedentary hours
          let cellValue = 0;

          // Active hours get activity, sedentary pattern reduces it
          const distFromEntry = Math.abs(hour - createdHour);
          const proximityBoost = Math.max(0, 1 - distFromEntry / 8);

          // Base activity spread across the day, boosted near entry time
          cellValue = Math.round(activity * (0.3 + 0.7 * proximityBoost) * (1 - sedentaryRatio * 0.5));
          cellValue = Math.min(100, Math.max(0, cellValue));

          cells.push({ hour, day: dayName, value: cellValue });
        }
      }

      setData(cells);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-card rounded-lg p-5 shadow-card animate-pulse">
        <h3 className="font-display font-semibold text-foreground mb-4">Activity Heatmap</h3>
        <p className="text-sm text-muted-foreground">Loading activity data...</p>
      </div>
    );
  }

  const hasData = data.some(d => d.value > 0);

  return (
    <div className="bg-card rounded-lg p-5 shadow-card animate-float-up" style={{ animationDelay: '300ms' }}>
      <h3 className="font-display font-semibold text-foreground mb-4">Activity Heatmap</h3>
      {!hasData ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No activity data yet. Submit health entries to see your weekly activity pattern.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="flex gap-1 mb-1 pl-10">
              {hours.filter((_, i) => i % 2 === 0).map(h => (
                <span key={h} className="text-[10px] text-muted-foreground w-[22px] text-center" style={{ marginRight: '22px' }}>
                  {h}:00
                </span>
              ))}
            </div>
            {displayDays.map(day => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <span className="text-xs text-muted-foreground w-8 text-right pr-1">{day}</span>
                {hours.map(hour => {
                  const cell = data.find(d => d.day === day && d.hour === hour);
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="w-[22px] h-[22px] rounded-sm transition-colors duration-200 hover:ring-2 hover:ring-primary/30"
                      style={{ backgroundColor: getColor(cell?.value || 0) }}
                      title={`${day} ${hour}:00 – Activity: ${cell?.value || 0}%`}
                    />
                  );
                })}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-3 pl-10">
              <span className="text-[10px] text-muted-foreground">Less</span>
              {[0, 20, 40, 60, 80].map(v => (
                <div key={v} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(v + 10) }} />
              ))}
              <span className="text-[10px] text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
