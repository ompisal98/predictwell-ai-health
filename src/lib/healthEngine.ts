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

export interface RiskReport {
  heartRisk: number;
  depressionRisk: number;
  fatigueRisk: number;
  lifestyleScore: number;
  anomalyDetected: boolean;
  alerts: string[];
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

  // Heart risk: sedentary lifestyle + low activity increase risk
  const heartRisk = Math.min(100, Math.max(0, Math.floor(
    15 + (data.sedentaryHours * 4) + Math.max(0, (10000 - data.dailySteps) / 200) + fp * 0.5
  )));

  // Depression risk: poor sleep + high stress increase risk
  const depressionRisk = Math.min(100, Math.max(0, Math.floor(
    5 + Math.max(0, (7 - data.sleepHours) * 10) + data.voiceStressScore * 0.5 + Math.max(0, (20 - data.deepSleepPercent)) * 0.5
  )));

  // Fatigue risk: sleep deficit + sedentary behavior
  const fatigueRisk = Math.min(100, Math.max(0, Math.floor(
    10 + Math.max(0, (7 - data.sleepHours) * 12) + Math.max(0, (25 - data.deepSleepPercent)) * 0.4 + data.sedentaryHours * 2.5
  )));

  // Lifestyle score: higher is better — composite of good habits
  const sleepScore = Math.min(25, (data.sleepHours / 8) * 25);
  const activityScore = Math.min(25, (data.dailySteps / 10000) * 25);
  const stressScore = Math.min(25, ((100 - data.voiceStressScore) / 100) * 25);
  const sedentaryScore = Math.min(25, ((16 - data.sedentaryHours) / 16) * 25);
  const lifestyleScore = Math.min(100, Math.max(0, Math.floor(sleepScore + activityScore + stressScore + sedentaryScore)));

  if (data.sleepHours < 5) alerts.push('⚠️ Critical: Sleep below 5 hours – risk of cognitive impairment.');
  if (data.voiceStressScore > 70) alerts.push('⚠️ High stress detected – consider relaxation techniques.');
  if (data.dailySteps < 3000) alerts.push('⚠️ Activity critically low – aim for at least 7,000 steps.');
  if (anomalyDetected) alerts.push('🚨 Anomaly detected – pattern deviates significantly from baseline.');

  return { heartRisk, depressionRisk, fatigueRisk, lifestyleScore, anomalyDetected, alerts };
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
