import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Heart, Brain, Battery, Activity, Trash2, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HealthRecord {
  id: string;
  date: string;
  sleep_hours: number;
  deep_sleep_percent: number;
  daily_steps: number;
  sedentary_hours: number;
  typing_speed: number;
  voice_stress_score: number;
  heart_risk: number | null;
  depression_risk: number | null;
  fatigue_risk: number | null;
  lifestyle_score: number | null;
  anomaly_detected: boolean | null;
  alerts: string[] | null;
  created_at: string;
}

function RiskBadge({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  const color = value < 35 ? "text-health-good" : value < 65 ? "text-health-warning" : "text-health-danger";
  return <span className={`font-semibold ${color}`}>{value}%</span>;
}

export default function History() {
  const { user } = useAuth();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRecords = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (!error && data) setRecords(data as HealthRecord[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from("health_data").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setRecords(r => r.filter(rec => rec.id !== id));
      toast({ title: "Deleted", description: "Record removed." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <HistoryIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Health History</h2>
            <p className="text-sm text-muted-foreground">Your past submissions and risk assessments</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-card rounded-lg p-8 shadow-card text-center text-muted-foreground">Loading...</div>
        ) : records.length === 0 ? (
          <div className="bg-card rounded-lg p-8 shadow-card text-center">
            <p className="text-muted-foreground">No health data yet. Submit your first entry from the dashboard!</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-card">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sleep</TableHead>
                    <TableHead>Steps</TableHead>
                    <TableHead>Stress</TableHead>
                    <TableHead className="text-center"><Heart className="w-4 h-4 inline" /></TableHead>
                    <TableHead className="text-center"><Brain className="w-4 h-4 inline" /></TableHead>
                    <TableHead className="text-center"><Battery className="w-4 h-4 inline" /></TableHead>
                    <TableHead className="text-center"><Activity className="w-4 h-4 inline" /></TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{format(new Date(r.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{r.sleep_hours}h</TableCell>
                      <TableCell>{r.daily_steps.toLocaleString()}</TableCell>
                      <TableCell>{r.voice_stress_score}</TableCell>
                      <TableCell className="text-center"><RiskBadge value={r.heart_risk} /></TableCell>
                      <TableCell className="text-center"><RiskBadge value={r.depression_risk} /></TableCell>
                      <TableCell className="text-center"><RiskBadge value={r.fatigue_risk} /></TableCell>
                      <TableCell className="text-center"><RiskBadge value={r.lifestyle_score} /></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteRecord(r.id)}>
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </main>
    </div>
  );
}
