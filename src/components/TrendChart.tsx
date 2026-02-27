import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { WeeklyTrend } from "@/lib/healthEngine";

export default function TrendChart({ data }: { data: WeeklyTrend[] }) {
  return (
    <div className="bg-card rounded-lg p-5 shadow-card animate-float-up" style={{ animationDelay: '200ms' }}>
      <h3 className="font-display font-semibold text-foreground mb-4">Weekly Risk Trends</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 15%, 50%)" domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(210, 20%, 90%)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: 12
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="heartRisk" name="Heart Risk" stroke="hsl(0, 72%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="depressionRisk" name="Depression" stroke="hsl(260, 60%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="fatigueRisk" name="Fatigue" stroke="hsl(38, 92%, 55%)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="lifestyleScore" name="Lifestyle" stroke="hsl(152, 60%, 45%)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
