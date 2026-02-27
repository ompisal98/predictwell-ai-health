import { useState } from "react";
import { Moon, Footprints, Timer, Keyboard, Mic, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BehavioralData } from "@/lib/healthEngine";

interface Props {
  onSubmit: (data: BehavioralData) => void;
}

const fields = [
  { key: "sleepHours", label: "Sleep Hours", icon: Moon, min: 0, max: 14, step: 0.5, default: 7 },
  { key: "deepSleepPercent", label: "Deep Sleep %", icon: Moon, min: 0, max: 100, step: 1, default: 20 },
  { key: "dailySteps", label: "Daily Steps", icon: Footprints, min: 0, max: 30000, step: 500, default: 8000 },
  { key: "sedentaryHours", label: "Sedentary Hours", icon: Timer, min: 0, max: 20, step: 0.5, default: 6 },
  { key: "typingSpeed", label: "Typing Speed (WPM)", icon: Keyboard, min: 0, max: 200, step: 5, default: 60 },
  { key: "voiceStressScore", label: "Voice Stress (0-100)", icon: Mic, min: 0, max: 100, step: 1, default: 30 },
] as const;

export default function DataInputForm({ onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(fields.map(f => [f.key, f.default]))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: new Date().toISOString().split('T')[0],
      sleepHours: values.sleepHours,
      deepSleepPercent: values.deepSleepPercent,
      dailySteps: values.dailySteps,
      sedentaryHours: values.sedentaryHours,
      typingSpeed: values.typingSpeed,
      voiceStressScore: values.voiceStressScore,
    });
  };

  return (
    <div className="bg-card rounded-lg p-5 shadow-card animate-float-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Daily Health Input</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ key, label, icon: Icon, min, max, step }) => (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                {label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min={min} max={max} step={step}
                  value={values[key]}
                  onChange={e => setValues(v => ({ ...v, [key]: parseFloat(e.target.value) }))}
                  className="flex-1 h-2 rounded-full appearance-none bg-muted accent-primary cursor-pointer"
                />
                <span className="text-sm font-semibold text-foreground w-14 text-right tabular-nums">
                  {values[key].toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
        <Button type="submit" className="w-full">
          Analyze Health Data
        </Button>
      </form>
    </div>
  );
}
