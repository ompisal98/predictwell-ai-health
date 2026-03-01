// Mock health data engine - simulates AI predictions
export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  weight: number;
  lifestyleType: string;
}

export interface BehavioralData {
  date: string;
  sleepHours: number;
  deepSleepPercent: number;
  dailySteps: number;
  sedentaryHours: number;
  typingSpeed: number;
  voiceStressScore: number;
}

export interface RiskExplanation {
  factors: { label: string; impact: "high" | "moderate" | "low" | "positive"; detail: string }[];
  summary: string;
}

export interface RiskReport {
  heartRisk: number;
  depressionRisk: number;
  fatigueRisk: number;
  lifestyleScore: number;
  anomalyDetected: boolean;
  alerts: string[];
  explanations: {
    heartRisk: RiskExplanation;
    depressionRisk: RiskExplanation;
    fatigueRisk: RiskExplanation;
    lifestyleScore: RiskExplanation;
  };
}

export interface WeeklyTrend {
  day: string;
  heartRisk: number;
  depressionRisk: number;
  fatigueRisk: number;
  lifestyleScore: number;
  sleepHours: number;
  steps: number;
}

// Generate synthetic weekly data
export function generateWeeklyTrends(): WeeklyTrend[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    heartRisk: Math.floor(30 + Math.random() * 45),
    depressionRisk: Math.floor(20 + Math.random() * 50),
    fatigueRisk: Math.floor(35 + Math.random() * 45),
    lifestyleScore: Math.floor(40 + Math.random() * 40),
    sleepHours: +(5 + Math.random() * 4).toFixed(1),
    steps: Math.floor(2000 + Math.random() * 10000),
  }));
}

// Deterministic hash-like seed from data for slight variation without randomness
function dataFingerprint(data: BehavioralData): number {
  return ((data.sleepHours * 7 + data.dailySteps * 3 + data.voiceStressScore * 11 + data.sedentaryHours * 13) % 10);
}

// Simulate AI risk prediction — deterministic: same inputs always produce same outputs
export function predictRisk(data: BehavioralData): RiskReport {
  const alerts: string[] = [];
  const fp = dataFingerprint(data);

  // Anomaly detection (simulated Isolation Forest)
  const anomalyScore =
    (data.sleepHours < 5 ? 0.3 : 0) +
    (data.voiceStressScore > 70 ? 0.3 : 0) +
    (data.dailySteps < 3000 ? 0.2 : 0) +
    (data.sedentaryHours > 10 ? 0.2 : 0);
  const anomalyDetected = anomalyScore > 0.5;

  // Heart risk
  const heartRisk = Math.min(100, Math.max(0, Math.floor(
    15 + (data.sedentaryHours * 4) + Math.max(0, (10000 - data.dailySteps) / 200) + fp * 0.5
  )));

  // Depression risk
  const depressionRisk = Math.min(100, Math.max(0, Math.floor(
    5 + Math.max(0, (7 - data.sleepHours) * 10) + data.voiceStressScore * 0.5 + Math.max(0, (20 - data.deepSleepPercent)) * 0.5
  )));

  // Fatigue risk
  const fatigueRisk = Math.min(100, Math.max(0, Math.floor(
    10 + Math.max(0, (7 - data.sleepHours) * 12) + Math.max(0, (25 - data.deepSleepPercent)) * 0.4 + data.sedentaryHours * 2.5
  )));

  // Lifestyle score
  const sleepScore = Math.min(25, (data.sleepHours / 8) * 25);
  const activityScore = Math.min(25, (data.dailySteps / 10000) * 25);
  const stressScore = Math.min(25, ((100 - data.voiceStressScore) / 100) * 25);
  const sedentaryScore = Math.min(25, ((16 - data.sedentaryHours) / 16) * 25);
  const lifestyleScore = Math.min(100, Math.max(0, Math.floor(sleepScore + activityScore + stressScore + sedentaryScore)));

  if (data.sleepHours < 5) alerts.push('⚠️ Critical: Sleep below 5 hours – risk of cognitive impairment.');
  if (data.voiceStressScore > 70) alerts.push('⚠️ High stress detected – consider relaxation techniques.');
  if (data.dailySteps < 3000) alerts.push('⚠️ Activity critically low – aim for at least 7,000 steps.');
  if (anomalyDetected) alerts.push('🚨 Anomaly detected – pattern deviates significantly from baseline.');

  // --- Explainable AI Insights ---
  const heartExplanation = buildHeartExplanation(data);
  const depressionExplanation = buildDepressionExplanation(data);
  const fatigueExplanation = buildFatigueExplanation(data);
  const lifestyleExplanation = buildLifestyleExplanation(data, sleepScore, activityScore, stressScore, sedentaryScore);

  return {
    heartRisk, depressionRisk, fatigueRisk, lifestyleScore, anomalyDetected, alerts,
    explanations: {
      heartRisk: heartExplanation,
      depressionRisk: depressionExplanation,
      fatigueRisk: fatigueExplanation,
      lifestyleScore: lifestyleExplanation,
    },
  };
}

