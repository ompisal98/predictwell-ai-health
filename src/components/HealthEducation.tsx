import { useMemo } from "react";
import {
  Lightbulb, Moon, Footprints, Brain, Heart, Flame, Droplets,
  Clock, Sparkles, ShieldCheck, ArrowRight, Zap,
} from "lucide-react";
import type { RiskReport } from "@/lib/healthEngine";

interface Tip {
  icon: typeof Lightbulb;
  title: string;
  body: string;
  action: string;
  category: "sleep" | "activity" | "stress" | "heart" | "general";
}

const allTips: Tip[] = [
  // Sleep
  { icon: Moon, title: "Sleep Debt Compounds", body: "Losing even 1 hour of sleep nightly accumulates into significant cognitive decline over a week. Your brain needs 7-9 hours to consolidate memories and repair neural pathways.", action: "Set a fixed bedtime alarm 8 hours before your wake-up time.", category: "sleep" },
  { icon: Clock, title: "Deep Sleep Window", body: "Most deep sleep occurs in the first half of the night. Going to bed before midnight maximizes restorative sleep phases critical for immune function.", action: "Aim to be asleep by 11 PM for optimal deep sleep cycles.", category: "sleep" },
  { icon: Moon, title: "Screen Light Disruption", body: "Blue light from screens suppresses melatonin production by up to 50%, delaying sleep onset by 30+ minutes even after you put your device down.", action: "Enable night mode and stop screens 60 minutes before bed.", category: "sleep" },

  // Activity
  { icon: Footprints, title: "Steps & Heart Health", body: "Research shows that every 2,000 daily steps reduces cardiovascular risk by 8%. The benefits are most dramatic going from 2,000 to 7,000 steps.", action: "Take a 10-minute walk after each meal to add ~3,000 steps.", category: "activity" },
  { icon: Flame, title: "Break the Sitting Chain", body: "Sitting for more than 8 hours doubles your risk of cardiovascular events. Even 5-minute movement breaks every hour significantly reduce this risk.", action: "Set hourly reminders to stand, stretch, or walk for 2-5 minutes.", category: "activity" },
  { icon: Zap, title: "Exercise Timing Matters", body: "Morning exercise boosts mood and focus for 4-6 hours. Evening exercise improves sleep quality but should end 2+ hours before bedtime.", action: "Try a 20-minute morning walk to boost your entire day.", category: "activity" },

  // Stress
  { icon: Brain, title: "Stress-Sleep Spiral", body: "High stress raises cortisol, which disrupts sleep. Poor sleep then increases stress sensitivity the next day, creating a downward spiral that compounds daily.", action: "Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s before bed.", category: "stress" },
  { icon: Sparkles, title: "Micro-Recovery Moments", body: "Just 2 minutes of focused breathing reduces cortisol levels by up to 25%. You don't need long meditation sessions to see real physiological benefits.", action: "Take 3 deep breaths before each meal — a simple daily anchor.", category: "stress" },
  { icon: Brain, title: "Nature's Anti-Stress", body: "Spending 20 minutes in nature reduces cortisol by 28% more than the same time spent in urban settings. Even looking at nature photos has measurable effects.", action: "Take one daily break outdoors, even for just 10 minutes.", category: "stress" },

  // Heart
  { icon: Heart, title: "Resting Heart Rate", body: "A resting heart rate above 80 bpm is associated with higher cardiovascular risk. Regular aerobic exercise can lower it by 10-20 bpm over months.", action: "Check your resting heart rate each morning before getting up.", category: "heart" },
  { icon: Droplets, title: "Hydration & Blood Flow", body: "Even mild dehydration (1-2%) thickens blood and forces the heart to work harder. Most people are chronically under-hydrated without realizing it.", action: "Drink a full glass of water within 30 minutes of waking.", category: "heart" },
  { icon: Heart, title: "The Laughter Effect", body: "Genuine laughter increases blood flow by 22% for up to 45 minutes — comparable to a light workout. It also releases endorphins that lower blood pressure.", action: "Watch something funny during your lunch break daily.", category: "heart" },

  // General
  { icon: ShieldCheck, title: "Consistency > Intensity", body: "Walking 30 minutes daily provides 90% of the health benefits of intense exercise. Sustainable habits beat sporadic extreme efforts every time.", action: "Pick one small health habit and do it every day for 2 weeks.", category: "general" },
  { icon: Lightbulb, title: "Track to Transform", body: "People who regularly track health metrics improve 2x faster. Awareness of patterns is the first step to meaningful behavioral change.", action: "Log your data here daily — even imperfect data helps.", category: "general" },
];

function getRelevantTips(report: RiskReport | null): Tip[] {
  if (!report) {
    // No data: return general tips
    return allTips.filter(t => t.category === "general").slice(0, 3);
  }

  const prioritized: Tip[] = [];
  const used = new Set<number>();

  const addFromCategory = (cat: string, count: number) => {
    const candidates = allTips
      .map((t, i) => ({ ...t, idx: i }))
      .filter(t => t.category === cat && !used.has(t.idx));
    for (const c of candidates.slice(0, count)) {
      prioritized.push(c);
      used.add(c.idx);
    }
  };

  // Prioritize categories based on risk scores
  const risks = [
    { cat: "heart", score: report.heartRisk },
    { cat: "stress", score: report.depressionRisk },
    { cat: "sleep", score: report.fatigueRisk },
    { cat: "activity", score: 100 - report.lifestyleScore },
  ].sort((a, b) => b.score - a.score);

  // Top risk gets 2 tips, second gets 2, then 1 general and 1 from third
  addFromCategory(risks[0].cat, 2);
  addFromCategory(risks[1].cat, 2);
  addFromCategory(risks[2].cat, 1);
  addFromCategory("general", 1);

  return prioritized.slice(0, 6);
}

const categoryColors: Record<string, { bg: string; text: string; label: string }> = {
  sleep: { bg: "bg-[hsl(260,60%,55%)]/10", text: "text-[hsl(260,60%,55%)]", label: "Sleep" },
  activity: { bg: "bg-health-good/10", text: "text-health-good", label: "Activity" },
  stress: { bg: "bg-health-warning/10", text: "text-health-warning", label: "Stress" },
  heart: { bg: "bg-health-danger/10", text: "text-health-danger", label: "Heart" },
  general: { bg: "bg-primary/10", text: "text-primary", label: "General" },
};

export default function HealthEducation({ report }: { report: RiskReport | null }) {
  const tips = useMemo(() => getRelevantTips(report), [report]);

  return (
    <div className="bg-card rounded-lg p-5 shadow-card animate-float-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Health Insights & Tips</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Personalized recommendations based on your risk patterns
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tips.map((tip, i) => {
          const cat = categoryColors[tip.category];
          const Icon = tip.icon;
          return (
            <div
              key={i}
              className="group rounded-lg border border-border p-4 hover:shadow-card transition-all duration-300 hover:border-primary/20"
            >
              {/* Header */}
              <div className="flex items-start gap-2.5 mb-2">
                <div className={`p-1.5 rounded-lg ${cat.bg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${cat.text}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground leading-tight">{tip.title}</h4>
                  </div>
                  <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1 ${cat.bg} ${cat.text}`}>
                    {cat.label}
                  </span>
                </div>
              </div>

              {/* Body */}
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {tip.body}
              </p>

              {/* Action Step */}
              <div className="flex items-start gap-1.5 bg-primary/5 rounded-md p-2">
                <ArrowRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-medium text-primary leading-snug">
                  {tip.action}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
