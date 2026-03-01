import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RiskCards from "@/components/RiskCards";
import TrendChart from "@/components/TrendChart";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import DataInputForm from "@/components/DataInputForm";
import HealthChatbot from "@/components/HealthChatbot";
import { predictRisk, type BehavioralData, type RiskReport, type WeeklyTrend } from "@/lib/healthEngine";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";

const emptyExplanation = { factors: [], summary: "" };
const emptyReport: RiskReport = {
  heartRisk: 0, depressionRisk: 0, fatigueRisk: 0, lifestyleScore: 0,
  anomalyDetected: false, alerts: [],
  explanations: { heartRisk: emptyExplanation, depressionRisk: emptyExplanation, fatigueRisk: emptyExplanation, lifestyleScore: emptyExplanation },
};

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [report, setReport] = useState<RiskReport | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  // Load latest report and weekly trends from DB
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Latest entry
      const { data: latest } = await supabase
        .from("health_data")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (latest) {
        setReport({
          heartRisk: latest.heart_risk ?? 0,
          depressionRisk: latest.depression_risk ?? 0,
          fatigueRisk: latest.fatigue_risk ?? 0,
          lifestyleScore: latest.lifestyle_score ?? 0,
          anomalyDetected: latest.anomaly_detected ?? false,
          alerts: latest.alerts ?? [],
          explanations: emptyReport.explanations,
        });
      }

      // Last 7 entries for trend
      const { data: history } = await supabase
        .from("health_data")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .gte("date", format(subDays(new Date(), 7), "yyyy-MM-dd"))
        .limit(7);

      if (history && history.length > 0) {
        setWeeklyData(history.map(h => ({
          day: format(new Date(h.date), "EEE"),
          heartRisk: h.heart_risk ?? 0,
          depressionRisk: h.depression_risk ?? 0,
          fatigueRisk: h.fatigue_risk ?? 0,
          lifestyleScore: h.lifestyle_score ?? 0,
          sleepHours: Number(h.sleep_hours),
          steps: h.daily_steps,
        })));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleDataSubmit = async (data: BehavioralData) => {
    if (!user) return;
    const riskReport = predictRisk(data);
    setReport(riskReport);

    const { error } = await supabase.from("health_data").insert({
      user_id: user.id,
      date: data.date,
      sleep_hours: data.sleepHours,
      deep_sleep_percent: data.deepSleepPercent,
      daily_steps: data.dailySteps,
      sedentary_hours: data.sedentaryHours,
      typing_speed: data.typingSpeed,
      voice_stress_score: data.voiceStressScore,
      heart_risk: riskReport.heartRisk,
      depression_risk: riskReport.depressionRisk,
      fatigue_risk: riskReport.fatigueRisk,
      lifestyle_score: riskReport.lifestyleScore,
      anomaly_detected: riskReport.anomalyDetected,
      alerts: riskReport.alerts,
    });

    if (error) {
      toast({ title: "Error saving data", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Data saved!", description: "Your health data has been recorded." });
      // Refresh weekly data
      const { data: history } = await supabase
        .from("health_data")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
        .gte("date", format(subDays(new Date(), 7), "yyyy-MM-dd"))
        .limit(7);
      if (history && history.length > 0) {
        setWeeklyData(history.map(h => ({
          day: format(new Date(h.date), "EEE"),
          heartRisk: h.heart_risk ?? 0,
          depressionRisk: h.depression_risk ?? 0,
          fatigueRisk: h.fatigue_risk ?? 0,
          lifestyleScore: h.lifestyle_score ?? 0,
          sleepHours: Number(h.sleep_hours),
          steps: h.daily_steps,
        })));
      }
    }
  };

  const displayReport = report || emptyReport;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Section */}
        <div className="gradient-hero rounded-xl p-6 sm:p-8 text-primary-foreground animate-float-up">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">Your Health Dashboard</h2>
          <p className="text-primary-foreground/80 text-sm sm:text-base max-w-xl">
            AI-powered analysis of your behavioral patterns to predict early disease risks. 
            Input your daily data below to get personalized insights.
          </p>
        </div>

        {loading ? (
          <div className="bg-card rounded-lg p-8 shadow-card text-center text-muted-foreground animate-pulse">
            Loading your health data...
          </div>
        ) : (
          <>
            {/* Risk Cards */}
            {report ? (
              <RiskCards report={displayReport} />
            ) : (
              <div className="bg-card rounded-lg p-6 shadow-card text-center">
                <p className="text-muted-foreground">No data yet. Submit your first health entry below!</p>
              </div>
            )}

            {/* Input + Chart Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataInputForm onSubmit={handleDataSubmit} />
              {weeklyData.length > 0 ? (
                <TrendChart data={weeklyData} />
              ) : (
                <div className="bg-card rounded-lg p-5 shadow-card flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Submit data over multiple days to see trends</p>
                </div>
              )}
            </div>

            {/* Heatmap */}
            <ActivityHeatmap />
          </>
        )}

        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3 animate-float-up" style={{ animationDelay: '500ms' }}>
          <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Disclaimer:</strong> This system provides risk predictions based on behavioral patterns, not medical diagnosis. 
            Always consult a qualified healthcare professional for medical advice.
          </p>
        </div>
      </main>

      <HealthChatbot />
    </div>
  );
};

export default Index;
