import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Footprints, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onStepsFetched: (steps: number) => void;
}

export default function GoogleFitButton({ onStepsFetched }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_fit") === "connected") {
      setConnected(true);
      toast({ title: "Google Fit connected!", description: "Syncing your steps now..." });
      window.history.replaceState({}, "", window.location.pathname);
      fetchSteps();
      return;
    }
    checkConnection();
  }, [user]);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("google-fit-steps", {
        method: "POST",
      });
      if (!error && data?.connected) {
        setConnected(true);
      }
    } catch {
      // Not connected
    }
  };

  const connectGoogleFit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-fit-auth-url", {
        method: "POST",
      });
      if (error) throw error;
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err: any) {
      toast({
        title: "Connection failed",
        description: err.message || "Could not initiate Google Fit connection",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const fetchSteps = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("google-fit-steps", {
        method: "POST",
      });
      if (error) throw error;
      if (data?.steps !== undefined) {
        onStepsFetched(data.steps);
        toast({
          title: "Steps synced!",
          description: `Today's steps: ${data.steps.toLocaleString()}`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Sync failed",
        description: err.message || "Could not fetch steps",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (connected) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={fetchSteps}
        disabled={syncing}
        className="gap-1.5 text-xs"
      >
        {syncing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CheckCircle className="w-3.5 h-3.5 text-primary" />
        )}
        {syncing ? "Syncing..." : "Sync Steps"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={connectGoogleFit}
      disabled={loading}
      className="gap-1.5 text-xs"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Footprints className="w-3.5 h-3.5" />
      )}
      {loading ? "Connecting..." : "Connect Google Fit"}
    </Button>
  );
}
