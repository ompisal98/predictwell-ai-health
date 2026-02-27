import { Activity, Shield } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-foreground text-lg leading-none">PredictWell</h1>
            <p className="text-[10px] text-muted-foreground">Early Disease Risk Predictor</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">HIPAA-Compliant Design</span>
        </div>
      </div>
    </nav>
  );
}
