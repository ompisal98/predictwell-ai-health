import { generateHeatmapData } from "@/lib/healthEngine";
import { useMemo } from "react";

function getColor(value: number): string {
  if (value < 20) return "hsl(213, 80%, 95%)";
  if (value < 40) return "hsl(213, 80%, 82%)";
  if (value < 60) return "hsl(213, 80%, 65%)";
  if (value < 80) return "hsl(213, 80%, 50%)";
  return "hsl(213, 80%, 38%)";
}

export default function ActivityHeatmap() {
  const data = useMemo(() => generateHeatmapData(), []);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);

  return (
    <div className="bg-card rounded-lg p-5 shadow-card animate-float-up" style={{ animationDelay: '300ms' }}>
      <h3 className="font-display font-semibold text-foreground mb-4">Activity Heatmap</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="flex gap-1 mb-1 pl-10">
            {hours.filter((_, i) => i % 2 === 0).map(h => (
              <span key={h} className="text-[10px] text-muted-foreground w-[22px] text-center" style={{ marginRight: '22px' }}>
                {h}:00
              </span>
            ))}
          </div>
          {days.map(day => (
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
    </div>
  );
}