function impactLevel(contribution: number, thresholds: [number, number]): "high" | "moderate" | "low" | "positive" {
  if (contribution <= 0) return "positive";
  if (contribution >= thresholds[1]) return "high";
  if (contribution >= thresholds[0]) return "moderate";
  return "low";
}

function buildHeartExplanation(data: BehavioralData): RiskExplanation {
  const sedentaryContrib = data.sedentaryHours * 4;
  const stepsContrib = Math.max(0, (10000 - data.dailySteps) / 200);
  const factors: RiskExplanation["factors"] = [];

  factors.push({
    label: "Sedentary Hours",
    impact: impactLevel(sedentaryContrib, [16, 32]),
    detail: data.sedentaryHours >= 8
      ? `${data.sedentaryHours}h sedentary – significantly elevates cardiac risk`
      : data.sedentaryHours >= 5
      ? `${data.sedentaryHours}h sedentary – moderate contribution to risk`
      : `${data.sedentaryHours}h sedentary – within healthy range`,
  });

  factors.push({
    label: "Daily Steps",
    impact: data.dailySteps >= 10000 ? "positive" : impactLevel(stepsContrib, [15, 30]),
    detail: data.dailySteps >= 10000
      ? `${data.dailySteps.toLocaleString()} steps – excellent activity level`
      : data.dailySteps >= 7000
      ? `${data.dailySteps.toLocaleString()} steps – good, aim for 10,000`
      : `${data.dailySteps.toLocaleString()} steps – low activity increases heart risk`,
  });

  const topFactor = sedentaryContrib > stepsContrib ? "prolonged sedentary time" : "insufficient daily steps";
  return {
    factors,
    summary: sedentaryContrib + stepsContrib < 20
      ? "Your cardiovascular indicators look healthy. Keep up the active lifestyle!"
      : `Primary driver: ${topFactor}. Increasing movement can significantly lower this score.`,
  };
}

function buildDepressionExplanation(data: BehavioralData): RiskExplanation {
  const sleepContrib = Math.max(0, (7 - data.sleepHours) * 10);
  const stressContrib = data.voiceStressScore * 0.5;
  const deepSleepContrib = Math.max(0, (20 - data.deepSleepPercent)) * 0.5;
  const factors: RiskExplanation["factors"] = [];

  factors.push({
    label: "Sleep Duration",
    impact: data.sleepHours >= 7 ? "positive" : impactLevel(sleepContrib, [10, 25]),
    detail: data.sleepHours >= 7
      ? `${data.sleepHours}h sleep – adequate for mental recovery`
      : `${data.sleepHours}h sleep – deficit of ${(7 - data.sleepHours).toFixed(1)}h raises depression risk`,
  });

  factors.push({
    label: "Voice Stress",
    impact: data.voiceStressScore <= 30 ? "positive" : impactLevel(stressContrib, [20, 35]),
    detail: data.voiceStressScore <= 30
      ? `Stress score ${data.voiceStressScore} – low stress detected`
      : data.voiceStressScore <= 60
      ? `Stress score ${data.voiceStressScore} – moderate stress contributing to risk`
      : `Stress score ${data.voiceStressScore} – high stress is a major risk factor`,
  });

  factors.push({
    label: "Deep Sleep Quality",
    impact: data.deepSleepPercent >= 20 ? "positive" : impactLevel(deepSleepContrib, [3, 7]),
    detail: data.deepSleepPercent >= 20
      ? `${data.deepSleepPercent}% deep sleep – good restorative sleep`
      : `${data.deepSleepPercent}% deep sleep – below 20% threshold for mental recovery`,
  });

  const drivers = [
    { name: "sleep deficit", val: sleepContrib },
    { name: "voice stress", val: stressContrib },
    { name: "poor deep sleep", val: deepSleepContrib },
  ].sort((a, b) => b.val - a.val);

  return {
    factors,
    summary: sleepContrib + stressContrib + deepSleepContrib < 15
      ? "Mental health indicators are in a healthy range. Maintain good sleep and stress habits."
      : `Key contributor: ${drivers[0].name}. Improving this area would most reduce your depression risk.`,
  };
}

