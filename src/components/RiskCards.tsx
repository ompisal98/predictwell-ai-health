import { Heart, Brain, Battery, Activity, AlertTriangle, Info } from "lucide-react";
import type { RiskReport } from "@/lib/healthEngine";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function getRiskLevel(value: number): { label: string; colorClass: string } {
  if (value < 35) return { label: "Low", colorClass: "text-health-good" };
  if (value < 65) return { label: "Moderate", colorClass: "text-health-warning" };
  return { label: "High", colorClass: "text-health-danger" };
}

function CircularProgress({ value, size = 100, strokeWidth = 8, colorClass }: { value: number; size?: number; strokeWidth?: number; colorClass: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const colorMap: Record<string, string> = {
    "text-health-good": "hsl(152, 60%, 45%)",
    "text-health-warning": "hsl(38, 92%, 55%)",
    "text-health-danger": "hsl(0, 72%, 55%)",
  };
  const strokeColor = colorMap[colorClass] || "hsl(213, 80%, 50%)";

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(210, 20%, 90%)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={strokeColor} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

const riskCards = [
  { key: "heartRisk" as const, label: "Heart Health", icon: Heart, description: "Cardiovascular risk assessment", tooltip: "Based on sedentary hours and daily step count. More sedentary time and fewer steps increase cardiac risk." },
  { key: "depressionRisk" as const, label: "Depression Risk", icon: Brain, description: "Mental health indicator", tooltip: "Driven by sleep deficit, deep sleep percentage, and voice stress score. Poor sleep and high stress raise this risk." },
  { key: "fatigueRisk" as const, label: "Burnout/Fatigue", icon: Battery, description: "Energy & recovery status", tooltip: "Calculated from sleep hours, deep sleep quality, and sedentary behavior. Less restorative sleep increases fatigue risk." },
  { key: "lifestyleScore" as const, label: "Lifestyle Score", icon: Activity, description: "Overall wellness balance", tooltip: "Composite of 4 factors (25 pts each): sleep duration, daily steps, stress level, and sedentary hours. Higher is better." },
];

export default function RiskCards({ report }: { report: RiskReport }) {
  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskCards.map(({ key, label, icon: Icon, description, tooltip }, i) => {
          const value = report[key];
          const isInverse = key === "lifestyleScore";
          const riskValue = isInverse ? 100 - value : value;
          const { label: riskLabel, colorClass } = getRiskLevel(riskValue);
          const displayLabel = isInverse ? (value > 65 ? "Good" : value > 35 ? "Fair" : "Poor") : riskLabel;

          return (
            <div
              key={key}
              className="bg-card rounded-lg p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-float-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px] text-xs">
                      {tooltip}
                    </TooltipContent>
                  </Tooltip>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    riskValue < 35 ? 'bg-health-good/10 text-health-good' :
                    riskValue < 65 ? 'bg-health-warning/10 text-health-warning' :
                    'bg-health-danger/10 text-health-danger'
                  }`}>
                    {displayLabel}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <CircularProgress value={value} size={72} strokeWidth={6} colorClass={isInverse ? getRiskLevel(riskValue).colorClass : colorClass} />
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold font-display text-foreground">
                    {value}%
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {report.alerts.length > 0 && (
        <div className="bg-health-danger/5 border border-health-danger/20 rounded-lg p-4 animate-float-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-health-danger" />
            <h3 className="font-semibold text-health-danger font-display">Health Alerts</h3>
          </div>
          <ul className="space-y-1">
            {report.alerts.map((alert, i) => (
              <li key={i} className="text-sm text-foreground/80">{alert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
