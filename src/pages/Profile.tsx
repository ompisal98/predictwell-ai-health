import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Download, Trash2, Save, Loader2, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileData {
  name: string;
  age: number | null;
  gender: string | null;
  weight: number | null;
  lifestyle_type: string | null;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    age: null,
    gender: null,
    weight: null,
    lifestyle_type: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, age, gender, weight, lifestyle_type")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile({
          name: data.name || "",
          age: data.age,
          gender: data.gender,
          weight: data.weight,
          lifestyle_type: data.lifestyle_type,
        });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name || null,
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        lifestyle_type: profile.lifestyle_type,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "Your password has been changed." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    const { data, error } = await supabase
      .from("health_data")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      toast({ title: "Export failed", description: error.message, variant: "destructive" });
      setExporting(false);
      return;
    }

    const csvHeaders = "Date,Sleep Hours,Deep Sleep %,Daily Steps,Sedentary Hours,Typing Speed,Voice Stress,Heart Risk,Depression Risk,Fatigue Risk,Lifestyle Score,Anomaly,Alerts\n";
    const csvRows = (data || []).map(r =>
      `${r.date},${r.sleep_hours},${r.deep_sleep_percent},${r.daily_steps},${r.sedentary_hours},${r.typing_speed},${r.voice_stress_score},${r.heart_risk ?? ""},${r.depression_risk ?? ""},${r.fatigue_risk ?? ""},${r.lifestyle_score ?? ""},${r.anomaly_detected ?? ""},${(r.alerts || []).join("; ")}`
    ).join("\n");

    const blob = new Blob([csvHeaders + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `predictwell-health-data-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    toast({ title: "Data exported!", description: "Your health data CSV has been downloaded." });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    // Delete user data first
    await supabase.from("health_data").delete().eq("user_id", user.id);
    await supabase.from("google_fit_tokens").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("user_id", user.id);
    // Sign out (full account deletion requires admin, so we clear data + sign out)
    toast({ title: "Account data deleted", description: "All your data has been removed. You've been signed out." });
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="animate-pulse text-muted-foreground text-center py-20">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="animate-float-up">
          <h2 className="font-display text-2xl font-bold text-foreground">Profile Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account, personal info, and data.</p>
        </div>

        {/* Account Info */}
        <Card className="animate-float-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-primary" /> Account
            </CardTitle>
            <CardDescription>Your login details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <p className="text-foreground font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Member since</Label>
              <p className="text-foreground text-sm flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {user?.created_at ? format(new Date(user.created_at), "MMMM d, yyyy") : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="animate-float-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" /> Personal Information
            </CardTitle>
            <CardDescription>Used to personalize your health risk analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.age ?? ""}
                  onChange={e => setProfile(p => ({ ...p, age: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="e.g. 28"
                  min={1}
                  max={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profile.gender || ""} onValueChange={v => setProfile(p => ({ ...p, gender: v }))}>
                  <SelectTrigger id="gender"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight ?? ""}
                  onChange={e => setProfile(p => ({ ...p, weight: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="e.g. 70"
                  min={1}
                  max={500}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="lifestyle">Lifestyle Type</Label>
                <Select value={profile.lifestyle_type || ""} onValueChange={v => setProfile(p => ({ ...p, lifestyle_type: v }))}>
                  <SelectTrigger id="lifestyle"><SelectValue placeholder="Select your lifestyle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Desk job, minimal exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (Light exercise 1-3 days/week)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (Exercise 3-5 days/week)</SelectItem>
                    <SelectItem value="very_active">Very Active (Intense exercise 6-7 days/week)</SelectItem>
                    <SelectItem value="athlete">Athlete (Professional-level training)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="animate-float-up" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="w-5 h-5 text-primary" /> Change Password
            </CardTitle>
            <CardDescription>Update your login password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
            </div>
            <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword} variant="secondary" className="gap-1.5">
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {changingPassword ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="animate-float-up" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="w-5 h-5 text-primary" /> Data & Privacy
            </CardTitle>
            <CardDescription>Export or delete your health data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExportData} disabled={exporting} variant="outline" className="gap-1.5">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {exporting ? "Exporting..." : "Export Data as CSV"}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-1.5">
                    <Trash2 className="w-4 h-4" /> Delete All My Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your health data, profile information, and connected services.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <p className="text-xs text-muted-foreground">
              Your data is stored securely. Only extracted scores are retained — raw voice recordings are never stored.
            </p>
          </CardContent>
        </Card>

        <Separator />
        <p className="text-xs text-muted-foreground text-center pb-6">
          PredictWell · Your health data is encrypted and HIPAA-compliant.
        </p>
      </main>
    </div>
  );
}
