import { Activity, Shield, History, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/NotificationCenter";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="font-display font-bold text-foreground text-lg leading-none">PredictWell</h1>
            <p className="text-[10px] text-muted-foreground">Early Disease Risk Predictor</p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-3">
            <Shield className="w-3.5 h-3.5" />
            <span>HIPAA-Compliant</span>
          </div>
          <NotificationCenter />
          <Button
            variant={location.pathname === "/history" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => navigate("/history")}
            className="gap-1.5"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