function buildFatigueExplanation(data: BehavioralData): RiskExplanation {
  const sleepContrib = Math.max(0, (7 - data.sleepHours) * 12);
  const deepSleepContrib = Math.max(0, (25 - data.deepSleepPercent)) * 0.4;
  const sedentaryContrib = data.sedentaryHours * 2.5;
  const factors: RiskExplanation["factors"] = [];

  factors.push({
    label: "Sleep Hours",
    impact: data.sleepHours >= 7 ? "positive" : impactLevel(sleepContrib, [12, 30]),
    detail: data.sleepHours >= 7
      ? `${data.sleepHours}h – sufficient recovery time`
      : `${data.sleepHours}h – sleep deficit is the strongest fatigue driver`,
  });

  factors.push({
    label: "Deep Sleep %",
    impact: data.deepSleepPercent >= 25 ? "positive" : impactLevel(deepSleepContrib, [3, 6]),
    detail: data.deepSleepPercent >= 25
      ? `${data.deepSleepPercent}% – optimal restorative sleep`
      : `${data.deepSleepPercent}% – insufficient deep sleep reduces recovery`,
  });

  factors.push({
    label: "Sedentary Time",
    impact: data.sedentaryHours <= 4 ? "positive" : impactLevel(sedentaryContrib, [12, 25]),
    detail: data.sedentaryHours <= 4
      ? `${data.sedentaryHours}h – active lifestyle supports energy`
      : `${data.sedentaryHours}h sedentary – prolonged inactivity worsens fatigue`,
  });

  return {
    factors,
    summary: sleepContrib + deepSleepContrib + sedentaryContrib < 20
      ? "Energy levels look good! Your sleep and activity patterns support recovery."
      : data.sleepHours < 6
      ? "Sleep deficit is your primary fatigue driver. Prioritize 7-8 hours of sleep."
      : "A combination of factors is contributing to fatigue. Focus on sleep quality and reducing sedentary time.",
  };
}

function buildLifestyleExplanation(
  data: BehavioralData,
  sleepScore: number, activityScore: number, stressScore: number, sedentaryScore: number
): RiskExplanation {
  const factors: RiskExplanation["factors"] = [];
  const fmt = (score: number) => `${Math.round(score)}/25 pts`;

  factors.push({
    label: "Sleep",
    impact: sleepScore >= 20 ? "positive" : sleepScore >= 12 ? "moderate" : "high",
    detail: `${fmt(sleepScore)} – ${data.sleepHours}h of recommended 8h`,
  });
  factors.push({
    label: "Activity",
    impact: activityScore >= 20 ? "positive" : activityScore >= 12 ? "moderate" : "high",
    detail: `${fmt(activityScore)} – ${data.dailySteps.toLocaleString()} of 10,000 step goal`,
  });
  factors.push({
    label: "Stress",
    impact: stressScore >= 20 ? "positive" : stressScore >= 12 ? "moderate" : "high",
    detail: `${fmt(stressScore)} – voice stress at ${data.voiceStressScore}/100`,
  });
  factors.push({
    label: "Movement",
    impact: sedentaryScore >= 20 ? "positive" : sedentaryScore >= 12 ? "moderate" : "high",
    detail: `${fmt(sedentaryScore)} – ${data.sedentaryHours}h sedentary of 16h waking`,
  });

  const weakest = [
    { name: "sleep", score: sleepScore },
    { name: "activity", score: activityScore },
    { name: "stress management", score: stressScore },
    { name: "movement", score: sedentaryScore },
  ].sort((a, b) => a.score - b.score)[0];

  const total = sleepScore + activityScore + stressScore + sedentaryScore;
  return {
    factors,
    summary: total >= 80
      ? "Excellent lifestyle balance across all four dimensions!"
      : `Your weakest area is ${weakest.name}. Improving it would have the biggest impact on your overall score.`,
  };
}

// Activity heatmap data
export function generateHeatmapData(): { hour: number; day: string; value: number }[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data: { hour: number; day: string; value: number }[] = [];
  for (const day of days) {
    for (let hour = 6; hour <= 22; hour++) {
      data.push({ hour, day, value: Math.floor(Math.random() * 100) });
    }
  }
  return data;
}

// Chat responses
const healthResponses: Record<string, string> = {
  sleep: "Quality sleep is crucial. Aim for 7-9 hours, maintain a consistent schedule, and avoid screens 1 hour before bed. Deep sleep should ideally be 15-25% of total sleep.",
  stress: "High stress impacts cardiovascular and mental health. Try deep breathing exercises, progressive muscle relaxation, or a 10-minute daily meditation practice.",
  exercise: "Regular physical activity reduces disease risk significantly. Aim for 150 minutes of moderate activity weekly. Even short walks throughout the day help.",
  diet: "A balanced diet rich in fruits, vegetables, whole grains, and lean proteins supports overall health. Stay hydrated with 8+ glasses of water daily.",
  default: "I'm your AI health assistant. I can help with questions about sleep, stress management, exercise, and lifestyle improvements. What would you like to know?"
};

export function getChatResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia')) return healthResponses.sleep;
  if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('worried')) return healthResponses.stress;
  if (lower.includes('exercise') || lower.includes('walk') || lower.includes('activity') || lower.includes('step')) return healthResponses.exercise;
  if (lower.includes('diet') || lower.includes('food') || lower.includes('eat') || lower.includes('nutrition')) return healthResponses.diet;
  return healthResponses.default;
}
