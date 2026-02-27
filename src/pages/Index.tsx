import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import RiskCards from "@/components/RiskCards";
import TrendChart from "@/components/TrendChart";
import ActivityHeatmap from "@/components/ActivityHeatmap";
import DataInputForm from "@/components/DataInputForm";
import HealthChatbot from "@/components/HealthChatbot";
import { predictRisk, generateWeeklyTrends, type BehavioralData, type RiskReport } from "@/lib/healthEngine";
import { AlertTriangle } from "lucide-react";

const defaultReport: RiskReport = {
  heartRisk: 42, depressionRisk: 35, fatigueRisk: 58, lifestyleScore: 62,
  anomalyDetected: false, alerts: [],
};

const Index = () => {
  const [report, setReport] = useState<RiskReport>(defaultReport);
  const weeklyData = useMemo(() => generateWeeklyTrends(), []);

  const handleDataSubmit = (data: BehavioralData) => {
    setReport(predictRisk(data));
  };

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

        {/* Risk Cards */}
        <RiskCards report={report} />

        {/* Input + Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataInputForm onSubmit={handleDataSubmit} />
          <TrendChart data={weeklyData} />
        </div>

        {/* Heatmap */}
        <ActivityHeatmap />

        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3 animate-float-up" style={{ animationDelay: '500ms' }}>
          <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Disclaimer:</strong> This system provides risk predictions based on behavioral patterns, not medical diagnosis. 
              Always consult a qualified healthcare professional for medical advice. No raw voice recordings are stored — only aggregated stress scores. 
              Your data is processed locally and never shared with third parties.
            </p>
          </div>
        </div>
      </main>

      {/* Chatbot */}
      <HealthChatbot />
    </div>
  );
};

export default Index;
