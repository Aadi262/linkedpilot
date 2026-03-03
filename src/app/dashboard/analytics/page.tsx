import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="h-[calc(100vh-10rem)] rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center mb-4">
        <BarChart2 className="w-7 h-7 text-violet-400" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">Analytics</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Funnel charts, campaign comparison, and time-series data. Coming in Phase 3.
      </p>
    </div>
  );
}
