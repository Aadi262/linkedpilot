"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";

type Period = "7d" | "30d" | "90d";

const funnelData = [
  { stage: "Leads Imported", count: 2847, pct: 100, color: "bg-violet-600" },
  { stage: "Connection Sent", count: 2847, pct: 100, color: "bg-violet-500" },
  { stage: "Connection Accepted", count: 1094, pct: 38.4, color: "bg-indigo-500" },
  { stage: "Message Sent", count: 987, pct: 34.7, color: "bg-blue-500" },
  { stage: "Replied", count: 412, pct: 14.5, color: "bg-green-500" },
];

const campaignComparison = [
  { name: "Q1 SaaS Founders", leads: 847, acceptRate: 36.8, replyRate: 10.5, avgDays: 4.2 },
  { name: "Agency Decision Makers", leads: 420, acceptRate: 39.8, replyRate: 12.9, avgDays: 3.8 },
  { name: "Series A Startups NYC", leads: 230, acceptRate: 33.9, replyRate: 9.6, avgDays: 5.1 },
  { name: "VP Sales Re-engagement", leads: 560, acceptRate: 43.4, replyRate: 16.3, avgDays: 3.2 },
  { name: "Fintech CTOs", leads: 310, acceptRate: 38.1, replyRate: 13.2, avgDays: 4.5 },
];

function generateChartData(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    connections: Math.floor(40 + Math.sin(i * 0.4) * 25 + Math.random() * 20),
    replies: Math.floor(8 + Math.sin(i * 0.4 + 1) * 8 + Math.random() * 8),
  }));
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [sortCol, setSortCol] = useState<keyof typeof campaignComparison[0]>("replyRate");
  const [sortAsc, setSortAsc] = useState(false);

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const chartData = generateChartData(days);
  const maxVal = Math.max(...chartData.map((d) => d.connections));

  const sorted = [...campaignComparison].sort((a, b) => {
    const va = a[sortCol] as number;
    const vb = b[sortCol] as number;
    return sortAsc ? va - vb : vb - va;
  });

  const toggleSort = (col: keyof typeof campaignComparison[0]) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const SortIcon = ({ col }: { col: string }) =>
    sortCol === col ? (
      sortAsc ? <TrendingUp className="w-3 h-3 inline ml-1 text-violet-400" /> : <TrendingDown className="w-3 h-3 inline ml-1 text-violet-400" />
    ) : null;

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Analytics</h2>
          <p className="text-gray-500 text-sm mt-0.5">Performance across all campaigns</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {p === "7d" ? "Last 7 days" : p === "30d" ? "Last 30 days" : "Last 90 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-sm font-medium text-white mb-5">Conversion Funnel</h3>
        <div className="space-y-3">
          {funnelData.map(({ stage, count, pct, color }, i) => (
            <div key={stage} className="flex items-center gap-4">
              <div className="w-36 text-xs text-gray-400 text-right flex-shrink-0">{stage}</div>
              <div className="flex-1 bg-white/5 rounded-full h-7 relative overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-semibold text-white">{count.toLocaleString()}</span>
                  <span className="text-xs text-white/60 ml-1">({pct}%)</span>
                </div>
              </div>
              {i < funnelData.length - 1 && (
                <div className="text-xs text-gray-600 w-16 text-center flex-shrink-0">
                  ↓ {Math.round((funnelData[i + 1].count / count) * 100)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Time-series chart */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Activity Over Time</h3>
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Connections</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Replies</span>
          </div>
        </div>
        <div className="h-40 flex items-end gap-0.5">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
              <div className="bg-green-500/60 rounded-sm" style={{ height: `${(d.replies / maxVal) * 100}%` }} />
              <div className="bg-violet-500/70 rounded-sm" style={{ height: `${(d.connections / maxVal) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-700 mt-2">
          <span>Start</span><span>Mid</span><span>Now</span>
        </div>
      </div>

      {/* Campaign comparison table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <h3 className="text-sm font-medium text-white">Campaign Comparison</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell cursor-pointer hover:text-gray-300" onClick={() => toggleSort("leads")}>
                Leads <SortIcon col="leads" />
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300" onClick={() => toggleSort("acceptRate")}>
                Accept Rate <SortIcon col="acceptRate" />
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300" onClick={() => toggleSort("replyRate")}>
                Reply Rate <SortIcon col="replyRate" />
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell cursor-pointer hover:text-gray-300" onClick={() => toggleSort("avgDays")}>
                Avg Days to Reply <SortIcon col="avgDays" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, i) => (
              <tr key={i} className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-sm text-white font-medium">{c.name}</td>
                <td className="px-5 py-3 text-sm text-gray-400 hidden md:table-cell">{c.leads.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-white/10 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${c.acceptRate}%` }} />
                    </div>
                    <span className="text-sm text-gray-300">{c.acceptRate}%</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-white/10 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${c.replyRate * 4}%` }} />
                    </div>
                    <span className="text-sm text-gray-300">{c.replyRate}%</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-400 hidden lg:table-cell">{c.avgDays}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </PageTransition>
  );
}
